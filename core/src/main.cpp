#include <emscripten/emscripten.h>
#include <stdint.h>
#include <algorithm>

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    uint64_t findSmartCrop(int width, int height, const uint8_t *__restrict__ pixels)
    {
        // Early exit for very small images
        if (width <= 10 || height <= 10)
            return ((uint64_t)(height >> 1) << 32) | (uint32_t)(width >> 1);

        // Step 1: Fast background color sampling using pointer arithmetic
        // Efficiently compute average RGB values from sampled pixels
        int avgR = 0, avgG = 0, avgB = 0;
        const int samplePoints = 100;
        int step = (width * height) / samplePoints;
        for (int i = 0; i < samplePoints; i++)
        {
            const uint8_t *p = pixels + ((i * step) << 2);
            avgR += p[0];
            avgG += p[1];
            avgB += p[2];
        }
        avgR /= samplePoints;
        avgG /= samplePoints;
        avgB /= samplePoints;

        // Step 2: Initialize grid for region-based analysis
        // Use fixed-size array for optimal L1 cache performance
        const int gridCols = 20;
        const int gridRows = 20;
        float grid[400] = {0};

        const float invCellW = (float)gridCols / width;
        const float invCellH = (float)gridRows / height;
        const int stride = width << 2;
        const float centerX = width * 0.5f, centerY = height * 0.5f;
        const float invMaxDistSq = 1.0f / ((centerX * centerX + centerY * centerY) * 1.5f);

        // Step 3: Populate grid with importance weights
        // Use pointer arithmetic and optimized calculations for performance
        for (int y = 5; y < height - 5; y += 2)
        {
            const int rowBase = (int)(y * invCellH) * gridCols;
            const uint8_t *rowPtr = pixels + (y * stride);

            for (int x = 5; x < width - 5; x += 2)
            {
                const uint8_t *p = rowPtr + (x << 2);
                const int r = p[0], g = p[1], b = p[2];

                // Detect skin tones using optimized bitwise AND
                // Avoids nested conditionals; boolean result auto-converts to 0 or 1
                const bool isSkin = (r > 95) & (g > 40) & (b > 20) & (r > g) & (r > b) & (std::abs(r - g) > 15);

                const float dR = (float)(r - avgR), dG = (float)(g - avgG), dB = (float)(b - avgB);
                float importance = (dR * dR + dG * dG + dB * dB) * 0.001f;

                // Branch-free accumulation: add skin tone bonus without conditional branching
                importance += (float)isSkin * 500.0f;

                // Apply center bias: higher weight for pixels closer to image center
                const float dx = x - centerX, dy = y - centerY;
                const float centerWeight = std::max(0.1f, 1.0f - ((dx * dx + dy * dy) * invMaxDistSq));

                grid[rowBase + (int)(x * invCellW)] += importance * centerWeight;
            }
        }

        // Step 4: Max pooling to find the region with highest importance
        // Evaluates 3x3 neighborhoods to identify the most salient area
        int bestCellX = 10, bestCellY = 10;
        float maxImportance = -1.0f;

        for (int gy = 1; gy < gridRows - 1; gy++)
        {
            for (int gx = 1; gx < gridCols - 1; gx++)
            {
                float regionSum = 0;
                for (int oy = -1; oy <= 1; oy++)
                {
                    int offset = (gy + oy) * gridCols + gx;
                    regionSum += grid[offset - 1] + grid[offset] + grid[offset + 1];
                }
                if (regionSum > maxImportance)
                {
                    maxImportance = regionSum;
                    bestCellX = gx;
                    bestCellY = gy;
                }
            }
        }

        uint32_t resX = (uint32_t)((bestCellX + 0.5f) * (width / (float)gridCols));
        uint32_t resY = (uint32_t)((bestCellY + 0.5f) * (height / (float)gridRows));
        return ((uint64_t)resY << 32) | resX;
    }
}
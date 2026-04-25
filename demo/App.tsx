import { useState, useEffect } from 'react';
import { SmartCropImage } from '../src/components/SmartCropImage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { t } from './i18n/translations';
import type { Language } from './i18n/translations';

/**
 * Demo images for before/after comparison.
 * Each image showcases different use cases:
 * - Portrait focal point detection
 * - Fine detail saliency analysis
 * - Full-length subject composition
 */
const DEMO_IMAGES = [
    {
        id: 1,
        url: './test-img-1.jpg',
        author: 'Marco Montero Pisani',
        source: 'https://unsplash.com/photos/red-and-yellow-mini-figure-on-marble-surface-near-water-fountain-Rqe-hlgoaXY'
    },
];

/**
 * ComparisonSlider - Interactive before/after visualization component.
 * 
 * Features:
 * - Horizontal slider to reveal/hide smart crop result
 * - Desktop and mobile display modes
 * - Attribution links to original photographers
 * - Debug visualization support
 */
interface ComparisonSliderProps {
    imgIndex: number;
    debug: boolean;
    isMobile: boolean;
    language: Language;
    autoPlay?: boolean;
    isHero?: boolean;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ imgIndex, debug, isMobile, language, autoPlay = false, isHero = false }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isHovering, setIsHovering] = useState(false);
    const img = DEMO_IMAGES[imgIndex];
    const containerHeight = isMobile ? '550px' : (isHero ? '500px' : '450px');

    useEffect(() => {
        if (!autoPlay || isHovering) return;
        
        let animationFrame: number;
        let lastTime = Date.now();
        
        const animate = () => {
            const now = Date.now();
            const deltaTime = now - lastTime;
            lastTime = now;
            
            // ~16.67ms per frame for smooth 60fps
            if (deltaTime >= 16) {
                setSliderPos(prev => {
                    const newPos = prev + 0.3;
                    return newPos > 85 ? 15 : newPos;
                });
                lastTime = now;
            }
            
            animationFrame = requestAnimationFrame(animate);
        };
        
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [autoPlay, isHovering]);

    return (
        <div className={`comparison-card ${isMobile ? 'mobile-mode' : ''} ${isHero ? 'hero-slider' : ''}`} 
            style={{
                position: 'relative',
                pointerEvents: 'auto',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <span className="img-tag default-tag">{t(language, 'tag.default')}</span>
            <span className="img-tag smart-tag">{t(language, 'tag.smart_crop')}</span>

            <div className="slider-container" style={{ height: containerHeight }}>
                <div className="img-box smart-layer">
                    <SmartCropImage src={img.url} width="100%" height={containerHeight} debug={debug} alt={t(language, `images.${img.id}.title`)} />
                    <a href={img.source} target="_blank" rel="noreferrer" className="attribution">
                        {t(language, 'tag.photo_by')} {img.author}
                    </a>
                </div>

                <div className="img-box default-layer" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                    <img src={img.url} style={{ width: '100%', height: containerHeight, objectFit: 'cover' }} alt="Original" />
                </div>

                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="slider-input"
                    aria-label="Comparison slider"
                />
                <div className="slider-line" style={{ left: `${sliderPos}%` }}>
                    <div className="slider-handle" />
                </div>
            </div>
            <div className="comparison-info">
                <h3>{t(language, `images.${img.id}.title`)}</h3>
                <p>{t(language, `images.${img.id}.desc`)}</p>
            </div>
        </div>
    );
};

/**
 * Features Grid Component
 */
interface FeatureItemProps {
    icon: React.ReactNode;
    titleKey: string;
    descKey: string;
    language: Language;
}

// SVG Icons
const Icons = {
    Zap: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
    ),
    Lock: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    ),
    Phone: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <path d="M12 18h.01"></path>
        </svg>
    ),
    Globe: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
    ),
    Rocket: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 16.5c-1.5-1.5-2-4-2-4s2.5-.5 4-2"></path>
            <path d="M19.5 4.5c1.5 1.5 2 4 2 4s-2.5.5-4 2"></path>
            <path d="M7 7l10 10M12 2l5.09 15.59M2 12h20"></path>
            <circle cx="12" cy="12" r="1"></circle>
        </svg>
    ),
    HardDrive: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12H2"></path>
            <path d="M20 9H4c-1.105 0-2 .895-2 2v10c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V11c0-1.105-.895-2-2-2z"></path>
            <circle cx="6" cy="20" r="1"></circle>
            <circle cx="12" cy="20" r="1"></circle>
        </svg>
    ),
    Lightbulb: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    )
};

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, titleKey, descKey, language }) => {
    return (
        <div className="feature-item">
            <div className="feature-icon">
                {icon}
            </div>
            <h4>{t(language, titleKey)}</h4>
            <p>{t(language, descKey)}</p>
        </div>
    );
};

/**
 * Main App Component
 */
function AppContent() {
    const [debug, setDebug] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadSliderPos, setUploadSliderPos] = useState(50);
    const [scrolled, setScrolled] = useState(false);
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [maxPoints, setMaxPoints] = useState(1);
    const { language, setLanguage } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setUploadedImage(url);
            setUploadSliderPos(50);
        }
    };

    const handleClearUpload = () => {
        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage);
        }
        setUploadedImage(null);
        setUploadSliderPos(50);
    };

    const themeVars =  {
        '--bg': '#000000',
        '--text': '#ffffff',
        '--accent': '#007AFF',
        '--subtle': '#8E8E93',
        '--border': '#333333',
        '--code-bg': '#1C1C1E',
    }

    return (
        <div className="app-root" style={themeVars as any} data-theme={`${'dark'}`}>
            <style>{`
        :root {
          --accent: #007AFF;
          --bg: #000000;
          --text: #ffffff;
          --subtle: #8E8E93;
          --border: #333333;
          --code-bg: #1C1C1E;
        }
        
        [data-theme="light"] {
          --bg: #FFFFFF;
          --text: #000000;
          --subtle: #8E8E93;
          --border: #E5E5EA;
          --code-bg: #F5F5F7;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body, html {
          background-color: var(--bg);
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Navigation */
        .nav {
          position: sticky;
          top: 0;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          z-index: 999;
          height: 56px;
          display: flex;
          align-items: center;
          transition: none;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .nav-logo {
          font-weight: 700;
          font-size: 18px;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-links a {
          text-decoration: none;
          color: var(--text);
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .nav-links a:hover {
          opacity: 1;
        }

        .nav-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .language-dropdown {
          position: relative;
          display: inline-block;
        }

        .language-flag-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--bg);
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .language-flag-btn:hover {
          border-color: var(--accent);
        }

        .language-flag-btn:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
        }

        .language-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0;
          z-index: 1000;
          animation: slideDown 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .language-option {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          border-radius: 0;
        }

        .language-option:first-child {
          border-radius: 7px 7px 0 0;
        }

        .language-option:last-child {
          border-radius: 0 0 7px 7px;
        }

        .language-option:hover {
          background: rgba(0, 122, 255, 0.1);
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* Sections */
        section {
          padding: 80px 0;
          border-bottom: 1px solid var(--border);
          animation: slideUp 0.6s ease;
        }

        section:last-child {
          border-bottom: none;
        }

        h1 {
          font-size: clamp(42px, 8vw, 72px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          line-height: 1.1;
        }

        h2 {
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 700;
          margin-bottom: 48px;
          letter-spacing: -0.015em;
          line-height: 1.1;
        }

        h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        p {
          color: var(--subtle);
          line-height: 1.7;
          font-size: 15px;
        }

        /* Hero Section */
        .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          text-align: center;
          padding: 80px 0;
          gap: 56px;
          border-bottom: none;
        }

        .hero-content {
          max-width: 720px;
          animation: slideUp 0.6s ease;
        }

        .hero h1 {
          color: var(--text);
          margin-bottom: 12px;
        }

        .hero-subtitle {
          font-size: 18px;
          color: var(--subtle);
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
          animation: slideUp 0.7s ease 0.1s backwards;
        }

        .performance-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--accent);
          border-radius: 16px;
          color: var(--accent);
          text-transform: uppercase;
          margin-bottom: 32px;
          animation: slideUp 0.6s ease 0.05s backwards;
        }

        .performance-badge svg {
          width: 16px;
          height: 16px;
          stroke-width: 2.5;
        }

        .hero-slider {
          max-width: 900px;
          width: 100%;
          animation: slideUp 0.8s ease 0.2s backwards;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          justify-content: center;
          animation: slideUp 0.9s ease 0.3s backwards;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 28px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          letter-spacing: -0.01em;
        }

        .btn-primary {
          background: var(--accent);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: transparent;
          color: var(--accent);
          border: 1.5px solid var(--accent);
        }

        .btn-secondary:hover {
          background: var(--accent);
          color: white;
        }

        /* Info Alert */
        .info-alert {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--subtle);
          padding: 16px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 48px;
          animation: slideUp 0.6s ease;
        }

        .info-alert svg {
          width: 20px;
          height: 20px;
          min-width: 20px;
          margin-top: 2px;
          color: var(--accent);
          stroke-width: 2;
        }

        /* Comparison Card */
        .comparison-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin: 0 auto 80px;
          box-shadow: none;
          transition: border-color 0.3s ease;
          width: 100%;
          animation: slideUp 0.8s ease 0.2s backwards;
          position: relative;
        }

        .comparison-card:hover {
          border-color: var(--accent);
        }

        .comparison-card.hero-slider {
          margin: 40px 0;
        }

        .comparison-card.mobile-mode {
          width: 375px;
          margin-left: auto;
          margin-right: auto;
          border: 8px solid var(--text);
          border-radius: 32px;
        }

        .slider-container {
          position: relative;
          overflow: hidden;
          background: var(--code-bg);
        }

        .img-box {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .smart-layer {
          z-index: 1;
        }

        .default-layer {
          z-index: 2;
        }

        .img-tag {
          position: absolute;
          top: 12px;
          font-size: 10px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          z-index: 10;
          letter-spacing: 0.3px;
          border: none;
          text-transform: uppercase;
        }

        .default-tag {
          left: 12px;
          background: rgba(255, 255, 255, 0.9);
          color: #000000;
        }

        [data-theme="light"] .default-tag {
          background: #F5F5F7;
          color: #000000;
        }

        .smart-tag {
          right: 12px;
          background: var(--accent);
          color: white;
        }

        .slider-input {
          position: absolute;
          appearance: none;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 20;
          cursor: col-resize;
          outline: none;
        }

        .slider-input::-webkit-slider-thumb {
          appearance: none;
          width: 50px;
          height: 100%;
          background: transparent;
        }

        .slider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--accent);
          z-index: 15;
          pointer-events: none;
          transition: width 0.2s ease;
        }

        .slider-input:hover + .slider-line {
          width: 3px;
        }

        .slider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none;
          border: none;
          transition: transform 0.2s ease;
        }

        .slider-input:hover ~ .slider-handle {
          transform: translate(-50%, -50%) scale(1.08);
        }

        .slider-handle::after {
          content: '↔';
          font-weight: 600;
          color: white;
          font-size: 18px;
        }

        .attribution {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 10px;
          color: #fff;
          background: rgba(0, 0, 0, 0.6);
          padding: 6px 10px;
          border-radius: 6px;
          z-index: 998;
          text-decoration: none;
          transition: background-color 0.2s ease;
          border: none;
        }

        .attribution:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .comparison-info {
          padding: 24px;
          background: transparent;
          border-top: 1px solid var(--border);
        }

        .comparison-info h3 {
          margin-bottom: 8px;
        }

        .comparison-info p {
          font-size: 13px;
          line-height: 1.6;
        }

        /* Controls Bar */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
          transition: opacity 0.2s ease;
          user-select: none;
        }

        .switch-label:hover {
          opacity: 0.7;
        }

        input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--accent);
        }

        /* Code Block */
        pre {
          background: var(--code-bg);
          color: var(--text);
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          font-family: 'Menlo', 'Courier New', monospace;
          font-size: 13px;
          overflow-x: auto;
          border: 1px solid var(--border);
          line-height: 1.6;
        }

        /* Table */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
        }

        th {
          text-align: left;
          padding: 12px;
          background: transparent;
          border-bottom: 1px solid var(--border);
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.3px;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          font-size: 13px;
        }

        tr:hover {
          background: rgba(0, 122, 255, 0.03);
        }

        code {
          background: rgba(0, 122, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Menlo', 'Courier New', monospace;
          font-size: 12px;
          color: var(--accent);
        }

        .type-tag {
          font-family: 'Menlo', 'Courier New', monospace;
          color: var(--accent);
          background: rgba(0, 122, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 48px;
        }

        .feature-item {
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 12px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: transparent;
          animation: slideUp 0.6s ease;
          position: relative;
        }

        .feature-item:hover {
          border-color: var(--accent);
          background: rgba(0, 122, 255, 0.02);
        }

        .feature-icon {
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: transparent;
          border-radius: 10px;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          color: var(--accent);
        }

        .feature-item:hover .feature-icon {
          border-color: var(--accent);
          background: rgba(0, 122, 255, 0.05);
          transform: scale(1.08);
        }

        .feature-item h4 {
          font-size: 15px;
        }

        .feature-item p {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
          color: var(--subtle);
        }

        /* Upload Test Section */
        .upload-section {
          padding: 40px;
          border: 2px dashed var(--border);
          border-radius: 12px;
          text-align: center;
          background: transparent;
          margin-bottom: 40px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: none;
        }

        .upload-section:hover {
          border-color: var(--accent);
          background: rgba(0, 122, 255, 0.02);
        }

        .upload-section input[type="file"] {
          display: none;
        }

        .upload-trigger {
          display: inline-block;
          padding: 12px 28px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 16px;
          box-shadow: none;
        }

        .upload-trigger:hover {
          opacity: 0.8;
          transform: translateY(-2px);
        }

        .upload-trigger:active {
          transform: translateY(0);
        }

        .upload-hint {
          color: var(--subtle);
          font-size: 12px;
          margin-top: 8px;
        }

        .upload-clear-btn {
          padding: 6px 14px;
          background: transparent;
          color: var(--accent);
          border: 1px solid var(--accent);
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
          font-weight: 500;
        }

        .upload-clear-btn:hover {
          background: var(--accent);
          color: white;
        }

        /* Footer */
        footer {
          padding: 60px 0;
          text-align: center;
          color: var(--subtle);
          font-size: 12px;
          border-top: 1px solid var(--border);
          background: transparent;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .footer-links a {
          text-decoration: none;
          color: var(--accent);
          transition: opacity 0.2s ease;
          font-weight: 500;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .container {
            padding: 0 20px;
          }

          h1 { 
            font-size: clamp(28px, 8vw, 44px); 
          }

          h2 { 
            font-size: clamp(20px, 6vw, 28px);
          }

          .controls-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          pre {
            font-size: 12px;
            padding: 16px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .comparison-card.mobile-mode {
            width: 100%;
            max-width: 375px;
          }

          section {
            padding: 60px 0;
          }

          .hero {
            min-height: auto;
            padding: 60px 0;
          }

          .hero-cta {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .nav-container {
            padding: 0 16px;
          }

          .upload-section {
            padding: 24px;
          }

          .feature-item {
            padding: 20px;
          }

          .comparison-info {
            padding: 16px;
          }

          footer {
            padding: 40px 0;
          }

          .footer-links {
            gap: 16px;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            gap: 12px;
            padding: 0 12px;
          }

          .hero-subtitle {
            font-size: 15px;
          }

          .btn {
            padding: 10px 20px;
            font-size: 13px;
          }

          table {
            font-size: 11px;
          }

          th, td {
            padding: 8px 6px;
          }
        }
      `}</style>

            {/* Navigation */}
            <nav className="nav" data-scrolled={scrolled}>
                <div className="nav-container">
                    <span className="nav-logo">{t(language, 'nav.home')}</span>
                    <div className="nav-links">
                        <a href="#demo">{t(language, 'nav.demo')}</a>
                        <a href="#test">{t(language, 'nav.test')}</a>
                        <a href="#usage">{t(language, 'nav.usage')}</a>
                        <a href="#api">{t(language, 'nav.api')}</a>
                        <a href="https://github.com/sargisartashyanmain/react-smart-crop" target="_blank" rel="noreferrer">{t(language, 'nav.github')}</a>
                    </div>
                    <div className="nav-controls">
                        <div className="language-dropdown">
                            <button
                                className="language-flag-btn"
                                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                                aria-label="Select language"
                            >
                                {language === 'en' ? '🇺🇸' : '🇷🇺'}
                            </button>
                            {languageMenuOpen && (
                                <div className="language-menu">
                                    <button
                                        className="language-option"
                                        onClick={() => {
                                            setLanguage('en');
                                            setLanguageMenuOpen(false);
                                        }}
                                    >
                                        🇺🇸
                                    </button>
                                    <button
                                        className="language-option"
                                        onClick={() => {
                                            setLanguage('ru');
                                            setLanguageMenuOpen(false);
                                        }}
                                    >
                                        🇷🇺
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container">
                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-content">
                        <h1>{t(language, 'hero.title')}</h1>
                        <p className="hero-subtitle">{t(language, 'hero.subtitle')}</p>
                        <div className="performance-badge"><Icons.Zap /> 100% Client-Side • Zero Latency</div>
                    </div>


                    <div className="hero-cta">
                        <a href='#usage' className="btn btn-primary">{t(language, 'hero.cta')}</a>
                    </div>
                </section>

                {/* Features Section */}
                <section>
                    <h2>{t(language, 'features.title')}</h2>
                    <div className="features-grid">
                        <FeatureItem icon={<Icons.Zap />} titleKey="features.performance" descKey="features.performance_desc" language={language} />
                        <FeatureItem icon={<Icons.Lock />} titleKey="features.privacy" descKey="features.privacy_desc" language={language} />
                        <FeatureItem icon={<Icons.Phone />} titleKey="features.responsive" descKey="features.responsive_desc" language={language} />
                        <FeatureItem icon={<Icons.Globe />} titleKey="features.accessible" descKey="features.accessible_desc" language={language} />
                        <FeatureItem icon={<Icons.Rocket />} titleKey="features.lazyload" descKey="features.lazyload_desc" language={language} />
                        <FeatureItem icon={<Icons.HardDrive />} titleKey="features.memory" descKey="features.memory_desc" language={language} />
                    </div>
                </section>

                {/* Demo Section */}
                <section id="demo">
                    <h2>{t(language, 'demo.title')}</h2>
                    <div className="info-alert">
                        <Icons.Lightbulb />
                        <p>{t(language, 'demo.hint')}</p>
                    </div>

                    <div className="controls-bar">
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={isMobileView}
                                    onChange={() => setIsMobileView(!isMobileView)}
                                />
                                {t(language, 'demo.mobile_view')} {isMobileView && `(${t(language, 'demo.viewport_width')})`}
                            </label>
                            <label className="switch-label">
                                <input
                                    type="checkbox"
                                    checked={debug}
                                    onChange={() => setDebug(!debug)}
                                />
                                {t(language, 'demo.debug_heatmap')}
                            </label>
                        </div>
                    </div>

                    {DEMO_IMAGES.map((_, idx) => (
                        <ComparisonSlider
                            key={idx}
                            imgIndex={idx}
                            debug={debug}
                            isMobile={isMobileView}
                            language={language}
                        />
                    ))}
                </section>

                {/* Test Your Image Section */}
                <section id="test">
                    <h2>{t(language, 'test.title')}</h2>
                    <p>{t(language, 'test.subtitle')}</p>
                    
                    <div className="upload-section">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
                        <h3 style={{ marginBottom: '8px' }}>{t(language, 'test.upload_title')}</h3>
                        <p className="upload-hint">{t(language, 'test.upload_hint')}</p>
                        
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <label htmlFor="image-upload" className="upload-trigger">
                            {uploadedImage ? t(language, 'test.change_image') : t(language, 'test.select_image')}
                        </label>
                        
                        {uploadedImage && (
                            <button className="upload-clear-btn" onClick={handleClearUpload}>
                                {t(language, 'test.clear_image')}
                            </button>
                        )}
                    </div>

                    {uploadedImage && (
                        <div style={{ marginTop: '40px' }}>
                            <div className="controls-bar">
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                    <label className="switch-label">
                                        <input
                                            type="checkbox"
                                            checked={isMobileView}
                                            onChange={() => setIsMobileView(!isMobileView)}
                                        />
                                        {t(language, 'demo.mobile_view')} {isMobileView && `(${t(language, 'demo.viewport_width')})`}
                                    </label>
                                    <label className="switch-label">
                                        <input
                                            type="checkbox"
                                            checked={debug}
                                            onChange={() => setDebug(!debug)}
                                        />
                                        {t(language, 'demo.debug_heatmap')}
                                    </label>
                                </div>
                            </div>

                            <div className={`comparison-card ${isMobileView ? 'mobile-mode' : ''}`} style={{
                                borderColor: 'var(--dark-border)',
                                background: 'var(--dark-card-bg)',
                                position: 'relative',
                            }}>
                                <span className="img-tag default-tag">{t(language, 'tag.default')}</span>
                                <span className="img-tag smart-tag">{t(language, 'tag.smart_crop')}</span>

                                <div className="slider-container" style={{ height: isMobileView ? '550px' : '450px' }}>
                                    <div className="img-box smart-layer">
                                        <SmartCropImage src={uploadedImage} width="100%" height={isMobileView ? '550px' : '450px'} debug={debug} alt="Uploaded image" />
                                    </div>

                                    <div className="img-box default-layer" style={{ clipPath: `inset(0 ${100 - uploadSliderPos}% 0 0)` }}>
                                        <img src={uploadedImage} style={{ width: '100%', height: isMobileView ? '550px' : '450px', objectFit: 'cover' }} alt="Original uploaded image" />
                                    </div>

                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={uploadSliderPos}
                                        onChange={(e) => setUploadSliderPos(Number(e.target.value))}
                                        className="slider-input"
                                        aria-label="Comparison slider for uploaded image"
                                    />
                                    <div className="slider-line upload-comparison-slider-line" style={{ left: `${uploadSliderPos}%` }}>
                                        <div className="slider-handle" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Usage Section */}
                <section id="usage">
                    <h2>{t(language, 'usage.title')}</h2>
                    <p>{t(language, 'usage.subtitle')}</p>
                    <pre>npm install @sargis-artashyan/react-smart-crop</pre>

                    <p style={{ marginTop: '32px', marginBottom: '16px' }}>{t(language, 'usage.example_title')}</p>
                    <pre>{`import React from 'react';
import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export function ${t(language, 'usage.component')}() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <SmartCropImage 
        src="https://example.com/portrait.jpg"
        alt="Profile picture"
      />
    </div>
  );
}`}</pre>
                </section>

                {/* API Section */}
                <section id="api">
                    <h2>{t(language, 'api.title')}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>{t(language, 'api.property')}</th>
                                <th>{t(language, 'api.type')}</th>
                                <th>{t(language, 'api.default')}</th>
                                <th>{t(language, 'api.description')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>src</code></td>
                                <td><span className="type-tag">string</span></td>
                                <td>—</td>
                                <td>{t(language, 'api.src')}</td>
                            </tr>
                            <tr>
                                <td><code>width</code></td>
                                <td><span className="type-tag">number | string</span></td>
                                <td><code>'100%'</code></td>
                                <td>{t(language, 'api.width')}</td>
                            </tr>
                            <tr>
                                <td><code>height</code></td>
                                <td><span className="type-tag">number | string</span></td>
                                <td><code>'100%'</code></td>
                                <td>{t(language, 'api.height')}</td>
                            </tr>
                            <tr>
                                <td><code>debug</code></td>
                                <td><span className="type-tag">boolean</span></td>
                                <td><code>false</code></td>
                                <td>{t(language, 'api.debug')}</td>
                            </tr>
                            <tr>
                                <td><code>className</code></td>
                                <td><span className="type-tag">string</span></td>
                                <td><code>''</code></td>
                                <td>{t(language, 'api.className')}</td>
                            </tr>
                            <tr>
                                <td><code>alt</code></td>
                                <td><span className="type-tag">string</span></td>
                                <td><code>''</code></td>
                                <td>{t(language, 'api.alt')}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* Footer */}
                <footer>
                    <div className="footer-links">
                        <a href="https://github.com/sargisartashyanmain/react-smart-crop" target="_blank" rel="noreferrer">GitHub</a>
                        <a href="https://www.npmjs.com/package/@sargis-artashyan/react-smart-crop" target="_blank" rel="noreferrer">npm</a>
                        <a href="#">{t(language, 'footer.license')}</a>
                    </div>
                    <p>{t(language, 'footer.copyright')} • {t(language, 'footer.location')}</p>
                </footer>
            </div>
        </div>
    );
}

/**
 * Root App with Providers
 */
export function App() {
    return (
        <LanguageProvider>
                <AppContent />
        </LanguageProvider>
    );
}

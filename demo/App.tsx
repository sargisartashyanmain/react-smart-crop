import { useState } from 'react';
import { SmartCropImage } from '../src/components/SmartCropImage';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
        author: 'Kevin Noble',
        source: 'https://unsplash.com/photos/short-coated-brown-dog-on-gray-cliff-gA3Qd2tquMc'
    },
    {
        id: 2,
        url: './test-img-2.jpg',
        author: 'Marco Montero Pisani',
        source: 'https://unsplash.com/photos/red-and-yellow-mini-figure-on-marble-surface-near-water-fountain-Rqe-hlgoaXY'
    },
    {
        id: 3,
        url: './test-img-3.jpg',
        author: 'Muhammad-Taha Ibrahim',
        source: 'https://unsplash.com/photos/girl-standing-beside-bird-cage-p7dr0jQwuyE'
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
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ imgIndex, debug, isMobile, language }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const { isDark } = useTheme();
    const img = DEMO_IMAGES[imgIndex];
    const containerHeight = isMobile ? '550px' : '450px';

    return (
        <div className={`comparison-card ${isMobile ? 'mobile-mode' : ''}`} style={{
            borderColor: isDark ? 'var(--dark-border)' : 'var(--light-border)',
            background: isDark ? 'var(--dark-card-bg)' : 'var(--light-card-bg)',
            position: 'relative',
        }}>
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
    icon: string;
    titleKey: string;
    descKey: string;
    language: Language;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, titleKey, descKey, language }) => {
    const { isDark } = useTheme();
    return (
        <div className="feature-item" style={{
            background: isDark ? 'var(--dark-feature-bg)' : 'var(--light-feature-bg)',
            borderColor: isDark ? 'var(--dark-border)' : 'var(--light-border)',
        }}>
            <div className="feature-icon">{icon}</div>
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
    const { theme, toggleTheme, isDark } = useTheme();
    const { language, setLanguage } = useLanguage();

    const themeVars = isDark ? {
        '--bg': '#0f172a',
        '--text': '#f1f5f9',
        '--accent': '#0ea5e9',
        '--subtle': '#94a3b8',
        '--border': '#1e293b',
        '--code-bg': '#1e293b',
        '--light-border': '#1e293b',
        '--dark-border': '#1e293b',
        '--light-card-bg': '#1e293b',
        '--dark-card-bg': '#0f172a',
        '--light-feature-bg': '#1e293b',
        '--dark-feature-bg': '#0f172a',
        '--nav-bg': '#0f172a',
        '--input-bg': '#1e293b',
    } : {
        '--bg': '#ffffff',
        '--text': '#0f172a',
        '--accent': '#0ea5e9',
        '--subtle': '#64748b',
        '--border': '#e2e8f0',
        '--code-bg': '#f8fafc',
        '--light-border': '#e2e8f0',
        '--dark-border': '#e2e8f0',
        '--light-card-bg': '#ffffff',
        '--dark-card-bg': '#f8fafc',
        '--light-feature-bg': '#f8fafc',
        '--dark-feature-bg': '#f0f9ff',
        '--nav-bg': 'rgba(255,255,255,0.8)',
        '--input-bg': '#f8fafc',
    };

    return (
        <div className="app-root" style={themeVars as any} data-theme={theme}>
            <style>{`
        :root {
          --accent: #0ea5e9;
          --bg: #ffffff;
          --text: #0f172a;
          --subtle: #64748b;
          --border: #e2e8f0;
          --code-bg: #f8fafc;
        }
        
        [data-theme="dark"] {
          --bg: #0f172a;
          --text: #f1f5f9;
          --subtle: #94a3b8;
          --border: #1e293b;
          --code-bg: #1e293b;
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
          background: var(--nav-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          z-index: 999;
          height: 70px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .nav-logo {
          font-weight: 800;
          font-size: 20px;
          background: linear-gradient(135deg, #0ea5e9, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 32px;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-links a {
          text-decoration: none;
          color: inherit;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 0;
          background: var(--accent);
          transition: width 0.3s ease;
        }

        .nav-links a:hover::after {
          width: 100%;
        }

        .nav-controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .language-switch, .theme-toggle {
          display: flex;
          gap: 6px;
          background: var(--code-bg);
          border-radius: 8px;
          padding: 6px;
          border: 1px solid var(--border);
        }

        .lang-btn, .theme-btn {
          padding: 6px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: var(--text);
        }

        .lang-btn.active, .theme-btn.active {
          background: var(--accent);
          color: white;
        }

        .lang-btn:hover, .theme-btn:hover {
          opacity: 0.7;
        }

        /* Container */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          transition: all 0.3s ease;
        }

        /* Sections */
        section {
          padding: 100px 0;
          border-bottom: 1px solid var(--border);
        }

        section:last-child {
          border-bottom: none;
        }

        h1 {
          font-size: clamp(36px, 8vw, 72px);
          font-weight: 800;
          letter-spacing: -0.04em;
          margin-bottom: 16px;
          line-height: 1.1;
        }

        h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        p {
          color: var(--subtle);
          line-height: 1.8;
        }

        /* Hero Section */
        .hero {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 60vh;
        }

        .hero h1 {
          background: linear-gradient(135deg, var(--accent), #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 24px;
        }

        .hero-subtitle {
          font-size: 20px;
          color: var(--subtle);
          max-width: 600px;
          margin-bottom: 40px;
          line-height: 1.8;
        }

        .hero-cta {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .btn {
          padding: 12px 28px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent), #06b6d4);
          color: white;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover {
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--code-bg);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--border);
        }

        /* Info Alert */
        .info-alert {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(14, 165, 233, 0.3);
          color: var(--accent);
          padding: 20px;
          border-radius: 12px;
          font-size: 15px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        /* Comparison Card */
        .comparison-card {
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          margin: 0 auto 60px;
          box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .comparison-card:hover {
          box-shadow: 0 20px 60px -20px rgba(0, 0, 0, 0.2);
        }

        .comparison-card.mobile-mode {
          width: 375px;
          border: 8px solid var(--text);
          border-radius: 40px;
          margin-left: auto;
          margin-right: auto;
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

        .default-layer {
          z-index: 2;
          border-right: 2px solid var(--accent);
        }

        .img-tag {
          position: absolute;
          top: 20px;
          font-size: 11px;
          font-weight: 800;
          padding: 8px 14px;
          border-radius: 6px;
          z-index: 10;
          backdrop-filter: blur(10px);
          letter-spacing: 0.5px;
        }

        .default-tag {
          left: 20px;
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
        }

        .smart-tag {
          right: 20px;
          background: rgba(14, 165, 233, 0.9);
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
          width: 40px;
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
          box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);
        }

        .slider-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);
        }

        .slider-handle::after {
          content: '↔';
          font-weight: 800;
          color: white;
          font-size: 18px;
        }

        .attribution {
          position: absolute;
          bottom: 12px;
          right: 12px;
          font-size: 11px;
          color: #fff;
          background: rgba(0, 0, 0, 0.5);
          padding: 6px 12px;
          border-radius: 6px;
          z-index: 998;
          text-decoration: none;
          backdrop-filter: blur(4px);
          transition: all 0.2s ease;
        }

        .attribution:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        .comparison-info {
          padding: 28px;
          background: var(--dark-card-bg);
        }

        .comparison-info h3 {
          margin-bottom: 12px;
        }

        .comparison-info p {
          font-size: 14px;
          line-height: 1.6;
        }

        /* Controls Bar */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 24px;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--accent);
        }

        /* Code Block */
        pre {
          background: var(--code-bg);
          color: var(--text);
          padding: 24px;
          border-radius: 12px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
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
          padding: 16px;
          background: var(--code-bg);
          border-bottom: 2px solid var(--border);
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
        }

        td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        code {
          background: var(--code-bg);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
          color: var(--accent);
        }

        .type-tag {
          font-family: monospace;
          color: var(--accent);
          background: rgba(14, 165, 233, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        }

        /* Features Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .feature-item {
          padding: 28px;
          border: 1px solid var(--border);
          border-radius: 12px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item:hover {
          border-color: var(--accent);
          box-shadow: 0 10px 30px -10px rgba(14, 165, 233, 0.2);
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 32px;
        }

        .feature-item h4 {
          margin-bottom: 8px;
        }

        .feature-item p {
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        /* Footer */
        footer {
          padding: 60px 0;
          text-align: center;
          color: var(--subtle);
          font-size: 13px;
          border-top: 1px solid var(--border);
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
          transition: opacity 0.2s;
        }

        .footer-links a:hover {
          opacity: 0.7;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          h1 { font-size: clamp(28px, 8vw, 48px); }
          h2 { font-size: 28px; }

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
        }
      `}</style>

            {/* Navigation */}
            <nav className="nav">
                <div className="nav-container">
                    <span className="nav-logo">{t(language, 'nav.home')}</span>
                    <div className="nav-links">
                        <a href="#demo">{t(language, 'nav.demo')}</a>
                        <a href="#usage">{t(language, 'nav.usage')}</a>
                        <a href="#api">{t(language, 'nav.api')}</a>
                        <a href="https://github.com" target="_blank" rel="noreferrer">{t(language, 'nav.github')}</a>
                    </div>
                    <div className="nav-controls">
                        <div className="language-switch">
                            <button
                                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                                onClick={() => setLanguage('en')}
                            >
                                EN
                            </button>
                            <button
                                className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
                                onClick={() => setLanguage('ru')}
                            >
                                РУ
                            </button>
                        </div>
                        <div className="theme-toggle">
                            <button
                                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => toggleTheme()}
                                title={t(language, 'theme.toggle')}
                            >
                                ☀️
                            </button>
                            <button
                                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => toggleTheme()}
                                title={t(language, 'theme.toggle')}
                            >
                                🌙
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container">
                {/* Hero Section */}
                <section className="hero">
                    <h1>{t(language, 'hero.title')}</h1>
                    <p className="hero-subtitle">{t(language, 'hero.subtitle')}</p>
                    <div className="hero-cta">
                        <button className="btn btn-primary">{t(language, 'hero.cta')}</button>
                        <button className="btn btn-secondary">{t(language, 'hero.live_demo')}</button>
                    </div>
                </section>

                {/* Features Section */}
                <section>
                    <h2>{t(language, 'features.title')}</h2>
                    <div className="features-grid">
                        <FeatureItem icon="⚡" titleKey="features.performance" descKey="features.performance_desc" language={language} />
                        <FeatureItem icon="🔒" titleKey="features.privacy" descKey="features.privacy_desc" language={language} />
                        <FeatureItem icon="📱" titleKey="features.responsive" descKey="features.responsive_desc" language={language} />
                        <FeatureItem icon="♿" titleKey="features.accessible" descKey="features.accessible_desc" language={language} />
                        <FeatureItem icon="🚀" titleKey="features.lazyload" descKey="features.lazyload_desc" language={language} />
                        <FeatureItem icon="💾" titleKey="features.memory" descKey="features.memory_desc" language={language} />
                    </div>
                </section>

                {/* Demo Section */}
                <section id="demo">
                    <h2>{t(language, 'demo.title')}</h2>
                    <div className="info-alert">
                        <span>💡</span>
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

                {/* Usage Section */}
                <section id="usage">
                    <h2>{t(language, 'usage.title')}</h2>
                    <p>{t(language, 'usage.subtitle')}</p>
                    <pre>npm install @sargis-artashyan/react-smart-crop</pre>

                    <p style={{ marginTop: '32px', marginBottom: '16px' }}>{t(language, 'usage.example_title')}</p>
                    <pre>{`import { SmartCropImage } from '@sargis-artashyan/react-smart-crop';

export function ${t(language, 'usage.component')}() {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <SmartCropImage 
        src="path/to/image.jpg" 
        alt="Smart crop example"
        debug={false}
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
                        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
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
            <ThemeProvider>
                <AppContent />
            </ThemeProvider>
        </LanguageProvider>
    );
}

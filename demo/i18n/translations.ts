/**
 * Localization module - multilingual support for the demo application.
 * Supports English (en) and Russian (ru).
 */

export type Language = 'en' | 'ru';

export const translations = {
  en: {
    // Navigation & UI
    'nav.home': 'react-smart-crop',
    'nav.demo': 'Demo',
    'nav.test': 'Test',
    'nav.usage': 'Usage',
    'nav.api': 'API',
    'nav.github': 'GitHub',

    // Header & Hero
    'hero.title': 'Smart Image Cropping',
    'hero.subtitle': 'WebAssembly-powered intelligent image cropping for React. 20-30x faster than JavaScript.',
    'hero.cta': 'Get Started',
    'hero.live_demo': 'Live Demo',

    // Demo Section
    'demo.title': 'Interactive Comparison',
    'demo.hint': 'Enable Mobile View to see how the algorithm preserves composition on narrow screens.',
    'demo.mobile_view': 'Mobile View',
    'demo.debug_heatmap': 'Debug Heatmap',
    'demo.viewport_width': 'Viewport: 375px',

    // Test Section
    'test.title': 'Test Your Image',
    'test.subtitle': 'Upload your own image to see how SmartCrop intelligently handles your content.',
    'test.upload_title': 'Upload an Image',
    'test.upload_hint': 'Supported formats: JPG, PNG, WebP, GIF. Maximum file size: 10MB',
    'test.select_image': 'Select Image',
    'test.change_image': 'Change Image',
    'test.clear_image': 'Clear',

    // Image Descriptions
    'images.1.title': 'Portrait Object Focus',
    'images.1.desc': 'Maintains critical subject visibility when transitioning between aspect ratios. Smart crop detects the animal subject and adjusts composition accordingly.',
    'images.2.title': 'Macro Detail Saliency',
    'images.2.desc': 'Algorithm ignores empty space and focuses on fine details. Saliency detection identifies the small objects as primary interest, filtering out background clutter.',
    'images.3.title': 'Girl standing beside bird cage',
    'images.3.desc': 'Full-length portrait correction preserves key scene elements. Smart crop balances the subject with environmental context while maintaining compositional harmony.',

    // Usage Section
    'usage.title': 'Installation',
    'usage.subtitle': 'Install via npm or yarn:',
    'usage.example_title': 'Basic Usage Example:',
    'usage.import': 'import { SmartCropImage } from \'@sargis-artashyan/react-smart-crop\';',
    'usage.component': 'MyGallery',
    'usage.multi_focus_title': 'Multi-focus Support',
    'usage.multi_focus_desc': 'For group photos or complex scenes, you can detect multiple points of interest to implement custom zooming or adaptive carousels.',

    // API Reference
    'api.title': 'API Reference',
    'api.props': 'Component Props',
    'api.property': 'Property',
    'api.type': 'Type',
    'api.default': 'Default',
    'api.description': 'Description',
    'api.src': 'Image URL or path (must support CORS for cross-origin)',
    'api.width': 'Container width (px, %, viewport units)',
    'api.height': 'Container height (px, %, viewport units)',
    'api.debug': 'Enable focal point visualization with pulsing indicator',
    'api.className': 'Custom CSS class for styling and theming',
    'api.alt': 'Alternative text for accessibility',
    'api.maxPoints': 'Maximum number of focal points to detect (returns an array if > 1).',

    // Features
    'features.title': 'Key Features',
    'features.performance': 'Lightning Fast',
    'features.performance_desc': '20-30x faster than JavaScript implementation using C++ compiled to WebAssembly',
    'features.privacy': 'Privacy First',
    'features.privacy_desc': '100% client-side processing. No server uploads, no data collection, complete privacy',
    'features.responsive': 'Responsive',
    'features.responsive_desc': 'Automatically adapts to any container size and aspect ratio',
    'features.accessible': 'Accessible',
    'features.accessible_desc': 'Full ARIA support and keyboard navigation for inclusive experience',
    'features.lazyload': 'Lazy Loading',
    'features.lazyload_desc': 'Defers analysis until component enters viewport',
    'features.memory': 'Memory Efficient',
    'features.memory_desc': 'Automatic cleanup and optimized WASM memory management',

    // Tags
    'tag.smart_crop': 'SMART CROP',
    'tag.default': 'DEFAULT',
    'tag.photo_by': 'Photo by',

    // Footer
    'footer.copyright': '© 2026 WASM Smart Crop Engine',
    'footer.location': 'Developed in Gyumri, Armenia',
    'footer.license': 'MIT License',

    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.toggle': 'Toggle Theme',
  },

  ru: {
    // Navigation & UI
    'nav.home': 'react-smart-crop',
    'nav.demo': 'Демо',
    'nav.test': 'Тест',
    'nav.usage': 'Установка',
    'nav.api': 'API',
    'nav.github': 'GitHub',

    // Header & Hero
    'hero.title': 'Умная обрезка изображений',
    'hero.subtitle': 'Интеллектуальная обрезка изображений для React на WebAssembly. В 20-30 раз быстрее, чем JavaScript.',
    'hero.cta': 'Начать',
    'hero.live_demo': 'Интерактивное демо',

    // Demo Section
    'demo.title': 'Интерактивное сравнение',
    'demo.hint': 'Включите режим мобильного вида, чтобы увидеть, как алгоритм спасает композицию на узких экранах.',
    'demo.mobile_view': 'Мобильный вид',
    'demo.debug_heatmap': 'Визуализация фокуса',
    'demo.viewport_width': 'Экран: 375px',

    // Test Section
    'test.title': 'Протестируйте свое изображение',
    'test.subtitle': 'Загрузите свое изображение, чтобы увидеть, как SmartCrop умно обрабатывает ваш контент.',
    'test.upload_title': 'Загрузить изображение',
    'test.upload_hint': 'Поддерживаемые форматы: JPG, PNG, WebP, GIF. Максимальный размер: 10MB',
    'test.select_image': 'Выбрать изображение',
    'test.change_image': 'Изменить изображение',
    'test.clear_image': 'Очистить',

    // Image Descriptions
    'images.1.title': 'Фокус на объект портрета',
    'images.1.desc': 'Сохраняет видимость основного объекта при переходе между форматами. Алгоритм обнаруживает животное и правильно кадрирует композицию.',
    'images.2.title': 'Выделение мелких деталей',
    'images.2.desc': 'Алгоритм игнорирует пустое пространство и фокусируется на мелких деталях. Обнаруживает малые предметы как основной интерес, отфильтровывая фон.',
    'images.3.title': 'Портрет в полный рост',
    'images.3.desc': 'Сохраняет ключевые элементы сцены при кадрировании портретов. Балансирует между объектом и окружением, сохраняя композиционную гармонию.',

    // Usage Section
    'usage.title': 'Установка',
    'usage.subtitle': 'Установите через npm или yarn:',
    'usage.example_title': 'Пример использования:',
    'usage.import': 'import { SmartCropImage } from \'@sargis-artashyan/react-smart-crop\';',
    'usage.component': 'MyGallery',
    'usage.multi_focus_title': 'Поддержка Multi-focus',
    'usage.multi_focus_desc': 'Для групповых фото или сложных сцен можно находить несколько точек интереса. Это полезно для реализации умного зума или адаптивных каруселей.',

    // API Reference
    'api.title': 'Справочник API',
    'api.props': 'Свойства компонента',
    'api.property': 'Свойство',
    'api.type': 'Тип',
    'api.default': 'По умолчанию',
    'api.description': 'Описание',
    'api.src': 'URL или путь к изображению (должен поддерживать CORS)',
    'api.width': 'Ширина контейнера (px, %, viewport units)',
    'api.height': 'Высота контейнера (px, %, viewport units)',
    'api.debug': 'Показать визуализацию фокусной точки',
    'api.className': 'Дополнительный CSS класс',
    'api.alt': 'Альтернативный текст для доступности',
    'api.maxPoints': 'Максимальное количество точек фокуса. Возвращает массив, если значение больше 1.',

    // Features
    'features.title': 'Ключевые возможности',
    'features.performance': 'Молниеносная скорость',
    'features.performance_desc': 'В 20-30 раз быстрее, чем JavaScript реализация благодаря C++ компилированному в WebAssembly',
    'features.privacy': 'Приватность',
    'features.privacy_desc': 'Полностью клиентская обработка. Никаких загрузок на сервер, сбора данных, полная приватность',
    'features.responsive': 'Адаптивная',
    'features.responsive_desc': 'Автоматически адаптируется к любому размеру и соотношению сторон контейнера',
    'features.accessible': 'Доступная',
    'features.accessible_desc': 'Полная поддержка ARIA и навигации с клавиатуры',
    'features.lazyload': 'Ленивая загрузка',
    'features.lazyload_desc': 'Анализ откладывается до появления компонента в видимой области',
    'features.memory': 'Эффективное управление памятью',
    'features.memory_desc': 'Автоматическая очистка и оптимизированное управление памятью WASM',

    // Tags
    'tag.smart_crop': 'УМНАЯ ОБРЕЗКА',
    'tag.default': 'СТАНДАРТНАЯ',
    'tag.photo_by': 'Фото автора',

    // Footer
    'footer.copyright': '© 2026 WASM Smart Crop Engine',
    'footer.location': 'Разработано в Гюмри, Армения',
    'footer.license': 'Лицензия MIT',

    // Theme
    'theme.light': 'Светлая',
    'theme.dark': 'Тёмная',
    'theme.toggle': 'Переключить тему',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

/**
 * Translation helper function with overloads.
 * Supports both literal keys (for type safety and autocomplete) and dynamic keys (for runtime-generated strings).
 * Returns translated string or fallback to English if not found.
 * 
 * @param language - Target language (en or ru)
 * @param key - Translation key (literal for type checking, or string for dynamic keys)
 * @returns Translated string
 */
export function t(language: Language, key: TranslationKey): string;
export function t(language: Language, key: string): string;
export function t(language: Language, key: string): string {
  const translationRecord = translations[language];
  return (translationRecord[key as TranslationKey] as string) || (translations.en[key as TranslationKey] as string) || key;
}

// Export all translations for reference
export default translations;

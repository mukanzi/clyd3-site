// CLYD3 — Liquid Glass interaction layer
// Adds pointer-reactive specular highlights and shared UI enhancements.

// Readability layer. Loaded after the base styles so non-heading typography
// can be increased without changing the established editorial heading scale.
const readabilityStylesheet = document.createElement('link');
readabilityStylesheet.rel = 'stylesheet';
readabilityStylesheet.href = 'css/readability.css?v=1';
document.head.appendChild(readabilityStylesheet);

// Resilient theme loader. This gives dark mode a second independent path so
// stale cached theme assets cannot leave the toggle visually inert.
const themeFallbackScript = document.createElement('script');
themeFallbackScript.src = 'js/theme-fallback.js?v=3';
themeFallbackScript.defer = true;
document.head.appendChild(themeFallbackScript);

// Toronto weather/time is kept as a separate, optional system layer.
const weatherStylesheet = document.createElement('link');
weatherStylesheet.rel = 'stylesheet';
weatherStylesheet.href = 'css/weather.css?v=1';
document.head.appendChild(weatherStylesheet);

const weatherScript = document.createElement('script');
weatherScript.src = 'js/weather.js?v=1';
weatherScript.defer = true;
document.head.appendChild(weatherScript);

document.addEventListener('DOMContentLoaded', () => {
    const selectors = [
        '.site-header',
        '.constellation-node',
        '.work-node',
        '.work-section .project-tag',
        '.work-section .project-system',
        '.statement-mark',
        '.coming-panel',
        '.panel-status',
        '.contact-side',
        '.contact-section .primary-contact',
        '.system-launch-button'
    ];

    const surfaces = document.querySelectorAll(selectors.join(','));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    surfaces.forEach((surface) => {
        surface.classList.add('liquid-glass-surface');
        if (prefersReducedMotion || !hasFinePointer) return;

        surface.addEventListener('pointermove', (event) => {
            const rect = surface.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            surface.style.setProperty('--glass-x', `${Math.max(0, Math.min(100, x)).toFixed(1)}%`);
            surface.style.setProperty('--glass-y', `${Math.max(0, Math.min(100, y)).toFixed(1)}%`);
        });

        surface.addEventListener('pointerleave', () => {
            surface.style.setProperty('--glass-x', '50%');
            surface.style.setProperty('--glass-y', '50%');
        });
    });
});

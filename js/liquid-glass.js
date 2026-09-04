// CLYD3 — Liquid Glass interaction layer
// Adds pointer-reactive specular highlights without modifying layout or typography.

// Toronto weather/time is kept as a separate, optional system layer. Loading it
// here avoids coupling the live signal to the homepage markup and preserves the
// existing header structure if the weather service is temporarily unavailable.
const weatherStylesheet = document.createElement('link');
weatherStylesheet.rel = 'stylesheet';
weatherStylesheet.href = 'css/weather.css?v=1';
document.head.appendChild(weatherStylesheet);

const weatherScript = document.createElement('script');
weatherScript.src = 'js/weather.js?v=1';
weatherScript.defer = true;
document.head.appendChild(weatherScript);

// Kenya High Court decisions are also modular. The feed is generated from the
// official Kenya Law High Court index and refreshed by GitHub Actions.
const courtStylesheet = document.createElement('link');
courtStylesheet.rel = 'stylesheet';
courtStylesheet.href = 'css/court-feed.css?v=1';
document.head.appendChild(courtStylesheet);

const courtScript = document.createElement('script');
courtScript.src = 'js/court-feed.js?v=1';
courtScript.defer = true;
document.head.appendChild(courtScript);

document.addEventListener('DOMContentLoaded', () => {
    // Force the hero eye onto a unique asset URL so browsers cannot reuse
    // older cached Mangekyo artwork.
    const sharinganImage = document.querySelector('.sharingan-image');
    if (sharinganImage) {
        sharinganImage.src = 'assets/mangekyo-threeblade.svg?v=4';
    }

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
        '.contact-section .primary-contact'
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

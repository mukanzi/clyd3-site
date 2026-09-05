// CLYD3 — Liquid Glass interaction layer
// Adds pointer-reactive specular highlights without modifying layout or typography.

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
    // CLYD3 system modules — each opens in a separate tab/window so the main
    // archive remains in place while visitors explore the interactive systems.
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !document.querySelector('.system-launch-stack')) {
        const launchStack = document.createElement('div');
        launchStack.className = 'system-launch-stack';
        launchStack.innerHTML = `
            <a class="system-launch-button fut-launch-button" href="fut/" target="_blank" rel="noopener noreferrer">
                <span class="system-launch-index">08</span>
                <span>FUT Club Intelligence</span>
                <span class="system-launch-arrow">↗</span>
            </a>
            <a class="system-launch-button music-launch-button" href="music/" target="_blank" rel="noopener noreferrer">
                <span class="system-launch-index system-launch-index--music">09</span>
                <span>Listening Atlas</span>
                <span class="system-launch-arrow system-launch-arrow--music">↗</span>
            </a>
        `;
        heroActions.insertAdjacentElement('afterend', launchStack);

        const style = document.createElement('style');
        style.textContent = `
            .system-launch-stack {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                width: fit-content;
                margin-top: 24px;
            }
            .system-launch-button {
                display: inline-grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;
                gap: 12px;
                min-width: 190px;
                padding: 11px 14px;
                border: 1px solid var(--line);
                border-radius: 999px;
                background: rgba(var(--theme-paper-rgb, 241,239,232),.42);
                -webkit-backdrop-filter: blur(10px);
                backdrop-filter: blur(10px);
                font-family: 'DM Mono', monospace;
                font-size: 9px;
                letter-spacing: .035em;
                text-decoration: none;
                transition: border-color 220ms ease, transform 220ms ease, background-color 220ms ease;
            }
            .system-launch-button:hover,
            .system-launch-button:focus-visible {
                outline: none;
                transform: translateY(-2px);
            }
            .fut-launch-button:hover,
            .fut-launch-button:focus-visible {
                border-color: color-mix(in srgb, var(--teal) 42%, var(--line));
                background: color-mix(in srgb, var(--teal) 4.5%, transparent);
            }
            .music-launch-button:hover,
            .music-launch-button:focus-visible {
                border-color: color-mix(in srgb, #9a8cff 48%, var(--line));
                background: color-mix(in srgb, #9a8cff 5%, transparent);
            }
            .system-launch-index {
                color: var(--teal);
                font-size: 7px;
            }
            .system-launch-index--music { color: #9a8cff; }
            .system-launch-arrow {
                color: var(--crimson);
                font-size: 13px;
                transition: transform 220ms ease;
            }
            .system-launch-arrow--music { color: #ff5aa7; }
            .system-launch-button:hover .system-launch-arrow,
            .system-launch-button:focus-visible .system-launch-arrow { transform: translate(2px,-2px); }
            @media (max-width: 760px) {
                .system-launch-stack { margin-top: 18px; width: 100%; }
                .system-launch-button { min-width: 0; width: 100%; }
            }
        `;
        document.head.appendChild(style);
    }

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

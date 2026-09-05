// CLYD3 — Liquid Glass interaction layer
// Adds pointer-reactive specular highlights without modifying layout or typography.

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
    // FUT Club Intelligence launch — presented as a CLYD3 system module and
    // opened in a separate tab/window so the main archive remains in place.
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !document.querySelector('.fut-launch-button')) {
        const futLink = document.createElement('a');
        futLink.className = 'fut-launch-button';
        futLink.href = 'fut/';
        futLink.target = '_blank';
        futLink.rel = 'noopener noreferrer';
        futLink.innerHTML = '<span class="fut-launch-index">08</span><span>FUT Club Intelligence</span><span class="fut-launch-arrow">↗</span>';
        heroActions.insertAdjacentElement('afterend', futLink);

        const style = document.createElement('style');
        style.textContent = `
            .fut-launch-button {
                display: inline-grid;
                grid-template-columns: auto 1fr auto;
                align-items: center;
                gap: 12px;
                width: fit-content;
                margin-top: 24px;
                padding: 11px 14px;
                border: 1px solid var(--line);
                border-radius: 999px;
                background: rgba(241,239,232,.42);
                -webkit-backdrop-filter: blur(10px);
                backdrop-filter: blur(10px);
                font-family: 'DM Mono', monospace;
                font-size: 9px;
                letter-spacing: .035em;
                transition: border-color 220ms ease, transform 220ms ease, background-color 220ms ease;
            }
            .fut-launch-button:hover,
            .fut-launch-button:focus-visible {
                outline: none;
                transform: translateY(-2px);
                border-color: rgba(13,124,120,.42);
                background: rgba(13,124,120,.045);
            }
            .fut-launch-index {
                color: var(--teal);
                font-size: 7px;
            }
            .fut-launch-arrow {
                color: var(--crimson);
                font-size: 13px;
                transition: transform 220ms ease;
            }
            .fut-launch-button:hover .fut-launch-arrow,
            .fut-launch-button:focus-visible .fut-launch-arrow { transform: translate(2px,-2px); }
            @media (max-width: 760px) { .fut-launch-button { margin-top: 18px; } }
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
        '.fut-launch-button'
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

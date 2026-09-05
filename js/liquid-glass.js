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
    // CLYD3 featured systems — prominent standalone modules that open in a
    // separate tab/window so the main archive remains in place.
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !document.querySelector('.system-launch-stack')) {
        const launchStack = document.createElement('div');
        launchStack.className = 'system-launch-stack';
        launchStack.innerHTML = `
            <div class="system-launch-intro">
                <p class="system-launch-kicker">Featured systems / 08–09</p>
                <p class="system-launch-explainer">Two interactive data projects from the CLYD3 archive. Each opens as its own focused interface for exploring the underlying patterns, signals and personal history.</p>
            </div>
            <div class="system-launch-grid">
                <a class="system-launch-button fut-launch-button" href="fut/" target="_blank" rel="noopener noreferrer" aria-label="Open FUT Club Intelligence in a new tab">
                    <span class="system-launch-accent" aria-hidden="true"></span>
                    <span class="system-launch-meta">
                        <span class="system-launch-index">08 / Football data</span>
                        <span class="system-launch-arrow">↗</span>
                    </span>
                    <strong class="system-launch-title">FUT Club Intelligence</strong>
                    <span class="system-launch-copy">Explore 489 FUT players through usage, performance, evolution paths, squad depth and club-wide patterns.</span>
                    <span class="system-launch-cta">Open system <small>new tab</small></span>
                </a>
                <a class="system-launch-button music-launch-button" href="music/" target="_blank" rel="noopener noreferrer" aria-label="Open Listening Atlas in a new tab">
                    <span class="system-launch-accent" aria-hidden="true"></span>
                    <span class="system-launch-meta">
                        <span class="system-launch-index system-launch-index--music">09 / Music data</span>
                        <span class="system-launch-arrow system-launch-arrow--music">↗</span>
                    </span>
                    <strong class="system-launch-title">Listening Atlas</strong>
                    <span class="system-launch-copy">Explore a decade of listening through artists, sonic trends, platform overlap and the weighted all-time Love Index.</span>
                    <span class="system-launch-cta">Open atlas <small>new tab</small></span>
                </a>
            </div>
        `;
        heroActions.insertAdjacentElement('afterend', launchStack);

        const style = document.createElement('style');
        style.textContent = `
            .system-launch-stack {
                width: min(100%, 760px);
                margin-top: 34px;
            }
            .system-launch-intro {
                display: grid;
                grid-template-columns: minmax(150px, .42fr) minmax(0, 1fr);
                gap: 22px;
                align-items: start;
                padding: 0 2px 15px;
                border-bottom: 1px solid var(--line);
            }
            .system-launch-kicker,
            .system-launch-explainer {
                margin: 0;
            }
            .system-launch-kicker {
                font-family: 'DM Mono', monospace;
                font-size: 8px;
                line-height: 1.5;
                letter-spacing: .08em;
                text-transform: uppercase;
                color: var(--teal);
            }
            .system-launch-explainer {
                max-width: 540px;
                font-size: 12px;
                line-height: 1.55;
                color: var(--soft-ink);
            }
            .system-launch-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            .system-launch-button {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                min-width: 0;
                min-height: 184px;
                padding: 20px 20px 18px;
                overflow: hidden;
                border: 1px solid var(--line);
                border-radius: 16px;
                background: rgba(var(--theme-paper-rgb, 241,239,232),.48);
                -webkit-backdrop-filter: blur(12px);
                backdrop-filter: blur(12px);
                text-decoration: none;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
                transition: border-color 220ms ease, transform 220ms ease, background-color 220ms ease, box-shadow 220ms ease;
            }
            .system-launch-accent {
                position: absolute;
                left: 20px;
                top: 0;
                width: 52px;
                height: 2px;
                background: var(--teal);
                transition: width 260ms cubic-bezier(.2,.7,.2,1);
            }
            .music-launch-button .system-launch-accent { background: var(--crimson); }
            .system-launch-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 14px;
                margin-bottom: 23px;
                font-family: 'DM Mono', monospace;
            }
            .system-launch-index {
                color: var(--teal);
                font-size: 7px;
                line-height: 1;
                letter-spacing: .07em;
                text-transform: uppercase;
            }
            .system-launch-index--music { color: var(--crimson); }
            .system-launch-arrow {
                color: var(--crimson);
                font-size: 16px;
                line-height: 1;
                transition: transform 220ms ease;
            }
            .system-launch-arrow--music { color: var(--teal); }
            .system-launch-title {
                display: block;
                margin-bottom: 9px;
                font-family: 'Inter', Arial, sans-serif;
                font-size: 18px;
                line-height: 1.15;
                letter-spacing: -.035em;
                font-weight: 600;
                color: var(--ink);
            }
            .system-launch-copy {
                display: block;
                max-width: 330px;
                font-size: 11px;
                line-height: 1.55;
                color: var(--soft-ink);
            }
            .system-launch-cta {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: 12px;
                margin-top: auto;
                padding-top: 20px;
                font-family: 'DM Mono', monospace;
                font-size: 8px;
                line-height: 1;
                letter-spacing: .055em;
                text-transform: uppercase;
                color: var(--ink);
            }
            .system-launch-cta small {
                font: inherit;
                color: var(--soft-ink);
                opacity: .72;
            }
            .system-launch-button:hover,
            .system-launch-button:focus-visible {
                outline: none;
                transform: translateY(-3px);
            }
            .system-launch-button:hover .system-launch-accent,
            .system-launch-button:focus-visible .system-launch-accent { width: calc(100% - 40px); }
            .fut-launch-button:hover,
            .fut-launch-button:focus-visible {
                border-color: color-mix(in srgb, var(--teal) 48%, var(--line));
                background: color-mix(in srgb, var(--teal) 5%, rgba(var(--theme-paper-rgb, 241,239,232),.48));
                box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 16px 38px rgba(0,0,0,.06);
            }
            .music-launch-button:hover,
            .music-launch-button:focus-visible {
                border-color: color-mix(in srgb, var(--crimson) 46%, var(--line));
                background: color-mix(in srgb, var(--crimson) 5%, rgba(var(--theme-paper-rgb, 241,239,232),.48));
                box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 16px 38px rgba(0,0,0,.06);
            }
            .system-launch-button:hover .system-launch-arrow,
            .system-launch-button:focus-visible .system-launch-arrow { transform: translate(2px,-2px); }
            @media (max-width: 760px) {
                .system-launch-stack { margin-top: 26px; width: 100%; }
                .system-launch-intro { grid-template-columns: 1fr; gap: 7px; }
                .system-launch-grid { grid-template-columns: 1fr; }
                .system-launch-button { min-height: 168px; }
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

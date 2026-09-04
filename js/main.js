// CLYD3 — theme bootstrapping
// Theme CSS is intentionally modular and loaded by the core script so the
// existing page structure does not need another design-system dependency.
const themeStylesheet = document.createElement('link');
themeStylesheet.rel = 'stylesheet';
themeStylesheet.href = 'css/theme.css?v=1';
document.head.appendChild(themeStylesheet);

// Brand mark styling is kept modular so the identity can evolve without
// coupling logo geometry to the rest of the site layout.
const brandStylesheet = document.createElement('link');
brandStylesheet.rel = 'stylesheet';
brandStylesheet.href = 'css/brand-logo.css?v=1';
document.head.appendChild(brandStylesheet);

// Archive / Notes share one open signal field rather than two dashboard cards.
// Load this after the earlier section and glass layers so it owns the final
// composition without disturbing the rest of the homepage.
const archiveNotesStylesheet = document.createElement('link');
archiveNotesStylesheet.rel = 'stylesheet';
archiveNotesStylesheet.href = 'css/archive-notes-field.css?v=1';
document.head.appendChild(archiveNotesStylesheet);

// Browser-tab identity. SVG stays crisp at favicon sizes and adapts to the
// visitor's browser color scheme. The query string intentionally breaks old
// favicon caches, which browsers tend to hold aggressively.
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/svg+xml';
favicon.href = 'assets/favicon.svg?v=1';
document.head.appendChild(favicon);

const shortcutIcon = document.createElement('link');
shortcutIcon.rel = 'shortcut icon';
shortcutIcon.type = 'image/svg+xml';
shortcutIcon.href = 'assets/favicon.svg?v=1';
document.head.appendChild(shortcutIcon);

const themeStorageKey = 'clyd3-theme';
const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

const readSavedTheme = () => {
    try {
        const value = window.localStorage.getItem(themeStorageKey);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        return null;
    }
};

let hasSavedTheme = Boolean(readSavedTheme());

const resolveTheme = () => {
    const saved = readSavedTheme();
    if (saved) return saved;
    return systemDarkMode.matches ? 'dark' : 'light';
};

const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
};

applyTheme(resolveTheme());

// Replace the legacy C3 orbit mark with the current CLYD3 identity:
// C + oversized love heart pierced by Cupid's arrow + S, surrounded by
// restrained circuit/signal traces that echo the rest of the website.
const brandMark = document.querySelector('.brand-mark');
if (brandMark) {
    brandMark.innerHTML = `
        <svg class="clyd3-brand-logo" viewBox="0 0 240 120" role="img" aria-label="C heart S CLYD3 mark">
            <g class="logo-circuit" aria-hidden="true">
                <path d="M120 17V3M120 103v14M31 60H4M209 60h27" />
                <path d="M88 25V12H76V5M152 25V12h12V5" />
                <path d="M88 95v13H76v8M152 95v13h12v8" />
                <path d="M58 39H43L34 30H18M182 39h15l9-9h16" />
                <path d="M58 81H43l-9 9H18M182 81h15l9 9h16" />
                <path d="M67 29 56 18H45M173 29l11-11h11" />
                <path d="M67 91 56 102H45M173 91l11 11h11" />
            </g>

            <g aria-hidden="true">
                <circle class="logo-node" cx="120" cy="3" r="2.6" />
                <circle class="logo-node" cx="120" cy="117" r="2.6" />
                <circle class="logo-node" cx="4" cy="60" r="2.6" />
                <circle class="logo-node" cx="236" cy="60" r="2.6" />
                <circle class="logo-node logo-node--teal" cx="76" cy="5" r="2.3" />
                <circle class="logo-node logo-node--teal" cx="164" cy="5" r="2.3" />
                <circle class="logo-node logo-node--teal" cx="76" cy="116" r="2.3" />
                <circle class="logo-node logo-node--teal" cx="164" cy="116" r="2.3" />
                <circle class="logo-node logo-node--red" cx="18" cy="30" r="2.1" />
                <circle class="logo-node logo-node--red" cx="222" cy="90" r="2.1" />
            </g>

            <g class="logo-signal" aria-hidden="true">
                <path d="M102 18V31M138 18V31M102 89v13M138 89v13" />
                <path d="M44 50h14M182 50h14M44 70h14M182 70h14" />
            </g>

            <path class="logo-main" d="M69 32C56 23 37 23 26 34C14 46 14 72 26 86C38 99 57 98 70 88" aria-hidden="true" />

            <path class="logo-main logo-heart" d="M120 96L82 60C66 45 68 25 85 18C99 12 113 18 120 31C127 18 141 12 155 18C172 25 174 45 158 60L120 96Z" aria-hidden="true" />

            <path class="logo-main" d="M174 31C185 21 205 22 215 32C222 40 218 49 207 54L188 61C177 65 175 76 183 84C194 95 211 94 220 85" aria-hidden="true" />

            <g class="logo-arrow" aria-hidden="true">
                <path d="M70 17L172 101" />
                <path d="M70 17L57 15M70 17L66 5" />
                <path d="M172 101L157 96M172 101L167 86" />
            </g>
        </svg>
    `;
}

const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const revealItems = document.querySelectorAll('.reveal');
const signalField = document.querySelector('[data-parallax]');
const signalNodes = document.querySelectorAll('.signal-node[data-depth]');
const coordinates = document.querySelector('.cursor-coordinates');
const year = document.querySelector('#current-year');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Light / dark mode selector — inserted into the existing navigation so it
// inherits the CLYD3 header system without changing the page's information architecture.
let themeToggle = null;

if (primaryNav) {
    themeToggle = document.createElement('button');
    themeToggle.type = 'button';
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
        <span class="theme-toggle-dot" aria-hidden="true"></span>
        <span>Mode /</span>
        <span class="theme-toggle-mode">Light</span>
    `;
    primaryNav.appendChild(themeToggle);

    const refreshThemeControl = () => {
        const currentTheme = document.documentElement.dataset.theme || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        const modeLabel = themeToggle.querySelector('.theme-toggle-mode');

        if (modeLabel) modeLabel.textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
        themeToggle.setAttribute('aria-pressed', String(currentTheme === 'dark'));
        themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
        themeToggle.title = `Switch to ${nextTheme} mode`;
    };

    refreshThemeControl();

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

        applyTheme(nextTheme);
        hasSavedTheme = true;

        try {
            window.localStorage.setItem(themeStorageKey, nextTheme);
        } catch {
            // Theme still works for the current session if storage is unavailable.
        }

        refreshThemeControl();
    });

    systemDarkMode.addEventListener?.('change', event => {
        if (hasSavedTheme) return;
        applyTheme(event.matches ? 'dark' : 'light');
        refreshThemeControl();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    body.classList.remove('is-loading');

    requestAnimationFrame(() => {
        document.querySelectorAll('.hero .reveal').forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), index * 120);
        });
    });
});

if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            primaryNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
});

revealItems.forEach(item => {
    if (!item.closest('.hero')) observer.observe(item);
});

const signed = value => {
    const rounded = Math.round(value);
    return `${rounded >= 0 ? '+' : '-'}${String(Math.abs(rounded)).padStart(3, '0')}`;
};

if (signalField && !prefersReducedMotion) {
    signalField.addEventListener('pointermove', event => {
        const rect = signalField.getBoundingClientRect();
        const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
        const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

        signalField.style.setProperty('--field-x', `${normalizedX * 8}px`);
        signalField.style.setProperty('--field-y', `${normalizedY * 8}px`);

        signalNodes.forEach(node => {
            const depth = Number(node.dataset.depth || 1);
            node.style.setProperty('--node-x', `${normalizedX * depth * 14}px`);
            node.style.setProperty('--node-y', `${normalizedY * depth * 14}px`);
        });

        if (coordinates) {
            coordinates.textContent = `X ${signed(normalizedX * 180)} / Y ${signed(normalizedY * 180)}`;
        }
    });

    signalField.addEventListener('pointerleave', () => {
        signalField.style.setProperty('--field-x', '0px');
        signalField.style.setProperty('--field-y', '0px');

        signalNodes.forEach(node => {
            node.style.setProperty('--node-x', '0px');
            node.style.setProperty('--node-y', '0px');
        });

        if (coordinates) coordinates.textContent = 'X +000 / Y +000';
    });
}

if (year) {
    year.textContent = new Date().getFullYear();
}

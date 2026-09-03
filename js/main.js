// CLYD3 — theme bootstrapping
// Theme CSS is intentionally modular and loaded by the core script so the
// existing page structure does not need another design-system dependency.
const themeStylesheet = document.createElement('link');
themeStylesheet.rel = 'stylesheet';
themeStylesheet.href = 'css/theme.css?v=1';
document.head.appendChild(themeStylesheet);

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

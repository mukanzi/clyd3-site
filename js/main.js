const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const revealItems = document.querySelectorAll('.reveal');
const parallaxTarget = document.querySelector('[data-parallax]');
const year = document.querySelector('#current-year');

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

if (parallaxTarget && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('pointermove', event => {
        const x = (event.clientX / window.innerWidth - 0.5) * 10;
        const y = (event.clientY / window.innerHeight - 0.5) * 10;
        parallaxTarget.style.transform = `translate(${x}px, ${y}px)`;
    });
}

if (year) {
    year.textContent = new Date().getFullYear();
}

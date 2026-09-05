// CLYD3 theme fallback runtime.
// This file is intentionally self-contained so dark mode remains functional
// even if the modular theme stylesheet is delayed or served from an old cache.
(() => {
  const KEY = 'clyd3-theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const read = () => {
    try {
      const value = localStorage.getItem(KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch {
      return null;
    }
  };

  const resolve = () => read() || (media.matches ? 'dark' : 'light');

  const apply = (theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  };

  apply(resolve());

  // Critical visual fallback. The full material treatment still lives in
  // css/theme.css, but these rules guarantee an unmistakable theme change.
  const critical = document.createElement('style');
  critical.id = 'clyd3-theme-critical';
  critical.textContent = `
    html[data-theme="dark"] {
      --paper:#101210 !important;
      --ink:#f0eee7 !important;
      --soft-ink:#aaa79f !important;
      --line:rgba(240,238,231,.18) !important;
      --line-soft:rgba(240,238,231,.085) !important;
      --teal:#3ba8a2 !important;
      --crimson:#d05a64 !important;
      background:#101210 !important;
      color-scheme:dark;
    }
    html[data-theme="dark"] body { background:#101210 !important; color:#f0eee7 !important; }
    html[data-theme="dark"] .site-header { background-color:rgba(16,18,16,.88) !important; }
    html[data-theme="dark"] .page-grid { opacity:.19 !important; }
  `;
  document.head.appendChild(critical);

  // Force a fresh theme stylesheet URL to avoid stale cached v1 assets.
  const existing = document.querySelector('link[data-clyd3-theme]');
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/theme.css?v=3';
    link.dataset.clyd3Theme = 'true';
    document.head.appendChild(link);
  }

  // Capture theme toggles at the document level. This works with both the
  // existing dynamic control and any future static control using .theme-toggle.
  document.addEventListener('click', (event) => {
    const control = event.target.closest?.('.theme-toggle');
    if (!control) return;
    queueMicrotask(() => {
      const active = root.dataset.theme === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, active); } catch {}
    });
  });
})();

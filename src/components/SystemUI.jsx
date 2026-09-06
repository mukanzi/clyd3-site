import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'clyd3-theme';

export function ThemeProvider({ children }) {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  const [theme, setTheme] = useState(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) return;
    const onChange = event => {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch {}
      setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

export function Brand({ href='/', systemLabel, compact=false }) {
  return (
    <a className={`c3-brand${compact ? ' c3-brand--compact' : ''}`} href={href} aria-label="CLYD3 home">
      <span className="c3-brand-mark" aria-hidden="true">
        <span className="c3-brand-orbit" />
        <span className="c3-brand-core">C3</span>
        <span className="c3-brand-node" />
      </span>
      <span className="c3-brand-copy">
        <strong>CLYD3</strong>
        {systemLabel && <small>{systemLabel}</small>}
      </span>
    </a>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="c3-theme-toggle" type="button" onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <span className="c3-theme-indicator" aria-hidden="true"><i /></span>
      <span>MODE / <b>{theme.toUpperCase()}</b></span>
    </button>
  );
}

export function Header({
  nav=[],
  systemLabel,
  status='SYSTEM / ONLINE',
  homeHref='/',
  showHomeLink=false,
  weather,
  children
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="c3-header">
      <Brand href={homeHref} systemLabel={systemLabel} />
      <div className="c3-header-meta">
        {weather && <span className="c3-weather">{weather}</span>}
        <span className="c3-status"><i />{status}</span>
      </div>
      <button className="c3-menu-toggle" type="button" onClick={() => setOpen(v => !v)}
        aria-expanded={open} aria-label="Toggle navigation">
        <span>MENU</span><i />
      </button>
      <div className={`c3-header-actions${open ? ' is-open' : ''}`}>
        {showHomeLink && <a className="c3-home-link" href="/">← CLYD3</a>}
        <nav className="c3-nav" aria-label="Primary navigation">
          {nav.map(item => <a key={item.href} href={item.href}>{item.index && <span>{item.index}</span>}{item.label}</a>)}
        </nav>
        {children}
        <ThemeToggle />
      </div>
    </header>
  );
}

export function PageGrid() {
  return <div className="c3-page-grid" aria-hidden="true" />;
}

export function SectionHeading({ index, eyebrow, title, note, action }) {
  return (
    <div className="c3-section-heading">
      <div>
        <p className="c3-eyebrow">{index && <span>{index}</span>}{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {(note || action) && <div className="c3-section-side">{note && <p>{note}</p>}{action}</div>}
    </div>
  );
}

export function FeaturedSystem({ index, title, description, href, meta, accent='teal' }) {
  return (
    <a className={`featured-system featured-system--${accent}`} href={href} target="_blank" rel="noopener noreferrer">
      <div className="featured-system-top">
        <span className="featured-system-index">{index}</span>
        <span className="featured-system-meta">{meta}</span>
        <span className="featured-system-arrow">↗</span>
      </div>
      <div className="featured-system-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="featured-system-footer">
        <span>OPEN INTERACTIVE SYSTEM</span>
        <span>NEW TAB</span>
      </div>
    </a>
  );
}

export function KpiCard({ label, value, note, accent='teal' }) {
  return (
    <article className={`c3-kpi c3-kpi--${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}

export function BarList({ items, valueFormatter=v => v, maxItems=10, accent='teal' }) {
  const shown = items.slice(0, maxItems);
  const max = Math.max(...shown.map(d => Number(d.value) || 0), 1);
  return (
    <div className={`c3-bar-list c3-bar-list--${accent}`}>
      {shown.map((item, i) => (
        <div className="c3-bar-row" key={`${item.label}-${i}`}>
          <span className="c3-bar-label" title={item.label}>{item.label}</span>
          <div className="c3-bar-track"><i style={{width:`${(Number(item.value)||0)/max*100}%`}} /></div>
          <b>{valueFormatter(item.value)}</b>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ children='No matching records.' }) {
  return <div className="c3-empty">{children}</div>;
}

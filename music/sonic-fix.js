(() => {
  const D = window.ATLAS_DATA;
  if (!D || !Array.isArray(D.sonic)) return;

  function drawSonicField() {
    const canvas = document.querySelector('#sonicCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 720;
    const cssH = 420;
    const css = getComputedStyle(document.documentElement);

    const line = css.getPropertyValue('--line-soft').trim() || 'rgba(17,17,17,.09)';
    const soft = css.getPropertyValue('--soft-ink').trim() || '#5f5d57';
    const teal = css.getPropertyValue('--teal').trim() || '#0d7c78';
    const crimson = css.getPropertyValue('--crimson').trim() || '#a63d45';
    const ink = css.getPropertyValue('--ink').trim() || '#111111';

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const pad = 38;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const x = pad + i * (cssW - 2 * pad) / 4;
      const y = pad + i * (cssH - 2 * pad) / 4;
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x, cssH - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(cssW - pad, y);
      ctx.stroke();
    }

    ctx.font = '9px DM Mono, monospace';
    ctx.fillStyle = soft;
    ctx.fillText('low valence', 8, cssH - 18);
    ctx.fillText('high valence', 8, 18);

    const colors = [teal, crimson, ink];
    D.sonic.forEach(([energy, valence], i) => {
      const x = pad + energy * (cssW - 2 * pad);
      const y = cssH - pad - valence * (cssH - 2 * pad);
      ctx.beginPath();
      ctx.arc(x, y, 2.35, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = i % 3 === 0 ? 0.46 : 0.30;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const card = canvas.closest('.chart-card');
    const summary = card?.querySelector('.chart-summary');
    if (summary) summary.textContent = `Each dot = ranked entry · ${D.sonic.length.toLocaleString('en-CA')} points`;
  }

  function install() {
    drawSonicField();
    window.addEventListener('resize', drawSonicField);

    const toggle = document.querySelector('#themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => requestAnimationFrame(drawSonicField));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();

(() => {
  const year = String(new Date().getFullYear());
  ['futYear','futSideYear'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=year; });

  const menu = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menu && sidebar) {
    menu.addEventListener('click', () => requestAnimationFrame(() => {
      menu.setAttribute('aria-expanded', String(sidebar.classList.contains('open')));
    }));
    sidebar.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => menu.setAttribute('aria-expanded','false')));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
      }
    });
  }

  const result = document.getElementById('resultCount');
  if (result) {
    const sync = () => {
      const n = parseInt(result.textContent.replace(/,/g,''),10);
      result.dataset.state = Number.isFinite(n) && n === 0 ? 'empty' : 'ok';
      result.setAttribute('aria-label', Number.isFinite(n) && n === 0 ? 'No matching players' : result.textContent.trim());
    };
    new MutationObserver(sync).observe(result,{childList:true,characterData:true,subtree:true});
    sync();
  }
})();

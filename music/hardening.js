(() => {
  const menu = document.getElementById('atlasMenuToggle');
  const nav = document.getElementById('atlasNav');
  if (menu && nav) {
    const close = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); };
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', e => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && !menu.contains(e.target)) close();
    });
  }

  const year = document.getElementById('musicYear');
  if (year) year.textContent = new Date().getFullYear();

  const rowCount = document.getElementById('rowCount');
  const status = document.getElementById('explorerStatus');
  if (rowCount && status) {
    const sync = () => {
      const count = parseInt(rowCount.textContent, 10);
      if (!Number.isFinite(count)) return;
      const q = document.getElementById('searchInput')?.value.trim();
      status.classList.toggle('is-error', count === 0);
      status.textContent = count === 0
        ? 'No tracks match that search. Try a song title or artist name.'
        : (q ? `${count} matching track${count === 1 ? '' : 's'} found.` : 'Top 100 explorer ready.');
    };
    new MutationObserver(sync).observe(rowCount,{childList:true,characterData:true,subtree:true});
    document.getElementById('searchInput')?.addEventListener('input', () => requestAnimationFrame(sync));
    sync();
  }
})();

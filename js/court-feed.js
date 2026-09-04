(() => {
  const SOURCE_URL = 'https://new.kenyalaw.org/judgments/KEHC/';
  const DATA_URL = 'data/kenya-high-court.json';

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const dateLabel = value => {
    if (!value) return 'Date unavailable';
    const d = new Date(`${value}T12:00:00Z`);
    return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat('en-KE',{day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Nairobi'}).format(d);
  };

  const mount = () => {
    const nav = document.querySelector('.primary-nav');
    const contact = document.querySelector('#contact');
    if (!nav || !contact || document.querySelector('#court-decisions')) return;

    const tab = document.createElement('a');
    tab.className = 'court-tab';
    tab.href = '#court-decisions';
    tab.innerHTML = '<span>06</span>Court';
    nav.insertBefore(tab, nav.querySelector('#court-decisions'));

    const section = document.createElement('section');
    section.id = 'court-decisions';
    section.className = 'court-feed-section section-shell';
    section.innerHTML = `
      <div class="court-feed-head reveal visible">
        <div>
          <p class="eyebrow"><span>007</span> KENYA / HIGH COURT</p>
          <h2>Recent decisions.<br>Direct from Kenya Law.</h2>
        </div>
        <p class="court-feed-intro">A rolling index of newly published decisions from the High Court of Kenya. Titles and links come from Kenya Law, the official law reporter. This is an information feed, not legal advice.</p>
      </div>
      <div class="court-feed-toolbar">
        <span class="court-feed-live" id="court-feed-status">Live feed / loading</span>
        <button class="court-feed-refresh" id="court-feed-refresh" type="button">Refresh ↻</button>
      </div>
      <div class="court-decisions" id="court-decisions-list" aria-live="polite"></div>
      <div class="court-feed-footer">
        <span id="court-feed-updated">Awaiting source sync.</span>
        <a href="${SOURCE_URL}" target="_blank" rel="noopener noreferrer">View all High Court decisions on Kenya Law ↗</a>
      </div>`;
    contact.parentNode.insertBefore(section, contact);

    const list = section.querySelector('#court-decisions-list');
    const status = section.querySelector('#court-feed-status');
    const updated = section.querySelector('#court-feed-updated');
    const refresh = section.querySelector('#court-feed-refresh');

    const render = data => {
      const items = Array.isArray(data?.decisions) ? data.decisions : [];
      if (!items.length) throw new Error('No decisions in feed');
      list.innerHTML = items.slice(0,10).map((item,index) => `
        <a class="court-decision" href="${esc(item.url || SOURCE_URL)}" target="_blank" rel="noopener noreferrer">
          <span class="court-decision-number">${String(index + 1).padStart(2,'0')}</span>
          <div>
            <h3>${esc(item.title)}</h3>
            <p class="court-decision-citation">${esc(item.citation || '')}</p>
          </div>
          <span class="court-decision-meta">${esc(item.type || 'Decision')}<br>${esc(dateLabel(item.date))}</span>
          <span class="court-decision-arrow">↗</span>
        </a>`).join('');
      status.textContent = `Live feed / ${items.length} indexed`;
      const generated = data.generated_at ? new Date(data.generated_at) : null;
      updated.textContent = generated && !Number.isNaN(generated.getTime())
        ? `Feed synced ${new Intl.DateTimeFormat('en-CA',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Toronto'}).format(generated)} Toronto time.`
        : 'Feed synced from Kenya Law.';
    };

    const load = async () => {
      status.textContent = 'Live feed / updating';
      refresh.disabled = true;
      try {
        const response = await fetch(`${DATA_URL}?v=${Date.now()}`, {cache:'no-store'});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        render(await response.json());
      } catch (error) {
        list.innerHTML = '<p class="court-feed-error">The decisions feed is temporarily unavailable. Use the Kenya Law link below to open the official High Court database.</p>';
        status.textContent = 'Live feed / unavailable';
        updated.textContent = 'Automatic sync will retry on the next update cycle.';
        console.warn('Court feed unavailable:', error);
      } finally {
        refresh.disabled = false;
      }
    };

    refresh.addEventListener('click', load);
    load();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
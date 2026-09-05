(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const uniq = arr => [...new Set(arr)];
  const fmt = new Intl.NumberFormat('en-CA');
  const pct = v => `${(v * 100).toFixed(0)}%`;
  const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const median = arr => {
    if (!arr.length) return 0;
    const s=[...arr].sort((a,b)=>a-b), m=Math.floor(s.length/2);
    return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
  };
  const palette = ['#77f5da','#ff5aa7','#9a8cff','#f3dd6d','#ff9b6a','#6fc8ff','#d8ff8a','#d98dff'];

  const state = { year:'All', platform:'All', trendMetric:'energy', search:'', genre:'All' };
  const cleanAge = r => Number.isFinite(r.analysisReleaseAge) ? r.analysisReleaseAge : null;
  const canonicalText = v => String(v ?? '').trim().toLocaleLowerCase('en').replace(/[’‘]/g, "'").replace(/\s+/g,' ');
  const trackKey = r => `${canonicalText(r.song)}|||${canonicalText(r.artist)}`;
  const listKey = r => `${r.playlistYear}|||${r.platform}`;

  const years = uniq(MUSIC_DATA.map(d=>d.playlistYear)).sort((a,b)=>a-b);
  const platforms = uniq(MUSIC_DATA.map(d=>d.platform)).sort();
  const genres = uniq(MUSIC_DATA.map(d=>d.genreGroup)).sort();
  years.forEach(y => $('#yearFilter').insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`));
  platforms.forEach(p => $('#platformFilter').insertAdjacentHTML('beforeend', `<option>${p}</option>`));
  genres.forEach(g => $('#genreFilter').insertAdjacentHTML('beforeend', `<option>${g}</option>`));

  function filteredData({includeSearch=false}={}) {
    return MUSIC_DATA.filter(r => {
      if (state.year !== 'All' && String(r.playlistYear) !== state.year) return false;
      if (state.platform !== 'All' && r.platform !== state.platform) return false;
      if (includeSearch && state.genre !== 'All' && r.genreGroup !== state.genre) return false;
      if (includeSearch && state.search) {
        const hay = `${r.song} ${r.artist} ${r.album} ${r.genre} ${r.feature}`.toLowerCase();
        if (!hay.includes(state.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  function groupCounts(data, keyFn) {
    const map = new Map();
    data.forEach(r => { const k=keyFn(r); map.set(k,(map.get(k)||0)+1); });
    return [...map.entries()].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
  }

  function aggregateArtists(data) {
    const map=new Map();
    data.forEach(r => {
      const k=canonicalText(r.artist);
      if(!map.has(k)) map.set(k,{artist:r.artist,entries:0,tracks:new Set(),years:new Set(),platforms:new Set(),score:0,ranks:[]});
      const a=map.get(k); a.entries++; a.tracks.add(canonicalText(r.song)); a.years.add(r.playlistYear); a.platforms.add(r.platform); a.score += 101-r.rank; a.ranks.push(r.rank);
    });
    return [...map.values()].map(a=>({...a,tracks:a.tracks.size,years:a.years.size,platforms:a.platforms.size,avgRank:mean(a.ranks)})).sort((a,b)=>b.score-a.score);
  }

  function aggregateLoveTracks(data=MUSIC_DATA) {
    const grouped=new Map();
    data.forEach(r => {
      const k=trackKey(r);
      if(!grouped.has(k)) grouped.set(k,{song:r.song,artist:r.artist,rawEntries:0,byList:new Map()});
      const t=grouped.get(k); t.rawEntries++;
      const lk=listKey(r), current=t.byList.get(lk);
      if(!current || r.rank<current.rank) t.byList.set(lk,r);
    });

    const tracks=[...grouped.values()].map(t=>{
      const rows=[...t.byList.values()];
      const ranks=rows.map(r=>r.rank);
      const years=new Set(rows.map(r=>r.playlistYear));
      const platforms=new Set(rows.map(r=>r.platform));
      const yearPlatforms=new Map();
      rows.forEach(r=>{ if(!yearPlatforms.has(r.playlistYear)) yearPlatforms.set(r.playlistYear,new Set()); yearPlatforms.get(r.playlistYear).add(r.platform); });
      const crossPlatformYears=[...yearPlatforms.entries()].filter(([,ps])=>ps.size>=2).map(([y])=>y);
      return {
        song:t.song, artist:t.artist, rawEntries:t.rawEntries, appearances:rows.length,
        years:years.size, platforms:platforms.size, crossPlatformYears:crossPlatformYears.length,
        rankEvidence:ranks.reduce((a,r)=>a+(101-r),0), bestRank:Math.min(...ranks), avgRank:mean(ranks),
        first:Math.min(...years), last:Math.max(...years), platformNames:[...platforms].sort(),
        yearNames:[...years].sort((a,b)=>a-b), crossYearNames:crossPlatformYears.sort((a,b)=>a-b)
      };
    });

    const maxEvidence=Math.max(...tracks.map(t=>t.rankEvidence),1);
    const maxYears=Math.max(...tracks.map(t=>t.years),1);
    const maxPlatforms=Math.max(...tracks.map(t=>t.platforms),1);
    const maxCross=Math.max(...tracks.map(t=>t.crossPlatformYears),0);
    tracks.forEach(t=>{
      const rankComponent=t.rankEvidence/maxEvidence;
      const yearComponent=maxYears>1?(t.years-1)/(maxYears-1):0;
      const platformComponent=maxPlatforms>1?(t.platforms-1)/(maxPlatforms-1):0;
      const crossComponent=maxCross?t.crossPlatformYears/maxCross:0;
      t.loveIndex=60*rankComponent+20*yearComponent+15*platformComponent+5*crossComponent;
    });
    return tracks.sort((a,b)=>b.loveIndex-a.loveIndex || b.rankEvidence-a.rankEvidence || b.appearances-a.appearances || a.avgRank-b.avgRank);
  }

  function renderKPIs(data) {
    const uniqueTracks=uniq(data.map(trackKey)).length;
    const uniqueArtists=uniq(data.map(r=>canonicalText(r.artist))).length;
    const ages=data.map(cleanAge).filter(v=>v!==null);
    const energy=mean(data.map(r=>r.energy));
    const recent=data.filter(r=>cleanAge(r)!==null && cleanAge(r)<=2).length / Math.max(1, ages.length);
    const kpis=[
      ['Ranked entries',fmt.format(data.length),'archive observations','var(--cyan)'],
      ['Unique tracks',fmt.format(uniqueTracks),'distinct song + artist pairs','var(--magenta)'],
      ['Unique artists',fmt.format(uniqueArtists),'primary artists','var(--violet)'],
      ['Median catalog age',`${median(ages).toFixed(0)} yrs`,'release age at ranking','var(--yellow)'],
      ['Recent music',pct(recent),'released within 2 years','var(--orange)']
    ];
    $('#kpiGrid').innerHTML=kpis.map(([l,v,s,c])=>`<article class="kpi-card" style="--accent:${c}"><small>${l}</small><b>${v}</b><span>${s}</span></article>`).join('');
    return {energy};
  }

  function renderBars(el, items, formatter=v=>fmt.format(v), maxItems=8) {
    const arr=items.slice(0,maxItems); const max=Math.max(...arr.map(d=>d.value),1);
    el.innerHTML=arr.map((d,i)=>`<div class="bar-row"><span class="bar-label" title="${escapeHTML(d.label)}">${escapeHTML(d.label)}</span><div class="bar-track"><div class="bar-fill" style="background:linear-gradient(90deg,${palette[i%palette.length]},${palette[(i+2)%palette.length]});width:${(d.value/max*100).toFixed(1)}%"></div></div><span class="bar-value">${formatter(d.value)}</span></div>`).join('');
  }

  function renderOverview(data) {
    renderKPIs(data);
    const genreCounts=groupCounts(data,r=>r.genreGroup), total=Math.max(1,data.length);
    renderBars($('#genreBars'), genreCounts, v=>`${(v/total*100).toFixed(1)}%`, 8);
    if (genreCounts.length) {
      const top=genreCounts[0];
      $('#dominantGenreCopy').textContent=`${top.label} accounts for ${(top.value/total*100).toFixed(1)}% of the current selection. Across the full archive, the category becomes especially dominant during the trance-heavy middle and later years.`;
    }
    const e=mean(data.map(r=>r.energy)), v=mean(data.map(r=>r.valence)), bpm=mean(data.map(r=>r.bpm));
    $('#energyValue').textContent=e.toFixed(2); $('#valenceValue').textContent=v.toFixed(2);
    $('.ring-stat:nth-child(1)').style.cssText += `--pct:${e*100};--ring-color:var(--cyan);`;
    $('.ring-stat:nth-child(2)').style.cssText += `--pct:${v*100};--ring-color:var(--magenta);`;
    $('#sonicCopy').textContent=`Average tempo is ${bpm.toFixed(0)} BPM, with energy at ${e.toFixed(2)} and valence at ${v.toFixed(2)}. The archive leans lively and emotionally positive rather than low-key or sombre.`;
  }

  function annualSeries(metric) {
    const source = state.platform==='All' ? MUSIC_DATA : MUSIC_DATA.filter(r=>r.platform===state.platform);
    return years.map(y => {
      const rows=source.filter(r=>r.playlistYear===y);
      let vals=[];
      if(metric==='energy') vals=rows.map(r=>r.energy);
      if(metric==='bpm') vals=rows.map(r=>r.bpm);
      if(metric==='releaseAge') vals=rows.map(cleanAge).filter(v=>v!==null);
      return {year:y,value:vals.length?mean(vals):null,n:rows.length};
    }).filter(d=>d.value!==null);
  }

  function renderTrend() {
    const metric=state.trendMetric; const s=annualSeries(metric);
    const cfg={
      energy:{title:'Average energy by year',format:v=>v.toFixed(2),summary:'Energy rises notably in 2019–2022 and again in 2025.'},
      bpm:{title:'Average tempo by year',format:v=>`${v.toFixed(0)} BPM`,summary:'Tempo broadly moves upward as electronic/trance becomes more prominent.'},
      releaseAge:{title:'Average release age by year',format:v=>`${v.toFixed(1)} yrs`,summary:'The catalog gets markedly older again in 2024–2025.'}
    }[metric];
    $('#trendTitle').textContent=cfg.title; $('#trendSummary').textContent=cfg.summary;
    if(!s.length){ $('#trendChart').innerHTML='<p>No data for this selection.</p>'; return; }
    const W=920,H=330,pad={l:45,r:22,t:28,b:38};
    const vals=s.map(d=>d.value), min=Math.min(...vals), max=Math.max(...vals), span=(max-min)||1;
    const extra=span*.18, lo=min-extra, hi=max+extra;
    const x=i=>pad.l+i*((W-pad.l-pad.r)/Math.max(1,s.length-1));
    const y=v=>pad.t+(hi-v)/(hi-lo)*(H-pad.t-pad.b);
    const pts=s.map((d,i)=>`${x(i)},${y(d.value)}`).join(' ');
    let grid='';
    for(let i=0;i<5;i++){
      const yy=pad.t+i*(H-pad.t-pad.b)/4;
      const val=hi-i*(hi-lo)/4;
      grid+=`<line x1="${pad.l}" y1="${yy}" x2="${W-pad.r}" y2="${yy}" class="chart-grid-line"/><text x="4" y="${yy+3}" class="chart-axis-label">${cfg.format(val)}</text>`;
    }
    const labels=s.map((d,i)=>`<text x="${x(i)}" y="${H-12}" text-anchor="middle" class="chart-axis-label">${d.year}</text>`).join('');
    const dots=s.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d.value)}" r="5" class="chart-dot"/><text x="${x(i)}" y="${y(d.value)-12}" text-anchor="middle" class="chart-value">${cfg.format(d.value)}</text>`).join('');
    const area=`${pad.l},${H-pad.b} ${pts} ${x(s.length-1)},${H-pad.b}`;
    $('#trendChart').innerHTML=`<svg class="trend-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${cfg.title}"><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#77f5da" stop-opacity=".19"/><stop offset="100%" stop-color="#77f5da" stop-opacity="0"/></linearGradient></defs>${grid}<polygon points="${area}" class="chart-area"/><polyline points="${pts}" class="chart-line"/>${dots}${labels}</svg>`;
  }

  function renderAgeAndDecades(data) {
    const ageDefs=[['0–1 yrs',a=>a<=1],['2–5 yrs',a=>a>=2&&a<=5],['6–10 yrs',a=>a>=6&&a<=10],['11–20 yrs',a=>a>=11&&a<=20],['20+ yrs',a=>a>20]];
    const ages=data.map(cleanAge).filter(v=>v!==null), n=Math.max(1,ages.length);
    $('#ageBuckets').innerHTML=ageDefs.map(([label,fn],i)=>{const c=ages.filter(fn).length;return `<div class="stack-item"><span>${label}</span><div class="stack-track"><div class="stack-fill" style="width:${c/n*100}%;background:linear-gradient(90deg,${palette[(i+1)%palette.length]},${palette[(i+3)%palette.length]})"></div></div><span>${(c/n*100).toFixed(0)}%</span></div>`}).join('');
    const dec=groupCounts(data,r=>r.decade);
    renderBars($('#decadeBars'),dec,v=>`${(v/data.length*100).toFixed(1)}%`,8);
  }

  function renderArtists(data) {
    const artists=aggregateArtists(data);
    renderBars($('#artistBars'),artists.map(a=>({label:a.artist,value:a.score})),v=>fmt.format(v),10);
    const top=artists[0];
    if(top){
      $('#artistSpotlight').innerHTML=`<div><p class="card-kicker">ARTIST SPOTLIGHT</p><div class="big-number">${top.entries}</div><p class="spot-name">${escapeHTML(top.artist)}</p><p class="spot-meta">${top.tracks} distinct tracks • ${top.years} playlist years • ${top.platforms} platform${top.platforms===1?'':'s'}<br>Average rank ${top.avgRank.toFixed(1)} • weighted score ${fmt.format(top.score)}</p></div><p class="spot-meta">This is the strongest rank-weighted artist presence in the current selection.</p>`;
    }
    $('#artistTable').innerHTML=artists.slice(0,12).map(a=>`<tr><td><strong>${escapeHTML(a.artist)}</strong></td><td>${a.entries}</td><td>${a.tracks}</td><td>${a.years}</td><td>Avg rank ${a.avgRank.toFixed(1)}</td></tr>`).join('');
  }

  function renderTracks() {
    const tracks=aggregateLoveTracks(MUSIC_DATA);
    $('#trackCards').innerHTML=tracks.slice(0,6).map((t,i)=>`<article class="track-card" data-index="${String(i+1).padStart(2,'0')}"><div><span class="track-rank">#${i+1} ALL-TIME LOVE</span><h3>${escapeHTML(t.song)}</h3><p class="artist">${escapeHTML(t.artist)}</p><div class="love-score"><b>${t.loveIndex.toFixed(1)}</b><small>/ 100 love index</small></div><div class="love-meter"><i style="width:${Math.min(100,t.loveIndex)}%"></i></div></div><div><p class="love-detail">${t.appearances} distinct year/platform chart appearances${t.rawEntries!==t.appearances?` (${t.rawEntries} raw rows)`:''} • ${t.years} years • ${t.platforms} platforms${t.crossPlatformYears?` • ${t.crossPlatformYears} cross-platform year${t.crossPlatformYears===1?'':'s'}`:''}</p><div class="track-meta"><span>best #${t.bestRank}</span><span>avg rank ${t.avgRank.toFixed(1)}</span><span>${t.first}–${t.last}</span></div></div></article>`).join('');

    const top100=tracks.slice(0,100);
    $('#loveSummary').innerHTML=`<strong>${top100.length} songs</strong> ranked from the complete 2016–2025 archive. #1 is <strong>${escapeHTML(top100[0].song)}</strong> by ${escapeHTML(top100[0].artist)} with a Love Index of <strong>${top100[0].loveIndex.toFixed(1)}</strong>.`;
    $('#loveTable').innerHTML=top100.map((t,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHTML(t.song)}</strong></td><td>${escapeHTML(t.artist)}</td><td><span class="love-index-pill">${t.loveIndex.toFixed(1)}</span></td><td>${t.appearances}${t.rawEntries!==t.appearances?` <small title="Raw rows before same-chart deduplication">(${t.rawEntries} raw)</small>`:''}</td><td>${t.years}</td><td><span class="platform-dots" title="${escapeHTML(t.platformNames.join(', '))}">${Array.from({length:t.platforms},()=>'<i></i>').join('')}</span> ${t.platforms}</td><td>${t.crossPlatformYears}</td><td>#${t.bestRank}</td><td>${t.avgRank.toFixed(1)}</td></tr>`).join('');
  }

  function renderScatter(data) {
    const canvas=$('#sonicCanvas'), ctx=canvas.getContext('2d');
    const dpr=window.devicePixelRatio||1, cssW=canvas.clientWidth||720, cssH=420;
    canvas.width=cssW*dpr; canvas.height=cssH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssW,cssH);
    const pad=38;
    ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){ const x=pad+i*(cssW-2*pad)/4, y=pad+i*(cssH-2*pad)/4; ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,cssH-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(cssW-pad,y);ctx.stroke(); }
    ctx.font='10px system-ui'; ctx.fillStyle='#717786';
    ctx.fillText('low valence',8,cssH-18); ctx.fillText('high valence',8,18);
    data.forEach((r,i)=>{
      const x=pad+r.energy*(cssW-2*pad), y=cssH-pad-r.valence*(cssH-2*pad);
      ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2); ctx.fillStyle=i%3===0?'rgba(119,245,218,.42)':i%3===1?'rgba(255,90,167,.28)':'rgba(154,140,255,.28)'; ctx.fill();
    });
  }

  function renderOverlap() {
    const pairs=[];
    years.forEach(y=>{
      const ps=uniq(MUSIC_DATA.filter(r=>r.playlistYear===y).map(r=>r.platform));
      if(ps.length<2)return;
      for(let i=0;i<ps.length;i++) for(let j=i+1;j<ps.length;j++){
        const a=new Set(MUSIC_DATA.filter(r=>r.playlistYear===y&&r.platform===ps[i]).map(trackKey));
        const b=new Set(MUSIC_DATA.filter(r=>r.playlistYear===y&&r.platform===ps[j]).map(trackKey));
        const overlap=[...a].filter(k=>b.has(k)).length;
        pairs.push({year:y,a:ps[i],b:ps[j],overlap,share:overlap/Math.min(a.size,b.size)});
      }
    });
    $('#platformOverlap').innerHTML=pairs.map(p=>`<div class="overlap-row"><b>${p.year}</b><div><div style="font-size:11px;margin-bottom:6px">${p.a} ↔ ${p.b} · ${p.overlap} shared tracks</div><div class="overlap-track"><i style="width:${p.share*100}%"></i></div></div><span>${(p.share*100).toFixed(0)}%</span></div>`).join('');
  }

  function renderExplorer() {
    const rows=filteredData({includeSearch:true}).sort((a,b)=>b.playlistYear-a.playlistYear || a.rank-b.rank);
    $('#rowCount').textContent=`${fmt.format(rows.length)} matches`;
    $('#dataTable').innerHTML=rows.slice(0,100).map(r=>`<tr><td>#${r.rank}</td><td><strong>${escapeHTML(r.song)}</strong></td><td>${escapeHTML(r.artist)}</td><td>${r.playlistYear}</td><td>${r.platform}</td><td>${escapeHTML(r.genre)}</td><td>${r.releaseYear}</td><td>${r.energy.toFixed(2)}</td></tr>`).join('');
  }

  function escapeHTML(str='') { return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }

  function renderAll() {
    const data=filteredData();
    renderOverview(data); renderTrend(); renderAgeAndDecades(data); renderArtists(data); renderTracks(); renderScatter(data); renderExplorer();
  }

  $('#yearFilter').addEventListener('change',e=>{state.year=e.target.value;renderAll();});
  $('#platformFilter').addEventListener('change',e=>{state.platform=e.target.value;renderAll();});
  $('#genreFilter').addEventListener('change',e=>{state.genre=e.target.value;renderExplorer();});
  $('#searchInput').addEventListener('input',e=>{state.search=e.target.value;renderExplorer();});
  $('#resetFilters').addEventListener('click',()=>{state.year='All';state.platform='All';state.genre='All';state.search='';$('#yearFilter').value='All';$('#platformFilter').value='All';$('#genreFilter').value='All';$('#searchInput').value='';renderAll();});
  $$('.trend-button').forEach(btn=>btn.addEventListener('click',()=>{ $$('.trend-button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.trendMetric=btn.dataset.metric;renderTrend(); }));
  window.addEventListener('resize',()=>renderScatter(filteredData()));

  renderOverlap(); renderAll();
})();
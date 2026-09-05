(() => {
  const D=window.ATLAS_DATA;
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const fmt=new Intl.NumberFormat('en-CA');
  const palette=['#77f5da','#ff5aa7','#9a8cff','#f3dd6d','#ff9b6a','#6fc8ff','#d8ff8a','#d98dff'];
  const state={trendMetric:'energy',search:''};
  const escapeHTML=(str='')=>String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

  function renderBars(el,items,formatter=v=>fmt.format(v),maxItems=8){
    const arr=items.slice(0,maxItems),max=Math.max(...arr.map(d=>d.value),1);
    el.innerHTML=arr.map((d,i)=>`<div class="bar-row"><span class="bar-label" title="${escapeHTML(d.label)}">${escapeHTML(d.label)}</span><div class="bar-track"><div class="bar-fill" style="background:linear-gradient(90deg,${palette[i%palette.length]},${palette[(i+2)%palette.length]});width:${(d.value/max*100).toFixed(1)}%"></div></div><span class="bar-value">${formatter(d.value)}</span></div>`).join('');
  }

  function renderOverview(){
    const s=D.summary;
    const kpis=[
      ['Ranked entries',fmt.format(s.entries),'archive observations','var(--cyan)'],
      ['Unique tracks',fmt.format(s.uniqueTracks),'distinct song + artist pairs','var(--magenta)'],
      ['Unique artists',fmt.format(s.uniqueArtists),'primary artists','var(--violet)'],
      ['Median catalog age',`${s.medianAge.toFixed(0)} yrs`,'release age at ranking','var(--yellow)'],
      ['Recent music',`${(s.recentShare*100).toFixed(0)}%`,'released within 2 years','var(--orange)']
    ];
    $('#kpiGrid').innerHTML=kpis.map(([l,v,sub,c])=>`<article class="kpi-card" style="--accent:${c}"><small>${l}</small><b>${v}</b><span>${sub}</span></article>`).join('');
    const total=s.entries;
    renderBars($('#genreBars'),D.genreCounts.map(([label,value])=>({label,value})),v=>`${(v/total*100).toFixed(1)}%`,8);
    const [topGenre,topCount]=D.genreCounts[0];
    $('#dominantGenreCopy').textContent=`${topGenre} accounts for ${(topCount/total*100).toFixed(1)}% of the full archive, making it the clearest recurring anchor in the decade-long listening record.`;
    $('#energyValue').textContent=s.avgEnergy.toFixed(2);
    $('#valenceValue').textContent=s.avgValence.toFixed(2);
    $('.ring-stat:nth-child(1)').style.cssText+=`--pct:${s.avgEnergy*100};--ring-color:var(--cyan);`;
    $('.ring-stat:nth-child(2)').style.cssText+=`--pct:${s.avgValence*100};--ring-color:var(--magenta);`;
    $('#sonicCopy').textContent=`Average tempo is ${s.avgBpm.toFixed(0)} BPM, with energy at ${s.avgEnergy.toFixed(2)} and valence at ${s.avgValence.toFixed(2)}. The archive leans lively and emotionally positive rather than low-key or sombre.`;
  }

  function renderTrend(){
    const metric=state.trendMetric,s=D.annual;
    const cfg={
      energy:{title:'Average energy by year',format:v=>v.toFixed(2),summary:'Energy rises notably through the electronic-heavy years and remains elevated in the later archive.'},
      bpm:{title:'Average tempo by year',format:v=>`${v.toFixed(0)} BPM`,summary:'Tempo broadly rises as electronic and trance become more prominent.'},
      releaseAge:{title:'Average release age by year',format:v=>`${v.toFixed(1)} yrs`,summary:'The catalog becomes older again in the later years, signalling a stronger nostalgia layer.'}
    }[metric];
    $('#trendTitle').textContent=cfg.title;$('#trendSummary').textContent=cfg.summary;
    const W=920,H=330,pad={l:45,r:22,t:28,b:38},vals=s.map(d=>d[metric]),min=Math.min(...vals),max=Math.max(...vals),span=(max-min)||1,lo=min-span*.18,hi=max+span*.18;
    const x=i=>pad.l+i*((W-pad.l-pad.r)/Math.max(1,s.length-1)),y=v=>pad.t+(hi-v)/(hi-lo)*(H-pad.t-pad.b);
    const pts=s.map((d,i)=>`${x(i)},${y(d[metric])}`).join(' ');
    let grid='';
    for(let i=0;i<5;i++){const yy=pad.t+i*(H-pad.t-pad.b)/4,val=hi-i*(hi-lo)/4;grid+=`<line x1="${pad.l}" y1="${yy}" x2="${W-pad.r}" y2="${yy}" class="chart-grid-line"/><text x="4" y="${yy+3}" class="chart-axis-label">${cfg.format(val)}</text>`;}
    const labels=s.map((d,i)=>`<text x="${x(i)}" y="${H-12}" text-anchor="middle" class="chart-axis-label">${d.year}</text>`).join('');
    const dots=s.map((d,i)=>`<circle cx="${x(i)}" cy="${y(d[metric])}" r="5" class="chart-dot"/><text x="${x(i)}" y="${y(d[metric])-12}" text-anchor="middle" class="chart-value">${cfg.format(d[metric])}</text>`).join('');
    const area=`${pad.l},${H-pad.b} ${pts} ${x(s.length-1)},${H-pad.b}`;
    $('#trendChart').innerHTML=`<svg class="trend-svg" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#77f5da" stop-opacity=".19"/><stop offset="100%" stop-color="#77f5da" stop-opacity="0"/></linearGradient></defs>${grid}<polygon points="${area}" class="chart-area"/><polyline points="${pts}" class="chart-line"/>${dots}${labels}</svg>`;
  }

  function renderAgeAndDecades(){
    const n=D.ageBuckets.reduce((a,b)=>a+b.value,0);
    $('#ageBuckets').innerHTML=D.ageBuckets.map((d,i)=>`<div class="stack-item"><span>${d.label}</span><div class="stack-track"><div class="stack-fill" style="width:${d.value/n*100}%;background:linear-gradient(90deg,${palette[(i+1)%palette.length]},${palette[(i+3)%palette.length]})"></div></div><span>${(d.value/n*100).toFixed(0)}%</span></div>`).join('');
    renderBars($('#decadeBars'),D.decadeCounts.map(([label,value])=>({label,value})),v=>`${(v/D.summary.entries*100).toFixed(1)}%`,8);
  }

  function renderArtists(){
    renderBars($('#artistBars'),D.artists.map(a=>({label:a.artist,value:a.score})),v=>fmt.format(v),10);
    const top=D.artists[0];
    $('#artistSpotlight').innerHTML=`<div><p class="card-kicker">ARTIST SPOTLIGHT</p><div class="big-number">${top.entries}</div><p class="spot-name">${escapeHTML(top.artist)}</p><p class="spot-meta">${top.tracks} distinct tracks • ${top.years} playlist years • ${top.platforms} platforms<br>Average rank ${top.avgRank.toFixed(1)} • weighted score ${fmt.format(top.score)}</p></div><p class="spot-meta">This is the strongest rank-weighted artist presence across the full archive.</p>`;
    $('#artistTable').innerHTML=D.artists.slice(0,12).map(a=>`<tr><td><strong>${escapeHTML(a.artist)}</strong></td><td>${a.entries}</td><td>${a.tracks}</td><td>${a.years}</td><td>Avg rank ${a.avgRank.toFixed(1)}</td></tr>`).join('');
  }

  function renderTracks(){
    const top=D.top100;
    $('#trackCards').innerHTML=top.slice(0,6).map(t=>`<article class="track-card" data-index="${String(t.rank).padStart(2,'0')}"><div><span class="track-rank">#${t.rank} ALL-TIME LOVE</span><h3>${escapeHTML(t.song)}</h3><p class="artist">${escapeHTML(t.artist)}</p><div class="love-score"><b>${t.loveIndex.toFixed(1)}</b><small>/ 100 love index</small></div><div class="love-meter"><i style="width:${Math.min(100,t.loveIndex)}%"></i></div></div><div><p class="love-detail">${t.appearances} distinct year/platform chart appearances • ${t.years} years • ${t.platforms} platforms${t.cross?` • ${t.cross} cross-platform year${t.cross===1?'':'s'}`:''}</p><div class="track-meta"><span>best #${t.bestRank}</span><span>avg rank ${t.avgRank.toFixed(1)}</span><span>${t.firstYear}–${t.lastYear}</span></div></div></article>`).join('');
    $('#loveSummary').innerHTML=`<strong>100 songs</strong> ranked from the complete 2016–2025 archive. #1 is <strong>${escapeHTML(top[0].song)}</strong> by ${escapeHTML(top[0].artist)} with a Love Index of <strong>${top[0].loveIndex.toFixed(1)}</strong>.`;
    $('#loveTable').innerHTML=top.map(t=>`<tr><td>${t.rank}</td><td><strong>${escapeHTML(t.song)}</strong></td><td>${escapeHTML(t.artist)}</td><td><span class="love-index-pill">${t.loveIndex.toFixed(1)}</span></td><td>${t.appearances}</td><td>${t.years}</td><td><span class="platform-dots">${Array.from({length:t.platforms},()=>'<i></i>').join('')}</span> ${t.platforms}</td><td>${t.cross}</td><td>#${t.bestRank}</td><td>${t.avgRank.toFixed(1)}</td></tr>`).join('');
  }

  function renderScatter(){
    const canvas=$('#sonicCanvas'),ctx=canvas.getContext('2d'),dpr=window.devicePixelRatio||1,cssW=canvas.clientWidth||720,cssH=420;
    canvas.width=cssW*dpr;canvas.height=cssH*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,cssW,cssH);
    const pad=38;ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;
    for(let i=0;i<=4;i++){const x=pad+i*(cssW-2*pad)/4,y=pad+i*(cssH-2*pad)/4;ctx.beginPath();ctx.moveTo(x,pad);ctx.lineTo(x,cssH-pad);ctx.stroke();ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(cssW-pad,y);ctx.stroke();}
    ctx.font='10px system-ui';ctx.fillStyle='#717786';ctx.fillText('low valence',8,cssH-18);ctx.fillText('high valence',8,18);
    D.annual.forEach((r,i)=>{const x=pad+r.energy*(cssW-2*pad),y=cssH-pad-(D.summary.avgValence+(i-D.annual.length/2)*.015)*(cssH-2*pad);ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=palette[i%palette.length]+'aa';ctx.fill();});
  }

  function renderOverlap(){
    $('#platformOverlap').innerHTML=D.overlap.map(p=>`<div class="overlap-row"><b>${p.year}</b><div><div style="font-size:11px;margin-bottom:6px">${p.a} ↔ ${p.b} · ${p.overlap} shared tracks</div><div class="overlap-track"><i style="width:${p.share*100}%"></i></div></div><span>${(p.share*100).toFixed(0)}%</span></div>`).join('');
  }

  function renderExplorer(){
    const q=state.search.trim().toLowerCase();
    const rows=D.top100.filter(t=>!q||`${t.song} ${t.artist}`.toLowerCase().includes(q));
    $('#rowCount').textContent=`${rows.length} matches`;
    $('#dataTable').innerHTML=rows.map(t=>`<tr><td>#${t.rank}</td><td><strong>${escapeHTML(t.song)}</strong></td><td>${escapeHTML(t.artist)}</td><td>${t.loveIndex.toFixed(1)}</td><td>${t.years}</td><td>${t.platforms}</td><td>#${t.bestRank}</td><td>${t.firstYear}–${t.lastYear}</td></tr>`).join('');
  }

  $$('.trend-button').forEach(btn=>btn.addEventListener('click',()=>{$$('.trend-button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.trendMetric=btn.dataset.metric;renderTrend();}));
  $('#searchInput').addEventListener('input',e=>{state.search=e.target.value;renderExplorer();});
  $('#yearFilter').closest('label').style.display='none';
  $('#platformFilter').closest('label').style.display='none';
  $('#resetFilters').style.display='none';
  $('.filter-note').textContent='This hosted edition uses full-archive aggregates so every section loads instantly.';
  window.addEventListener('resize',renderScatter);

  renderOverview();renderTrend();renderAgeAndDecades();renderArtists();renderTracks();renderScatter();renderOverlap();renderExplorer();
})();
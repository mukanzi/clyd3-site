const D=window.FUT_DATA;
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("en-CA").format(n);
const money=n=>n>=1e6?`${(n/1e6).toFixed(2)}M`:n>=1e3?`${(n/1e3).toFixed(0)}K`:fmt(n);

const THEME_KEY="clyd3-theme";
const systemDarkMode=window.matchMedia('(prefers-color-scheme: dark)');
const readTheme=()=>{try{const v=localStorage.getItem(THEME_KEY);return v==="light"||v==="dark"?v:null}catch{return null}};
const applyTheme=theme=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme};
let hasSavedTheme=Boolean(readTheme());
applyTheme(readTheme()||(systemDarkMode.matches?"dark":"light"));

function countUp(el,target,suffix=""){
  const t0=performance.now(),dur=650;
  const step=t=>{
    const p=Math.min((t-t0)/dur,1),v=Math.floor(target*(1-Math.pow(1-p,3)));
    el.textContent=fmt(v)+suffix;
    if(p<1)requestAnimationFrame(step)
  };requestAnimationFrame(step)
}

const KPI=[
  ["Club inventory",D.kpis.club,`${fmt(D.kpis.exported)} total exported`],
  ["Players used",D.kpis.used,"At least 1 appearance"],
  ["Appearances",D.kpis.apps,"Player-item appearances"],
  ["Goals",D.kpis.goals,`${fmt(D.kpis.assists)} assists`],
  ["95+ cards",D.kpis.cards95,`${D.kpis.cards99} cards at 99 OVR`],
];
$("kpis").innerHTML=KPI.map((x,i)=>`<article class="kpi"><label>${x[0]}</label><b data-count="${x[1]}">0</b><small>${x[2]}</small></article>`).join("");
document.querySelectorAll("[data-count]").forEach(x=>countUp(x,+x.dataset.count));

$("dnaMeter").style.width=D.evo.apps+"%";
$("heroPct").textContent=D.evo.apps+"%";
setTimeout(()=>{$("heroRing").style.strokeDashoffset=289*(1-D.evo.apps/100)},150);

$("ratingDist").innerHTML=D.ratingDist.map(x=>`
<div class="compare-row">
  <span>${x.label}</span>
  <div class="compare-track collection"><i style="width:${Math.max(x.itemShare,3)}%">${x.itemShare}%</i></div>
  <div class="compare-track usage"><i style="width:${Math.max(x.appShare,3)}%">${x.appShare}%</i></div>
</div>`).join("");

let hofMetric="apps";
function renderHOF(){
  const source=hofMetric==="apps"?D.topApps:hofMetric==="ga"?D.topGA:D.eff100;
  const max=Math.max(...source.map(x=>x[hofMetric]));
  $("hofBars").innerHTML=source.slice(0,10).map(x=>{
    const val=x[hofMetric],label=hofMetric==="gapg"?val.toFixed(2):fmt(val);
    return `<div class="bar-row"><div class="bar-name">${x.name}</div><div class="bar-track"><div class="bar-fill" style="width:${val/max*100}%"></div></div><div class="bar-value">${label}</div></div>`
  }).join("");
}
renderHOF();
$("hofSwitch").addEventListener("click",e=>{
  if(!e.target.matches("button"))return;
  $("hofSwitch").querySelectorAll("button").forEach(b=>b.classList.remove("active"));e.target.classList.add("active");
  hofMetric=e.target.dataset.metric;renderHOF()
});

const pitchPos=[
  [50,91],[84,72],[62,73],[38,73],[16,72],
  [50,55],[67,43],[33,43],[82,20],[50,18],[18,20]
];
$("legendsPitch").innerHTML='<div class="pitch-circle"></div>'+D.legendsXI.map((p,i)=>`
<div class="pitch-player" style="left:${pitchPos[i][0]}%;top:${pitchPos[i][1]}%">
 <div class="pitch-card"><b><i>${p.rating}</i>${p.name}</b><span>${p.pos} • ${fmt(p.apps)} apps</span></div>
</div>`).join("");

const positions=[...new Set(D.players.map(p=>p.pos))].sort((a,b)=>["GK","RB","CB","LB","CDM","CM","CAM","RM","LM","RW","LW","ST"].indexOf(a)-["GK","RB","CB","LB","CDM","CM","CAM","RM","LM","RW","LW","ST"].indexOf(b));
$("positionFilter").innerHTML+=[...positions].map(p=>`<option value="${p}">${p}</option>`).join("");

let page=1,pageSize=20,filtered=[];
function updatePlayerTable(reset=true){
  if(reset)page=1;
  const q=$("searchInput").value.trim().toLowerCase(),pos=$("positionFilter").value,evo=$("evoFilter").value,sort=$("sortFilter").value;
  filtered=D.players.filter(p=>(!pos||p.pos===pos)&&(!evo||p.evo===evo)&&(!q||`${p.name} ${p.club} ${p.league} ${p.country}`.toLowerCase().includes(q)));
  filtered.sort((a,b)=>b[sort]-a[sort]||b.apps-a.apps);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.min(page,pages);
  const slice=filtered.slice((page-1)*pageSize,page*pageSize);
  $("playerTable").innerHTML=slice.map(p=>`
  <tr>
   <td>${p.name}<span class="player-sub">${p.club} • ${p.country}</span></td>
   <td><span class="rating-pill">${p.rating}</span></td><td>${p.pos}</td><td>${fmt(p.apps)}</td>
   <td>${fmt(p.goals)}</td><td>${fmt(p.assists)}</td><td><b>${fmt(p.ga)}</b></td><td>${p.gapg.toFixed(2)}</td>
   <td><span class="badge ${p.evo==="Yes"?"evo":"std"}">${p.evo==="Yes"?"EVO":"STANDARD"}</span></td>
  </tr>`).join("")||`<tr><td colspan="9">No matching players.</td></tr>`;
  $("resultCount").textContent=`${fmt(filtered.length)} players`;
  $("pageLabel").textContent=`Page ${page} of ${pages}`;
  $("prevPage").disabled=page<=1;$("nextPage").disabled=page>=pages;
}
["searchInput","positionFilter","evoFilter","sortFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",()=>updatePlayerTable(true)));
$("prevPage").onclick=()=>{page--;updatePlayerTable(false)};$("nextPage").onclick=()=>{page++;updatePlayerTable(false)};
updatePlayerTable();

let depthMetric="cards95";
function renderDepth(){
 const max=Math.max(...D.posDepth.map(x=>x[depthMetric]));
 $("depthBars").innerHTML=D.posDepth.map(x=>{
  const val=x[depthMetric],label=depthMetric==="ga100"?`${val.toFixed(1)} G+A/100`:fmt(val);
  return `<div class="depth-row"><strong>${x.position}</strong><div class="depth-track"><div class="depth-fill" style="width:${val/max*100}%"></div></div><div class="depth-value">${label}</div></div>`
 }).join("");
 const best=[...D.posDepth].sort((a,b)=>b[depthMetric]-a[depthMetric])[0];
 $("depthSummary").innerHTML=`<div><span class="panel-kicker">STRONGEST AREA</span><h3>${best.position}</h3><p>${depthMetric==="ga100"?"The highest attacking contribution rate by listed position.":"Your deepest end-game position under this threshold."}</p></div>
 <div class="summary-number">${depthMetric==="ga100"?best[depthMetric].toFixed(1):best[depthMetric]}</div>
 <div class="summary-grid"><div><b>${best.top}</b><span>Top OVR</span></div><div><b>${fmt(best.apps)}</b><span>Apps</span></div></div>`;
}
renderDepth();
document.querySelector(".depth-toggle").addEventListener("click",e=>{
 if(!e.target.matches("button"))return;document.querySelectorAll(".depth-toggle button").forEach(b=>b.classList.remove("active"));e.target.classList.add("active");depthMetric=e.target.dataset.depth;renderDepth()
});

function rankList(list){
 return list.map((x,i)=>`<div class="rank-item"><span>${String(i+1).padStart(2,"0")}</span><div><b>${x.name}</b><small>${fmt(x.items)} player items</small></div><div class="rank-value">${fmt(x.apps)}</div></div>`).join("")
}
$("countries").innerHTML=rankList(D.topCountries);$("leagues").innerHTML=rankList(D.topLeagues);
$("marketList").innerHTML=D.topMarket.slice(0,8).map((p,i)=>`<div class="market-item"><span>${String(i+1).padStart(2,"0")}</span><div><b>${p.name}</b><small>${p.rating} OVR • ${p.pos}</small></div><div class="market-value">${money(p.market)}</div></div>`).join("");

$("cards99").innerHTML=D.cards99.map(p=>`<article class="c99"><span>99</span><h3>${p.name}</h3><p>${p.pos} • ${fmt(p.apps)} appearances</p></article>`).join("");

const themeBtn=$("themeBtn");
const refreshThemeButton=()=>{
  const dark=document.documentElement.dataset.theme==="dark";
  themeBtn.textContent=dark?"☀":"☾";
  themeBtn.setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme");
  themeBtn.title=dark?"Light theme":"Dark theme";
};
refreshThemeButton();
themeBtn.onclick=()=>{
  const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
  applyTheme(next);hasSavedTheme=true;
  try{localStorage.setItem(THEME_KEY,next)}catch{}
  refreshThemeButton();
};
systemDarkMode.addEventListener?.('change',e=>{if(!hasSavedTheme){applyTheme(e.matches?"dark":"light");refreshThemeButton();}});

$("printBtn").onclick=()=>window.print();
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>{$("sidebar").classList.remove("open");document.querySelectorAll(".nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active")}));

const sections=[...document.querySelectorAll(".section")],navs=[...document.querySelectorAll(".nav a")];
const obs=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){navs.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+en.target.id))}}),{rootMargin:"-35% 0px -55% 0px"});
sections.forEach(s=>obs.observe(s));
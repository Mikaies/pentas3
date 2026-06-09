/* ═══════════════════════════════════════════
   CALCULATE & PREVIEW
═══════════════════════════════════════════ */
function readScenario(sc){
  return {
    price:      parseFloat(document.getElementById('inp-price-'+sc).value)||0.30,
    paidEps:    parseInt(document.getElementById('inp-eps-'+sc).value)||10,
    dramas:     dramaCounts[sc],
    production: parseFloat(document.getElementById('inp-production-'+sc).value)||0,
    management: parseFloat(document.getElementById('inp-management-'+sc).value)||0,
    marketing:  parseFloat(document.getElementById('inp-marketing-'+sc).value)||0,
  };
}

document.getElementById('btn-calculate').addEventListener('click',()=>{
  ['min','decent','max'].forEach(sc=>{
    const s = readScenario(sc);
    if(s.price<=0||isNaN(s.price)){ alert('Please enter a valid price for '+sc+' scenario.'); return; }
    scenarios[sc] = s;
  });

  // Populate summary cards
  ['min','decent','max'].forEach(sc=>{
    const s = scenarios[sc];
    const net = netProfitFor(s);
    document.getElementById('ssum-price-'+sc).textContent   = 'RM '+s.price.toFixed(2)+'/ep';
    document.getElementById('ssum-eps-'+sc).textContent     = s.paidEps+' eps';
    document.getElementById('ssum-dramas-'+sc).textContent  = s.dramas+' drama'+(s.dramas>1?'s':'');
    document.getElementById('ssum-fixed-'+sc).textContent   = fmt(totalFixedFor(s));
    const netEl = document.getElementById('ssum-net-'+sc);
    netEl.textContent = fmtNet(net);
    netEl.style.color = net>=0?'var(--gold)':'var(--crimson)';
  });

  showScreen('screen-summary');
});

document.getElementById('btn-back').addEventListener('click',()=>showScreen('screen-calc'));
document.getElementById('btn-calc-back').addEventListener('click',()=>showScreen('screen-login'));
document.getElementById('btn-back-to-summary').addEventListener('click',()=>showScreen('screen-summary'));
document.getElementById('btn-enter-dash').addEventListener('click',()=>{
  // Use 'decent' as default active scenario for individual dashboard pages
  cfg = { ...scenarios.decent };
  document.getElementById('topbar-username').textContent=loggedInUser;
  buildDashboard();
  showScreen('screen-dashboard');
});

/* ═══════════════════════════════════════════
   LIGHT/DARK MODE
═══════════════════════════════════════════ */
document.getElementById('btn-mode').addEventListener('click',()=>{
  isLight=!isLight;
  document.body.classList.toggle('light',isLight);
  const btn=document.getElementById('btn-mode');
  btn.innerHTML=isLight
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg> Dark mode`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Light mode`;
  if(chartInst) renderMainChart();
});

/* ═══════════════════════════════════════════
   PAGE NAV
═══════════════════════════════════════════ */
document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
  el.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+el.dataset.page).classList.add('active');
    if(el.dataset.page==='scenarios') buildScenariosPage();
  });
});

/* chart tab switch */
document.querySelectorAll('.ctab[data-chart]').forEach(el=>{
  el.addEventListener('click',()=>{
    document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    currentChart=el.dataset.chart;
    renderMainChart();
  });
});

/* ═══════════════════════════════════════════
   SCENARIO TAB SWITCHING (wizard)
═══════════════════════════════════════════ */
function switchScenarioTab(tab){
  activeScenarioTab = tab;
  ['min','decent','max'].forEach(t=>{
    document.getElementById('tab-'+t).className = 'sc-tab' + (t===tab?' active':'');
    document.getElementById('sc-panel-'+t).style.display = t===tab?'':'none';
  });
}

/* Spinner helpers */
function spinPrice(sc, delta){
  const el = document.getElementById('inp-price-'+sc);
  el.value = Math.max(0.01,(parseFloat(el.value||0)+delta)).toFixed(2);
}
function spinEps(sc, delta){
  const el = document.getElementById('inp-eps-'+sc);
  el.value = Math.min(17, Math.max(1, parseInt(el.value||0)+delta));
  updateEpisodeVisualFor(sc);
}
function spinDrama(sc, delta){
  dramaCounts[sc] = Math.max(1, dramaCounts[sc]+delta);
  document.getElementById('drama-count-'+sc).textContent = dramaCounts[sc];
}
function updateTotalCostFor(sc){
  const p = parseFloat(document.getElementById('inp-production-'+sc).value)||0;
  const m = parseFloat(document.getElementById('inp-management-'+sc).value)||0;
  const mk= parseFloat(document.getElementById('inp-marketing-'+sc).value)||0;
  document.getElementById('total-cost-display-'+sc).textContent = 'RM '+(p+m+mk).toLocaleString();
}
function updateEpisodeVisualFor(sc){
  const val = parseInt(document.getElementById('inp-eps-'+sc).value)||0;
  const paid = Math.min(Math.max(val,0),17);
  let dots='';
  for(let i=1;i<=paid+3;i++){
    let cls='ep-dot'; if(i<=3) cls+=' free'; else cls+=' paid';
    dots+=`<div class="${cls}" title="Ep ${i}">${i}</div>`;
  }
  document.getElementById('ep-visual-'+sc).innerHTML=dots;
}
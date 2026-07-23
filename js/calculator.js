/* EPISODE STRUCTURE — fixed: 3 free + 14 paid = 17 total */
const FREE_EPISODES = 3;
const PAID_EPISODES = 14;
const TOTAL_EPISODES = 17;

/* GLOBAL SETUP VARIABLES */
let globalViewers = 150000;
let globalConversion = 0.03;
let globalEps = 17;
let globalPlatformFee = 0.20;

function spinGlobalEps(delta){
  globalEps = Math.min(17, Math.max(1, globalEps + delta));
  document.getElementById('global-eps').value = globalEps;
  updateSetupPreview();
}

function updateSetupPreview(){
  globalViewers = parseInt(document.getElementById('global-viewers').value) || 150000;
  const convPct = parseInt(document.getElementById('global-conversion').value) || 3;
  globalConversion = convPct / 100;
  globalEps = parseInt(document.getElementById('global-eps').value) || 17;
  const feePct = parseInt(document.getElementById('global-platform-fee').value) || 20;
  globalPlatformFee = feePct / 100;

  document.getElementById('conversion-label').textContent = convPct + '%';
  document.getElementById('platform-fee-label').textContent = feePct + '%';

  const payingUsers = Math.round(globalViewers * globalConversion);
  const preview = document.getElementById('setup-preview');
  if(preview){
    preview.innerHTML = `
      Expected viewers: <strong style="color:var(--white)">${globalViewers.toLocaleString()}</strong><br>
      Paying users (${convPct}% conversion): <strong style="color:var(--gold)">${payingUsers.toLocaleString()}</strong><br>
      Paid episodes: <strong style="color:var(--white)">${globalEps}</strong> (+ 3 free)<br>
      Platform fee deducted: <strong style="color:var(--crimson)">${feePct}%</strong>
    `;
  }
}

document.getElementById('btn-setup-next').addEventListener('click', ()=>{
  updateSetupPreview();
  showScreen('screen-calc');
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
function updateTotalCostFor(sc){
  const p = parseFloat(document.getElementById('inp-production-'+sc).value)||0;
  const m = parseFloat(document.getElementById('inp-management-'+sc).value)||0;
  const mk= parseFloat(document.getElementById('inp-marketing-'+sc).value)||0;
  document.getElementById('total-cost-display-'+sc).textContent = 'RM '+(p+m+mk).toLocaleString();
}

/* ═══════════════════════════════════════════
   CALCULATE & PREVIEW
═══════════════════════════════════════════ */
function readScenario(sc){
  return {
    price:          parseFloat(document.getElementById('inp-price-'+sc).value)||0.40,
    totalViewers:   globalViewers,
    conversionRate: globalConversion,
    platformFee:    globalPlatformFee,
    paidEps:        globalEps,
    production:     parseFloat(document.getElementById('inp-production-'+sc).value)||0,
    management:     parseFloat(document.getElementById('inp-management-'+sc).value)||0,
    marketing:      parseFloat(document.getElementById('inp-marketing-'+sc).value)||0,
  };
}

document.getElementById('btn-calculate').addEventListener('click',()=>{
  ['min','decent','max'].forEach(sc=>{
    const s = readScenario(sc);
    if(s.price<=0||isNaN(s.price)){ alert('Please enter a valid price for '+sc+' scenario.'); return; }
    scenarios[sc] = s;
  });

  ['min','decent','max'].forEach(sc=>{
    const s = scenarios[sc];
    const net = netProfitFor(s);
    document.getElementById('ssum-price-'+sc).textContent   = 'RM '+s.price.toFixed(2)+'/ep';
    document.getElementById('ssum-eps-'+sc).textContent     = PAID_EPISODES+' eps';
    document.getElementById('ssum-dramas-'+sc).textContent  = s.dramas+' drama'+(s.dramas>1?'s':'');
    document.getElementById('ssum-fixed-'+sc).textContent   = fmt(totalFixedFor(s));
    const netEl = document.getElementById('ssum-net-'+sc);
    netEl.textContent = fmtNet(net);
    netEl.style.color = net>=0?'var(--gold)':'var(--crimson)';
  });

  showScreen('screen-summary');
});

document.getElementById('btn-back').addEventListener('click',()=>showScreen('screen-calc'));
document.getElementById('btn-calc-back').addEventListener('click',()=>showScreen('screen-setup'));
document.getElementById('btn-back-to-summary').addEventListener('click',()=>showScreen('screen-summary'));
document.getElementById('btn-enter-dash').addEventListener('click',()=>{
  cfg = { ...scenarios.decent };
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
    if(el.dataset.page==='history') buildHistoryPage();
  });
});

document.querySelectorAll('.ctab[data-chart]').forEach(el=>{
  el.addEventListener('click',()=>{
    document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    currentChart=el.dataset.chart;
    renderMainChart();
  });
});

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
['min','decent','max'].forEach(sc=>{
  updateTotalCostFor(sc);
});
updateSetupPreview();

/* MOBILE MENU TOGGLE */
document.getElementById('btn-mobile-menu').addEventListener('click', ()=>{
  document.querySelector('.sidebar').classList.toggle('mobile-open');
});

document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
  el.addEventListener('click', ()=>{
    document.querySelector('.sidebar').classList.remove('mobile-open');
  });
});

/* ── PRINT SETUP ── */
function preparePrint(){
  const today = new Date();
  const scenarioName = activeOverviewScenario.charAt(0).toUpperCase() + activeOverviewScenario.slice(1);
  document.getElementById('printHeaderMeta').innerHTML = `
    ${today.toLocaleDateString('en-MY', {day:'numeric', month:'long', year:'numeric'})}<br>
    ${scenarioName} budget &middot; ${cfg.dramas} drama(s) &middot; RM ${cfg.price.toFixed(2)}/ep &middot; ${cfg.paidEps} paid eps
  `;

  // STEP 1: make every page visible FIRST so canvases have real dimensions
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('print-active'));
  ['page-overview','page-projections','page-costs','page-payout','page-scenarios'].forEach(id=>{
    document.getElementById(id).classList.add('print-active');
  });

  // STEP 2: force every page block-visible (overrides .page{display:none})
  document.querySelectorAll('.page').forEach(p=>{ p.style.display='block'; });
}

function snapshotChartsForPrint(){
  // Convert all canvas charts to images for printing
  const canvases = document.querySelectorAll('canvas');
  canvases.forEach(canvas=>{
    try {
      if(canvas.width === 0 || canvas.height === 0) return;
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.width = '100%';
      img.style.maxHeight = '200px';
      img.style.objectFit = 'contain';
      img.className = 'print-chart-img';
      canvas.parentNode.insertBefore(img, canvas.nextSibling);
      canvas.style.display = 'none';
    } catch(e){
      console.log('canvas error', e);
    }
  });
}


document.getElementById('btn-print-pdf').addEventListener('click', (e)=>{
  e.preventDefault();

  preparePrint();

  // Wait one frame for layout to settle with pages now visible, THEN build charts
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      buildCostCards();
      buildCostChart();
      renderPayoutAmounts();
      buildPayoutChart();
      buildPayoutTable();
      buildScenariosPage();
      renderMainChart();

      setTimeout(()=>{
        snapshotChartsForPrint();
        setTimeout(()=>{
          window.print();
        }, 200);
      }, 500);
    });
  });
});

window.addEventListener('afterprint', ()=>{
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.remove('print-active');
    p.style.display = '';
  });

  // Restore canvases after printing
  document.querySelectorAll('.print-chart-img').forEach(img=>img.remove());
  document.querySelectorAll('canvas').forEach(canvas=>{
    canvas.style.display = '';
  });

  // Re-render whatever page is actually active again
  renderMainChart();
});

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
['min','decent','max'].forEach(sc=>{
  updateEpisodeVisualFor(sc);
  updateTotalCostFor(sc);
});

/* ═══════════════════════════════════════════
   BUILD DASHBOARD
═══════════════════════════════════════════ */
function buildDashboard(){
  document.getElementById('dash-sub').textContent=
    scenarios.decent.dramas+' dramas (decent) · RM '+scenarios.decent.price.toFixed(2)+'/ep · '+scenarios.decent.paidEps+' paid eps';

  buildConfigBanner();
  buildConfigPills();
  renderOverviewMetrics();
  renderMainChart();
  renderTable();
  renderProjTable();
  buildHolidayCards();
  buildCostCards();
  buildCostChart();
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
}

function buildConfigBanner(){
  document.getElementById('configBanner').innerHTML=
    `<div class="config-tag">&#128176; <strong>RM ${cfg.price.toFixed(2)}/ep</strong></div>
     <div class="config-tag">&#127916; <strong>${cfg.paidEps} paid eps</strong></div>
     <div class="config-tag">&#128250; <strong>${cfg.dramas} drama(s)</strong></div>
     <div class="config-tag">&#128202; Fixed cost: <strong>${fmt(totalFixed())}</strong></div>
     <div class="config-tag">&#128181; Net profit: <strong style="color:${netProfit()>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(netProfit())}</strong></div>`;
}

function buildConfigPills(){
  document.getElementById('configPills').innerHTML=`
    <div class="sc-pill active"><div><div class="sc-pill-name">Production</div><div class="sc-pill-cost">${fmt(cfg.production)}</div></div><div class="sc-pill-dot" style="background:var(--gold)"></div></div>
    <div class="sc-pill active"><div><div class="sc-pill-name">Management</div><div class="sc-pill-cost">${fmt(cfg.management)}</div></div><div class="sc-pill-dot" style="background:var(--crimson)"></div></div>
    <div class="sc-pill active"><div><div class="sc-pill-name">Marketing</div><div class="sc-pill-cost">${fmt(cfg.marketing)}</div></div><div class="sc-pill-dot" style="background:#a0522d"></div></div>`;
}

/* ═══════════════════════════════════════════
   OVERVIEW METRICS
═══════════════════════════════════════════ */
function renderOverviewMetrics(){
  const data=calcMonthData();
  const tRev=data.reduce((a,d)=>a+d.rev,0);
  const tGP=data.reduce((a,d)=>a+d.gp,0);
  const tDC=data.reduce((a,d)=>a+d.dc,0);
  const tU=data.reduce((a,d)=>a+d.users,0);
  const net=netProfit();
  document.getElementById('overviewMetrics').innerHTML=`
    <div class="metric-card"><div class="metric-label">Total users (12mo)</div><div class="metric-val">${tU.toLocaleString()}</div><div class="metric-note">×${cfg.dramas} drama(s) · 10% conversion</div></div>
    <div class="metric-card"><div class="metric-label">Total revenue</div><div class="metric-val">${fmt(tRev)}</div><div class="metric-note">RM ${cfg.price.toFixed(2)} × ${cfg.paidEps} paid eps</div></div>
    <div class="metric-card"><div class="metric-label">Direct cost (40%)</div><div class="metric-val">${fmt(tDC)}</div><div class="metric-note">Platform & operations</div></div>
    <div class="metric-card gold-accent"><div class="metric-label">Gross profit (60%)</div><div class="metric-val">${fmt(tGP)}</div><div class="metric-note">Before fixed costs</div></div>
    <div class="metric-card"><div class="metric-label">Total fixed cost</div><div class="metric-val">${fmt(totalFixed())}</div><div class="metric-note">Production + Management + Marketing</div></div>
    <div class="metric-card ${net>=0?'gold-accent':'red-accent'}"><div class="metric-label">Net profit</div><div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div><div class="metric-note">All dramas · 12 months</div></div>`;
}
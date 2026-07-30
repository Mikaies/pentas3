async function buildHistoryPage(){
  const listEl = document.getElementById('historyList');
  if(!auth.currentUser){
    listEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted);">Sign in to see saved history.</div>`;
    return;
  }
  const entries = await loadHistory(auth.currentUser.uid);
  if(!entries.length){
    listEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted);">
      <div style="font-size:13px;">No saved history yet. Enter the dashboard to save your first entry.</div>
    </div>`;
    return;
  }
  listEl.innerHTML = entries.map(e => `
    <div style="background:var(--surface2);border-radius:var(--radius);padding:1rem;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;">${e.label || 'Untitled'}${e.pinned ? ' 📌' : ''}</div>
        <div style="font-size:11px;color:var(--muted2);">${(e.peakUsers||0).toLocaleString()} peak users · RM ${(e.price||0).toFixed(2)}/ep · ${fmtNet(e.netProfit||0)}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-secondary" onclick="restoreHistoryEntry('${e.id}')">Restore</button>
        <button class="btn-secondary" onclick="renameHistoryPrompt('${e.id}','${(e.label||'').replace(/'/g,"\\'")}')">Rename</button>
        <button class="btn-secondary" onclick="pinHistoryEntry(auth.currentUser.uid,'${e.id}',${!e.pinned}).then(buildHistoryPage)">${e.pinned?'Unpin':'Pin'}</button>
        <button class="btn-secondary" onclick="deleteHistoryEntry(auth.currentUser.uid,'${e.id}').then(buildHistoryPage)">Delete</button>
      </div>
    </div>`).join('');
}

function restoreHistoryEntry(id){
  loadHistory(auth.currentUser.uid).then(entries=>{
    const e = entries.find(x=>x.id===id);
    if(!e || !e.scenarios) return;
    scenarios = e.scenarios;
    cfg = { ...scenarios.decent };
    buildDashboard();
    showScreen('screen-dashboard');
  });
}

function renameHistoryPrompt(id, current){
  const name = prompt('Rename this entry:', current);
  if(name) renameHistoryEntry(auth.currentUser.uid, id, name).then(buildHistoryPage);
}

/* ═══════════════════════════════════════════
   BUILD DASHBOARD
═══════════════════════════════════════════ */
function buildDashboard(){
  activeOverviewScenario = 'decent';
  cfg = { ...scenarios.decent };

  document.getElementById('dash-sub').textContent =
    `${(scenarios.decent.peakUsers||0).toLocaleString()} peak users (decent) · RM ${scenarios.decent.price.toFixed(2)}/ep · ${scenarios.decent.paidEps} paid eps`;

  renderOverviewMetrics();
  buildConfigBanner();
  renderBreakEven();
  renderTable();
  renderMainChart();
  buildCostCards();
  buildCostChart();
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
  renderProjTable();

  // Scenario switcher
  document.querySelectorAll('.sc-overview-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sc = btn.dataset.sc;
      activeOverviewScenario = sc;
      cfg = { ...scenarios[sc] };
      document.querySelectorAll('.sc-overview-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderOverviewMetrics();
      buildConfigBanner();
      renderBreakEven();
      renderTable();
      renderMainChart();
      buildCostCards();
      buildCostChart();
      renderPayoutAmounts();
      buildPayoutChart();
      buildPayoutTable();
      renderProjTable();
    });
  });

  document.getElementById('btn-close-detail')?.addEventListener('click', ()=>{
    document.getElementById('detailPanel').classList.remove('show');
  });
}

/* ═══════════════════════════════════════════
   CONFIG BANNER
═══════════════════════════════════════════ */
function buildConfigBanner(){
  document.getElementById('configBanner').innerHTML = `
    <div class="config-tag">👥 <strong>${(cfg.peakUsers||0).toLocaleString()} peak users</strong></div>
    <div class="config-tag">💰 <strong>RM ${(cfg.price||0.40).toFixed(2)}/ep</strong></div>
    <div class="config-tag">🎬 <strong>${cfg.paidEps||17} paid eps</strong></div>
    <div class="config-tag">📊 Fixed cost: <strong>${fmt(totalFixed())}</strong></div>
    <div class="config-tag">📈 Net profit: <strong style="color:${netProfit()>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(netProfit())}</strong></div>`;
}

/* ═══════════════════════════════════════════
   7 KPI CARDS
═══════════════════════════════════════════ */
function renderOverviewMetrics(){
  const data    = calcMonthData();
  const tPaying = data.reduce((a,d) => a + d.paying, 0);
  const tRev    = data.reduce((a,d) => a + d.revenue, 0);
  const net     = netProfit();
  const prodPay = net > 0 ? net * producerSplit : 0;
  const dirPay  = net > 0 ? net * (1 - producerSplit) : 0;

  document.getElementById('overviewMetrics').innerHTML = `
    <div class="metric-card">
      <div class="metric-label">Peak paying users</div>
      <div class="metric-val">${(cfg.peakUsers||0).toLocaleString()}</div>
      <div class="metric-note">Month 1 — highest point</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Total paying users (12mo)</div>
      <div class="metric-val">${tPaying.toLocaleString()}</div>
      <div class="metric-note">Full 12-month projection</div>
    </div>
    <div class="metric-card gold-accent">
      <div class="metric-label">Total revenue</div>
      <div class="metric-val">${fmt(tRev)}</div>
      <div class="metric-note">RM ${(cfg.price||0.40).toFixed(2)} × ${cfg.paidEps||17} paid eps</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Total fixed costs</div>
      <div class="metric-val">${fmt(totalFixed())}</div>
      <div class="metric-note">Production + Management + Marketing</div>
    </div>
    <div class="metric-card ${net>=0?'gold-accent':'red-accent'}">
      <div class="metric-label">Net profit</div>
      <div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div>
      <div class="metric-note">Revenue minus all fixed costs</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Producer payout (${Math.round(producerSplit*100)}%)</div>
      <div class="metric-val ${net>0?'pos':'neg'}">${net>0?fmt(prodPay):'—'}</div>
      <div class="metric-note">From net profit</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Director payout (${Math.round((1-producerSplit)*100)}%)</div>
      <div class="metric-val ${net>0?'pos':'neg'}">${net>0?fmt(dirPay):'—'}</div>
      <div class="metric-note">From net profit</div>
    </div>`;
}

/* ═══════════════════════════════════════════
   BREAK-EVEN
═══════════════════════════════════════════ */
function renderBreakEven(){
  const fixed          = totalFixed();
  const revenuePerUser = (cfg.price||0.40) * (cfg.paidEps||17);
  const breakEvenUsers = revenuePerUser > 0 ? Math.ceil(fixed / revenuePerUser) : 0;
  const data           = calcMonthData();
  const tPaying        = data.reduce((a,d) => a + d.paying, 0);
  const pct            = breakEvenUsers > 0 ? Math.min(100, Math.round((tPaying / breakEvenUsers) * 100)) : 0;
  const achieved       = tPaying >= breakEvenUsers;

  document.getElementById('breakEvenContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div>Need <strong style="color:var(--white)">${breakEvenUsers.toLocaleString()} paying users</strong> to cover <strong style="color:var(--white)">${fmt(fixed)}</strong> fixed costs</div>
      <div>Current: <strong style="color:var(--gold)">${tPaying.toLocaleString()} paying users</strong></div>
    </div>
    <div style="background:var(--surface2);border-radius:4px;height:8px;margin:10px 0;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:${achieved?'var(--gold)':'var(--crimson)'};border-radius:4px;transition:width .5s;"></div>
    </div>
    <div style="text-align:right;font-size:11px;color:${achieved?'var(--gold)':'var(--muted)'};">
      ${achieved ? '✅ Break-even achieved! · 100%' : `${pct}% of break-even`}
    </div>`;
}

/* ═══════════════════════════════════════════
   OVERVIEW TABLE (6 months)
═══════════════════════════════════════════ */
function renderTable(){
  const data = calcMonthData().slice(0, 6);
  const rows = data.map((d,i) => `
    <tr onclick="showDetail(${i})">
      <td style="font-weight:500;white-space:nowrap">Month ${i+1}</td>
      <td><span class="badge ${phaseStyle(PHASES[i])}">${PHASES[i]}</span></td>
      <td>${d.paying.toLocaleString()}</td>
      <td>${fmt(d.revenue)}</td>
      <td class="${d.profit>=0?'pos-val':'neg-val'}">${fmtNet(d.profit)}</td>
    </tr>`);
  const tP  = data.reduce((a,d) => a+d.paying, 0);
  const tR  = data.reduce((a,d) => a+d.revenue, 0);
  const tNP = data.reduce((a,d) => a+d.profit, 0);
  rows.push(`
    <tr style="background:var(--surface2)">
      <td style="font-weight:700">TOTAL</td><td>—</td>
      <td>${tP.toLocaleString()}</td>
      <td>${fmt(tR)}</td>
      <td class="${tNP>=0?'pos-val':'neg-val'}">${fmtNet(tNP)}</td>
    </tr>`);
  document.getElementById('tableBody').innerHTML = rows.join('');
}

/* ═══════════════════════════════════════════
   PROJECTIONS TABLE (12 months)
═══════════════════════════════════════════ */
function renderProjTable(){
  const data = calcMonthData();
  const mf   = monthlyFixed();
  const rows = data.map((d,i) => `
    <tr>
      <td style="font-weight:500;white-space:nowrap">Month ${i+1}</td>
      <td><span class="badge ${phaseStyle(PHASES[i])}">${PHASES[i]}</span></td>
      <td>${d.paying.toLocaleString()}</td>
      <td>${fmt(d.revenue)}</td>
      <td style="color:var(--muted2)">${fmt(mf)}</td>
      <td class="${d.profit>=0?'pos-val':'neg-val'}">${fmtNet(d.profit)}</td>
    </tr>`);
  const tP  = data.reduce((a,d) => a+d.paying, 0);
  const tR  = data.reduce((a,d) => a+d.revenue, 0);
  const net = netProfit();
  rows.push(`
    <tr style="background:var(--surface2)">
      <td style="font-weight:700">TOTAL</td><td>—</td>
      <td>${tP.toLocaleString()}</td>
      <td>${fmt(tR)}</td>
      <td style="color:var(--muted2)">${fmt(totalFixed())}</td>
      <td class="${net>=0?'pos-val':'neg-val'}">${fmtNet(net)}</td>
    </tr>`);
  document.getElementById('projTableBody').innerHTML = rows.join('');
}
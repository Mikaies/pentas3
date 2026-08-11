async function buildHistoryPage(){
  const listEl = document.getElementById('historyList');
  const bulkBar = document.getElementById('historyBulkBar');
  histSelected = new Set();
  if(bulkBar) bulkBar.style.display = 'none';
  if(!auth.currentUser){
    listEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted);">Sign in to see saved history.</div>`;
    return;
  }
  const entries = await loadHistory(auth.currentUser.uid);
  if(!entries.length){
    listEl.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--muted);">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;margin-bottom:12px;opacity:.4;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <div style="font-size:13px;">No saved history yet. Enter the dashboard to save your first entry.</div>
    </div>`;
    return;
  }

  // Sort: pinned first, then by date
  entries.sort((a,b)=>{
    if(a.pinned && !b.pinned) return -1;
    if(!a.pinned && b.pinned) return 1;
    const aT = a.savedAt ? a.savedAt.seconds : 0;
    const bT = b.savedAt ? b.savedAt.seconds : 0;
    return bT - aT;
  });

  listEl.innerHTML = entries.map(e=>{
    const net = e.netProfit || 0;
    const date = e.savedAt ? new Date(e.savedAt.seconds*1000).toLocaleString('en-MY',{
      day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    }) : '—';
    const netColor = net >= 0 ? 'var(--gold)' : 'var(--crimson)';
    const netText  = net >= 0 ? `+ RM ${Math.round(net).toLocaleString()}` : `− RM ${Math.round(Math.abs(net)).toLocaleString()}`;
    const label    = e.label || '';
    const pinIcon  = e.pinned ? '📌 ' : '';

    return `
      <div class="history-card" data-id="${e.id}" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;">
        <div style="display:flex;align-items:flex-start;gap:10px;flex:1;min-width:0;">
          <input type="checkbox" class="hist-checkbox" data-id="${e.id}" onchange="histToggleSelect('${e.id}', this.checked)" style="margin-top:4px;width:16px;height:16px;accent-color:var(--crimson);flex-shrink:0;cursor:pointer;"/>
          <div style="flex:1;min-width:0;">
            ${label ? `<div style="font-size:13px;font-weight:600;color:var(--white);margin-bottom:2px;">${pinIcon}${label}</div>` : ''}
            <div style="font-size:${label?'11px':'13px'};font-weight:${label?'400':'600'};color:${label?'var(--muted)':'var(--white)'};margin-bottom:4px;">${label?'':pinIcon}${date}</div>
            <div style="font-size:11px;color:var(--muted2);margin-bottom:4px;">
              ${(e.peakUsers||0).toLocaleString()} peak users · RM ${(e.price||0).toFixed(2)}/ep · ${e.paidEps||17} paid eps · Fixed RM ${Math.round(e.fixedCost||0).toLocaleString()}
            </div>
            <div style="font-size:12px;font-weight:600;color:${netColor};">Net profit: ${netText}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <button class="icon-btn" onclick="restoreHistoryEntry('${e.id}')" style="white-space:nowrap;">Restore</button>
          <div class="hist-menu-wrap" style="position:relative;">
            <button class="icon-btn hist-dots-btn" onclick="toggleHistMenu('${e.id}')" style="padding:6px 10px;font-size:16px;letter-spacing:2px;">···</button>
            <div id="hist-menu-${e.id}" style="display:none;position:absolute;right:0;top:36px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);min-width:140px;z-index:100;overflow:hidden;">
              <button onclick="histRename('${e.id}')" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--white);font-size:12px;text-align:left;cursor:pointer;">✏️ Rename</button>
              <button onclick="histPin('${e.id}',${!e.pinned})" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--white);font-size:12px;text-align:left;cursor:pointer;">${e.pinned?'📌 Unpin':'📌 Pin to top'}</button>
              <button onclick="histDelete('${e.id}')" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--crimson);font-size:12px;text-align:left;cursor:pointer;">🗑️ Delete</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

let histSelected = new Set();

function histUpdateBulkBar(){
  const bar = document.getElementById('historyBulkBar');
  const count = document.getElementById('historySelectedCount');
  if(!bar) return;
  count.textContent = histSelected.size;
  bar.style.display = histSelected.size > 0 ? 'flex' : 'none';
}

function histToggleSelect(id, checked){
  if(checked) histSelected.add(id); else histSelected.delete(id);
  histUpdateBulkBar();
}

function histSelectAll(){
  document.querySelectorAll('.hist-checkbox').forEach(cb=>{
    cb.checked = true;
    histSelected.add(cb.dataset.id);
  });
  histUpdateBulkBar();
}

function histClearSelection(){
  document.querySelectorAll('.hist-checkbox').forEach(cb=> cb.checked = false);
  histSelected.clear();
  histUpdateBulkBar();
}

async function histDeleteSelected(){
  if(histSelected.size === 0) return;
  if(!confirm(`Delete ${histSelected.size} selected entr${histSelected.size===1?'y':'ies'}?`)) return;
  for(const id of histSelected){
    await deleteHistoryEntry(auth.currentUser.uid, id);
  }
  buildHistoryPage();
}

function toggleHistMenu(id){
  const menu = document.getElementById('hist-menu-'+id);
  const allMenus = document.querySelectorAll('[id^="hist-menu-"]');
  allMenus.forEach(m=>{ if(m.id !== 'hist-menu-'+id) m.style.display='none'; });
  menu.style.display = menu.style.display==='none'?'block':'none';
  setTimeout(()=>{
    document.addEventListener('click',(e)=>{
      if(!e.target.closest('.hist-menu-wrap')){
        document.querySelectorAll('[id^="hist-menu-"]').forEach(m=>m.style.display='none');
      }
    },{once:true});
  },10);
}

async function histDelete(id){
  if(!confirm('Delete this history entry?')) return;
  await deleteHistoryEntry(auth.currentUser.uid, id);
  buildHistoryPage();
}

async function histPin(id, pinned){
  await pinHistoryEntry(auth.currentUser.uid, id, pinned);
  buildHistoryPage();
}

async function histRename(id){
  const newName = prompt('Enter a name for this entry:');
  if(newName === null) return;
  await renameHistoryEntry(auth.currentUser.uid, id, newName.trim());
  buildHistoryPage();
}

function restoreHistoryEntry(id){
  loadHistory(auth.currentUser.uid).then(entries=>{
    const e = entries.find(x=>x.id===id);
    if(!e || !e.scenarios) return;
    scenarios = e.scenarios;
    cfg = { ...scenarios.decent };
    buildDashboard();
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    document.querySelector('.nav-item[data-page="overview"]').classList.add('active');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-overview').classList.add('active');
    showScreen('screen-dashboard');
  });
}

/* ═══════════════════════════════════════════
   BUILD DASHBOARD
═══════════════════════════════════════════ */
function buildDashboard(){
  activeOverviewScenario = 'min';
  cfg = { ...scenarios.min };
  loadPayoutSplitForActiveScenario();

  document.getElementById('dash-sub').textContent =
    `${(scenarios.min.peakUsers||0).toLocaleString()} peak users (minimum) · RM ${scenarios.min.price.toFixed(2)}/ep · ${scenarios.min.paidEps} paid eps`;

  renderOverviewMetrics();
  buildConfigBanner();
  renderBreakEven();
  renderTable();
  renderMainChart();
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
  renderProjTable();
  buildCumulativeChart();

  // Scenario switcher
document.querySelectorAll('.sc-switch-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const sc = btn.dataset.sc;
      activeOverviewScenario = sc;
      cfg = { ...scenarios[sc] };
      loadPayoutSplitForActiveScenario();
      document.querySelectorAll('.sc-switch-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.sc-switch-btn[data-sc="${sc}"]`).forEach(b => b.classList.add('active'));
      renderOverviewMetrics();
      buildConfigBanner();
      renderBreakEven();
      renderTable();
      renderMainChart();
      renderPayoutAmounts();
      buildPayoutChart();
      buildPayoutTable();
      renderProjTable();
      buildCumulativeChart();
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
  const data     = calcMonthData();
  const tPaying  = data.reduce((a,d) => a + d.paying, 0);
  const tRev     = data.reduce((a,d) => a + d.revenue, 0);
  const net      = netProfit();

  // Find the actual peak month (highest paying users), rather than assuming Month 1
  let peakIdx = 0;
  data.forEach((d,i) => { if(d.paying > data[peakIdx].paying) peakIdx = i; });
  const peakVal = data[peakIdx].paying;

  document.getElementById('overviewMetrics').innerHTML = `
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

/* ═══════════════════════════════════════════
   CUMULATIVE INCOME CHART
═══════════════════════════════════════════ */
function buildCumulativeChart(){
  if(window.cumulChartInst){ window.cumulChartInst.destroy(); window.cumulChartInst=null; }
  const ctx = document.getElementById('cumulChart').getContext('2d');
  const SC_COLORS = { min:'#cd853f', decent:'#D4AF37', max:'#e05060' };
  const SC_LABELS = { min:'Minimum', decent:'Decent', max:'Maximum' };
  const datasets = [];
  const cardData = {};

  ['min','decent','max'].forEach(sc=>{
    const s     = scenarios[sc];
    const fixed = totalFixedFor(s);
    const data  = calcMonthDataFor(s);
    let cumIncome = 0;
    const incomePoints = data.map(d=>{ cumIncome += d.revenue; return Math.round(cumIncome); });

    let breakevenMonth = '—';
    for(let i = 0; i < incomePoints.length; i++){
      if(incomePoints[i] >= fixed){ breakevenMonth = 'Month '+(i+1); break; }
    }

    cardData[sc] = {
      breakevenMonth,
      cumIncome: Math.round(cumIncome),
      netProfit: Math.round(netProfitFor(s))
    };

    datasets.push({
      label: SC_LABELS[sc],
      data: incomePoints,
      borderColor: SC_COLORS[sc],
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: SC_COLORS[sc]
    });

    datasets.push({
      label: SC_LABELS[sc]+' cost',
      data: Array(12).fill(fixed),
      borderColor: SC_COLORS[sc],
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [6,4],
      pointRadius: 0,
      tension: 0
    });
  });

  const gc = isLight?'rgba(0,0,0,0.06)':'rgba(255,255,255,0.06)';
  const tc = isLight?'#888':'#666';

  window.cumulChartInst = new Chart(ctx,{
    type:'line',
    data:{ labels:MONTH_LABELS, datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ display:true, position:'top', labels:{ color:'#aaa', font:{size:11},
          filter: item => !item.text.includes('cost') }},
        tooltip:{ callbacks:{ label: c => c.dataset.label+': RM '+Math.round(c.parsed.y).toLocaleString() }}
      },
      scales:{
        x:{ grid:{color:gc}, ticks:{color:tc, font:{size:10}} },
        y:{ grid:{color:gc}, ticks:{color:tc, font:{size:10}, callback: v=>'RM '+v.toLocaleString() }}
      }
    }
  });

  const SC_BORDER = { min:'#cd853f', decent:'var(--gold)', max:'#e05060' };
  document.getElementById('cumulCards').innerHTML = ['min','decent','max'].map(sc=>`
    <div style="background:var(--surface2);border:1px solid var(--border);border-top:3px solid ${SC_BORDER[sc]};border-radius:var(--radius);padding:1rem;">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${SC_COLORS[sc]};margin-bottom:8px;">${SC_LABELS[sc]}</div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:2px;">Breakeven</div>
      <div style="font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--white);margin-bottom:8px;">${cardData[sc].breakevenMonth}</div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:2px;">Cumulative income</div>
      <div style="font-family:var(--font-head);font-size:13px;font-weight:600;color:var(--gold);margin-bottom:8px;">${fmt(cardData[sc].cumIncome)}</div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:2px;">Net profit</div>
      <div style="font-family:var(--font-head);font-size:13px;font-weight:600;color:${cardData[sc].netProfit>=0?'var(--gold)':'var(--crimson)'};">${fmtNet(cardData[sc].netProfit)}</div>
    </div>
  `).join('');

  const d   = scenarios.decent;
  const net = netProfitFor(d);
  const pPct = Math.round(producerSplit*100);
  const dPct = 100-pPct;
  document.getElementById('cumulSummary').innerHTML = `
    <div style="background:var(--surface3);border-radius:var(--radius);padding:.75rem 1rem;">
      <div style="font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;">Revenue</div>
      <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--white);">${fmt(totalRevenueFor(d))}</div>
    </div>
    <div style="background:var(--surface3);border-radius:var(--radius);padding:.75rem 1rem;">
      <div style="font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;">Net profit</div>
      <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:${net>=0?'var(--gold)':'var(--crimson)'};">${fmtNet(net)}</div>
    </div>
    <div style="background:var(--surface3);border-radius:var(--radius);padding:.75rem 1rem;">
      <div style="font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;">Sharings</div>
      <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--white);">${pPct}% / ${dPct}%</div>
    </div>`;
}
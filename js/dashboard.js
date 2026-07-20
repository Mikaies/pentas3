/* ── SCENARIO SWITCHER ── */
let activeOverviewScenario = 'decent';

/* ── BREAK-EVEN INDICATOR ── */
function renderBreakEven(){
  const fixed = totalFixed();
  const pricePerEp = cfg.price;
  const paidEps = cfg.paidEps;
  const revenuePerUser = pricePerEp * paidEps;
  const netRevenuePerUser = revenuePerUser * 0.60;
  const breakEvenUsers = Math.ceil(fixed / netRevenuePerUser);

  const data = calcMonthData();
  const totalPaying = data.reduce((a,d)=>a+d.paying,0);
  const pct = Math.min((totalPaying / breakEvenUsers) * 100, 100);
  const achieved = totalPaying >= breakEvenUsers;

  const barColor = achieved ? 'var(--gold)' : pct > 60 ? '#e09000' : 'var(--crimson)';
  const statusText = achieved
    ? '✅ Break-even achieved!'
    : `Still need ${(breakEvenUsers - totalPaying).toLocaleString()} more paying users`;
  const statusColor = achieved ? 'var(--gold)' : 'var(--crimson)';

  document.getElementById('breakevenCard').innerHTML = `
    <div class="breakeven-title">💡 Break-even Point</div>
    <div class="breakeven-row">
      <div class="breakeven-stat">Need: <strong>${breakEvenUsers.toLocaleString()} paying users</strong> to cover <strong>${fmt(fixed)}</strong> fixed costs</div>
      <div class="breakeven-stat">Current: <strong>${totalPaying.toLocaleString()} paying users</strong></div>
    </div>
    <div class="breakeven-bar-wrap">
      <div class="breakeven-bar" style="width:${pct.toFixed(1)}%;background:${barColor}"></div>
    </div>
    <div class="breakeven-status" style="color:${statusColor}">${statusText} · ${pct.toFixed(0)}%</div>
  `;
}

function switchOverviewScenario(sc){
  activeOverviewScenario = sc;
  cfg = { ...scenarios[sc] };

  ['min','decent','max'].forEach(s=>{
    const btn = document.getElementById('switch-'+s);
    btn.className = 'sc-switch-btn' + (s===sc?' active '+s:'');
  });

  buildConfigBanner();
  buildConfigPills();
  renderOverviewMetrics();
  renderMainChart();
  renderTable();
  renderBreakEven();
  renderProjTable();
  buildCostCards();
  buildCostChart();
  renderPayoutAmounts();
  buildPayoutTable();
}

/* ═══════════════════════════════════════════
   BUILD DASHBOARD
═══════════════════════════════════════════ */
function buildDashboard(){
  activeOverviewScenario = 'decent';
  cfg = { ...scenarios.decent };

  document.getElementById('dash-sub').textContent=
    scenarios.decent.dramas+' dramas (decent) · RM '+scenarios.decent.price.toFixed(2)+'/ep · '+scenarios.decent.paidEps+' paid eps';

  ['min','decent','max'].forEach(s=>{
    const btn = document.getElementById('switch-'+s);
    btn.className = 'sc-switch-btn' + (s==='decent'?' active decent':'');
  });

  buildConfigBanner();
  buildConfigPills();
  renderOverviewMetrics();
  renderMainChart();
  renderTable();
  renderBreakEven();
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
  <div class="metric-card"><div class="metric-label">Total viewers (12mo)</div><div class="metric-val">${tU.toLocaleString()}</div><div class="metric-note">${(cfg.conversionRate*100).toFixed(1)}% conversion rate</div></div>
  <div class="metric-card"><div class="metric-label">Total revenue</div><div class="metric-val">${fmt(tRev)}</div><div class="metric-note">RM ${cfg.price.toFixed(2)} × ${PAID_EPISODES} paid eps</div></div>
  <div class="metric-card"><div class="metric-label">Platform fee (${(cfg.platformFee*100).toFixed(0)}%)</div><div class="metric-val">${fmt(tDC)}</div><div class="metric-note">App store / gateway cut</div></div>
  <div class="metric-card gold-accent"><div class="metric-label">Net revenue</div><div class="metric-val">${fmt(tGP)}</div><div class="metric-note">Before fixed costs</div></div>
  <div class="metric-card"><div class="metric-label">Total fixed cost</div><div class="metric-val">${fmt(totalFixed())}</div><div class="metric-note">Production + Management + Marketing</div></div>
  <div class="metric-card ${net>=0?'gold-accent':'red-accent'}"><div class="metric-label">Net profit</div><div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div><div class="metric-note">12 months</div></div>`;
}

/* ═══════════════════════════════════════════
   OVERVIEW TABLE
═══════════════════════════════════════════ */
function renderTable(){
  const data=calcMonthData().slice(0,6);
  const mf=monthlyFixed();
  const rows=data.map((d,i)=>{
    const net=d.gp-mf;
    return `<tr onclick="showDetail(${i})"><td style="font-weight:500;white-space:nowrap">Month ${i+1}</td><td><span class="badge ${phaseStyle(PHASES[i])}">${PHASES[i]}</span></td><td>${d.paying.toLocaleString()}</td><td>${fmt(d.rev)}</td><td style="color:var(--muted2)">${fmt(d.dc)}</td><td style="color:var(--gold)">${fmt(d.gp)}</td><td class="${net>=0?'pos-val':'neg-val'}">${fmtNet(net)}</td></tr>`;
  });
  const tP=data.reduce((a,d)=>a+d.paying,0),tR=data.reduce((a,d)=>a+d.rev,0),tD=data.reduce((a,d)=>a+d.dc,0),tG=data.reduce((a,d)=>a+d.gp,0),tn=data.reduce((a,d)=>a+(d.gp-mf),0);
  rows.push(`<tr style="background:var(--surface2)"><td style="font-weight:700">TOTAL</td><td>—</td><td>${tP.toLocaleString()}</td><td>${fmt(tR)}</td><td style="color:var(--muted2)">${fmt(tD)}</td><td style="color:var(--gold)">${fmt(tG)}</td><td class="${tn>=0?'pos-val':'neg-val'}">${fmtNet(tn)}</td></tr>`);
  document.getElementById('tableBody').innerHTML=rows.join('');
}

function showDetail(i){
  const d=calcMonthData()[i];
  const mf=monthlyFixed();
  const net=d.gp-mf;
  document.getElementById('detailPanel').classList.add('show');
  document.getElementById('detailTitle').textContent='Month '+(i+1)+' — '+PHASES[i]+(HOLIDAYS[i]?' · '+HOLIDAYS[i]:'');
  document.getElementById('detailGrid').innerHTML=`
    <div class="detail-item"><div class="detail-item-label">Total users</div><div class="detail-item-val">${d.users.toLocaleString()}</div></div>
    <div class="detail-item"><div class="detail-item-label">Paying users</div><div class="detail-item-val">${d.paying.toLocaleString()}</div></div>
    <div class="detail-item"><div class="detail-item-label">Revenue</div><div class="detail-item-val">${fmt(d.rev)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Direct cost (40%)</div><div class="detail-item-val">${fmt(d.dc)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Gross profit (60%)</div><div class="detail-item-val" style="color:var(--gold)">${fmt(d.gp)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Monthly fixed</div><div class="detail-item-val">${fmt(mf)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Net profit</div><div class="detail-item-val" style="color:${net>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(net)}</div></div>
    ${HOLIDAYS[i]?`<div class="detail-item"><div class="detail-item-label">Holiday</div><div class="detail-item-val" style="font-size:13px">${HOLIDAYS[i]}</div></div>`:''}`;
}

/* ═══════════════════════════════════════════
   PROJECTION TABLE
═══════════════════════════════════════════ */
function renderProjTable(){
  const data=calcMonthData();
  const mf=monthlyFixed();
  const rows=data.map((d,i)=>{
    const net=d.gp-mf;
    return `<tr><td style="font-weight:500;white-space:nowrap">Month ${i+1}</td><td><span class="badge ${phaseStyle(PHASES[i])}">${PHASES[i]}</span>${HOLIDAYS[i]?` <span style="font-size:10px;color:var(--muted)">· ${HOLIDAYS[i]}</span>`:''}</td><td>${d.users.toLocaleString()}</td><td>${d.paying.toLocaleString()}</td><td>${fmt(d.rev)}</td><td style="color:var(--muted2)">${fmt(d.dc)}</td><td style="color:var(--gold)">${fmt(d.gp)}</td><td style="color:var(--muted2)">${fmt(mf)}</td><td class="${net>=0?'pos-val':'neg-val'}">${fmtNet(net)}</td></tr>`;
  });
  const tU=data.reduce((a,d)=>a+d.users,0),tP=data.reduce((a,d)=>a+d.paying,0),tR=data.reduce((a,d)=>a+d.rev,0),tD=data.reduce((a,d)=>a+d.dc,0),tG=data.reduce((a,d)=>a+d.gp,0),tn=netProfit();
  rows.push(`<tr style="background:var(--surface2)"><td style="font-weight:700">TOTAL</td><td>—</td><td>${tU.toLocaleString()}</td><td>${tP.toLocaleString()}</td><td>${fmt(tR)}</td><td style="color:var(--muted2)">${fmt(tD)}</td><td style="color:var(--gold)">${fmt(tG)}</td><td style="color:var(--muted2)">${fmt(totalFixed())}</td><td class="${tn>=0?'pos-val':'neg-val'}">${fmtNet(tn)}</td></tr>`);
  document.getElementById('projTableBody').innerHTML=rows.join('');
}

function buildHolidayCards(){
  document.getElementById('holidayCards').innerHTML=HOLIDAY_INFO.map(h=>
    `<div style="padding:.9rem;background:var(--surface2);border-radius:var(--radius);border-left:3px solid ${h.color}"><div style="font-size:10px;color:var(--muted);margin-bottom:3px">${h.month}</div><div style="font-size:12px;font-weight:500;color:var(--white);margin-bottom:3px">${h.name}</div><div style="font-size:11px;color:var(--muted2)">${h.desc}</div></div>`
  ).join('');
}

async function buildHistoryPage(){
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px;">Loading...</div>';

  const user = auth.currentUser;
  if(!user){
    historyList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted);font-size:13px;">Please log in to view history.</div>';
    return;
  }

  const entries = await loadHistory(user.uid);

  if(entries.length === 0){
    historyList.innerHTML = `
      <div style="text-align:center;padding:3rem;color:var(--muted);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;margin-bottom:12px;opacity:.4;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div style="font-size:13px;">No saved history yet. Enter the dashboard to save your first entry.</div>
      </div>`;
    return;
  }

  // Sort: pinned first, then by date
  entries.sort((a, b) => {
    if(a.pinned && !b.pinned) return -1;
    if(!a.pinned && b.pinned) return 1;
    const aTime = a.savedAt ? a.savedAt.seconds : 0;
    const bTime = b.savedAt ? b.savedAt.seconds : 0;
    return bTime - aTime;
  });

  historyList.innerHTML = entries.map(e => {
    const net = e.netProfit || 0;
    const date = e.savedAt ? new Date(e.savedAt.seconds * 1000).toLocaleString('en-MY', {
      day:'numeric', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    }) : '—';
    const netColor = net >= 0 ? 'var(--gold)' : 'var(--crimson)';
    const netText = net >= 0 ? `+ RM ${Math.round(net).toLocaleString()}` : `− RM ${Math.round(Math.abs(net)).toLocaleString()}`;
    const label = e.label || '';
    const pinIcon = e.pinned ? '📌 ' : '';
    const entryDataStr = JSON.stringify(e).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <div class="history-card" data-id="${e.id}" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;">
        <div style="flex:1;min-width:0;">
          ${label ? `<div style="font-size:13px;font-weight:600;color:var(--white);margin-bottom:2px;">${pinIcon}${label}</div>` : ''}
          <div style="font-size:${label ? '11px' : '13px'};font-weight:${label ? '400' : '600'};color:${label ? 'var(--muted)' : 'var(--white)'};margin-bottom:4px;">${pinIcon}${date}</div>
          <div style="font-size:11px;color:var(--muted2);margin-bottom:4px;">
            ${e.dramas} drama(s) · RM ${e.price}/ep · ${e.paidEps} paid eps · Fixed cost RM ${Math.round(e.fixedCost || 0).toLocaleString()}
          </div>
          <div style="font-size:12px;font-weight:600;color:${netColor};">Net profit: ${netText}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <button class="icon-btn" onclick="restoreHistory('${e.id}', '${entryDataStr}')" style="white-space:nowrap;">Restore</button>
          <div class="hist-menu-wrap" style="position:relative;">
            <button class="icon-btn hist-dots-btn" onclick="toggleHistMenu('${e.id}')" style="padding:6px 10px;font-size:16px;letter-spacing:2px;">···</button>
            <div id="hist-menu-${e.id}" style="display:none;position:absolute;right:0;top:36px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);min-width:140px;z-index:100;overflow:hidden;">
              <button onclick="histRename('${e.id}')" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--white);font-size:12px;text-align:left;cursor:pointer;">✏️ Rename</button>
              <button onclick="histPin('${e.id}', ${!e.pinned})" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--white);font-size:12px;text-align:left;cursor:pointer;">${e.pinned ? '📌 Unpin' : '📌 Pin to top'}</button>
              <button onclick="histDelete('${e.id}')" style="display:block;width:100%;padding:9px 14px;background:none;border:none;color:var(--crimson);font-size:12px;text-align:left;cursor:pointer;">🗑️ Delete</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Close menus when clicking outside
  document.addEventListener('click', (e)=>{
    if(!e.target.closest('.hist-menu-wrap')){
      document.querySelectorAll('[id^="hist-menu-"]').forEach(m => m.style.display = 'none');
    }
  }, { once: true });
}

function toggleHistMenu(id){
  const menu = document.getElementById('hist-menu-'+id);
  const allMenus = document.querySelectorAll('[id^="hist-menu-"]');
  allMenus.forEach(m => { if(m.id !== 'hist-menu-'+id) m.style.display = 'none'; });
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  // Re-add outside click listener
  setTimeout(()=>{
    document.addEventListener('click', (e)=>{
      if(!e.target.closest('.hist-menu-wrap')){
        document.querySelectorAll('[id^="hist-menu-"]').forEach(m => m.style.display = 'none');
      }
    }, { once: true });
  }, 10);
}

async function histDelete(id){
  if(!confirm('Delete this history entry?')) return;
  const user = auth.currentUser;
  if(!user) return;
  await deleteHistoryEntry(user.uid, id);
  buildHistoryPage();
}

async function histPin(id, pinned){
  const user = auth.currentUser;
  if(!user) return;
  await pinHistoryEntry(user.uid, id, pinned);
  buildHistoryPage();
}

async function histRename(id){
  const newName = prompt('Enter a name for this entry:');
  if(newName === null) return;
  const user = auth.currentUser;
  if(!user) return;
  await renameHistoryEntry(user.uid, id, newName.trim());
  buildHistoryPage();
}

function restoreHistory(id, entryStr){
  let entry;
  try {
    entry = typeof entryStr === 'string' ? JSON.parse(entryStr.replace(/&quot;/g, '"')) : entryStr;
  } catch(e){ console.error('restore parse error', e); return; }
  if(!entry) return;
  globalDramas = entry.dramas || 1;
  globalEps = entry.paidEps || 4;
  if(entry.scenarios){
    scenarios.min = entry.scenarios.min || scenarios.min;
    scenarios.decent = entry.scenarios.decent || scenarios.decent;
    scenarios.max = entry.scenarios.max || scenarios.max;
  }
  cfg = { ...scenarios.decent };
  buildDashboard();
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('.nav-item[data-page="overview"]').classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-overview').classList.add('active');
}
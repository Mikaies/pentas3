/* ═══════════════════════════════════════════
   MAIN CHART — 3 tabs: users / revenue / profit
═══════════════════════════════════════════ */
function renderMainChart(){
  if(chartInst){ chartInst.destroy(); chartInst=null; }
  const ctx  = document.getElementById('mainChart').getContext('2d');
  const data = calcMonthData();
  const gc   = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tc   = isLight ? '#888' : '#666';
  let datasets, legendHTML, type = 'bar';

  if(currentChart === 'users'){
    datasets = [{
      label: 'Paying users',
      data: data.map(d => d.paying),
      backgroundColor: data.map((_,i) => i < 3 ? '#BE1E2D' : i < 6 ? '#D4AF37' : 'rgba(245,245,245,0.2)'),
      borderRadius: 4
    }];
    legendHTML = `
      <div class="leg"><div class="leg-sq" style="background:#BE1E2D"></div>Peak months (1–3)</div>
      <div class="leg"><div class="leg-sq" style="background:#D4AF37"></div>Decline (4–6)</div>
      <div class="leg"><div class="leg-sq" style="background:rgba(245,245,245,0.2)"></div>Steady state (7–12)</div>`;

  } else if(currentChart === 'revenue'){
    datasets = [{
      label: 'Revenue',
      data: data.map(d => Math.round(d.revenue)),
      backgroundColor: data.map((_,i) => i < 3 ? '#BE1E2D' : i < 6 ? '#D4AF37' : 'rgba(245,245,245,0.2)'),
      borderRadius: 4
    }];
    legendHTML = `
      <div class="leg"><div class="leg-sq" style="background:#BE1E2D"></div>Peak revenue (1–3)</div>
      <div class="leg"><div class="leg-sq" style="background:#D4AF37"></div>Declining (4–6)</div>
      <div class="leg"><div class="leg-sq" style="background:rgba(245,245,245,0.2)"></div>Steady (7–12)</div>`;

  } else {
    type = 'line';
    const nd = data.map(d => Math.round(d.profit));
    datasets = [{
      label: 'Net profit',
      data: nd,
      borderColor: '#BE1E2D',
      backgroundColor: 'rgba(190,30,45,0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: nd.map(v => v >= 0 ? '#D4AF37' : '#BE1E2D'),
      borderWidth: 2
    }];
    legendHTML = `<div class="leg"><div class="leg-sq" style="background:#BE1E2D;border-radius:50%"></div>Monthly net profit</div>`;
  }

  document.getElementById('chartLegend').innerHTML = legendHTML;
  chartInst = new Chart(ctx, {
    type,
    data: { labels: MONTH_LABELS, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c =>
          currentChart === 'users'
            ? c.dataset.label + ': ' + Math.round(c.parsed.y).toLocaleString()
            : (c.parsed.y >= 0 ? '+ ' : '− ') + 'RM ' + Math.round(Math.abs(c.parsed.y)).toLocaleString()
        }}
      },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 },
          callback: v => currentChart === 'users' ? v.toLocaleString() : 'RM ' + Math.abs(v).toLocaleString()
        }}
      }
    }
  });
}

/* ═══════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════ */
function showDetail(i){
  const d  = calcMonthData()[i];
  const mf = monthlyFixed();
  document.getElementById('detailPanel').classList.add('show');
  document.getElementById('detailTitle').textContent = 'Month ' + (i+1) + ' — ' + PHASES[i];
  document.getElementById('detailGrid').innerHTML = `
    <div class="detail-item"><div class="detail-item-label">Paying users</div><div class="detail-item-val">${d.paying.toLocaleString()}</div></div>
    <div class="detail-item"><div class="detail-item-label">Revenue</div><div class="detail-item-val">${fmt(d.revenue)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Monthly fixed cost</div><div class="detail-item-val">${fmt(mf)}</div></div>
    <div class="detail-item"><div class="detail-item-label">Net profit</div><div class="detail-item-val" style="color:${d.profit>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(d.profit)}</div></div>`;
}

/* ═══════════════════════════════════════════
   COST BREAKDOWN PAGE
═══════════════════════════════════════════ */
function buildCostCards(){
  const tf  = totalFixed();
  const pct = x => tf > 0 ? ((x/tf)*100).toFixed(1) + '%' : '0%';
  document.getElementById('costCards').innerHTML = `
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;">Production</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.production)}</div>
      <div style="font-size:11px;color:var(--muted2);">${pct(cfg.production)} of total fixed cost</div>
    </div>
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--crimson);margin-bottom:8px;">Management</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.management)}</div>
      <div style="font-size:11px;color:var(--muted2);">${pct(cfg.management)} of total fixed cost</div>
    </div>
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a0522d;margin-bottom:8px;">Marketing</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.marketing)}</div>
      <div style="font-size:11px;color:var(--muted2);">${pct(cfg.marketing)} of total fixed cost</div>
    </div>`;
}

function buildCostChart(){
  if(costChartInst){ costChartInst.destroy(); costChartInst=null; }
  const ctx = document.getElementById('costChart').getContext('2d');
  const rev = totalRevenue();
  const net = netProfit();
  costChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Revenue','Production','Management','Marketing','Net Profit'],
      datasets: [{
        data: [Math.round(rev), cfg.production, cfg.management, cfg.marketing, Math.round(Math.abs(net))],
        backgroundColor: [
          'rgba(212,175,55,0.8)',
          'rgba(190,30,45,0.7)',
          'rgba(143,21,32,0.7)',
          'rgba(160,82,45,0.7)',
          net >= 0 ? 'rgba(212,175,55,0.9)' : 'rgba(190,30,45,0.5)'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => 'RM ' + Math.round(c.parsed.y).toLocaleString() } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 11 }, callback: v => 'RM ' + v.toLocaleString() } }
      }
    }
  });
}

/* ═══════════════════════════════════════════
   PAYOUT PAGE
═══════════════════════════════════════════ */
function renderPayoutAmounts(){
  const net = netProfit();
  if(net > 0){
    document.getElementById('po-producer').textContent = fmt(net * producerSplit);
    document.getElementById('po-director').textContent = fmt(net * (1 - producerSplit));
  } else {
    ['po-producer','po-director'].forEach(id => document.getElementById(id).textContent = '—');
  }
}

function updatePayoutSplit(val){
  producerSplit = parseInt(val) / 100;
  const dPct = Math.round((1 - producerSplit) * 100);
  document.getElementById('producer-pct-label').textContent = val + '%';
  document.getElementById('po-producer-pct').textContent    = val + '%';
  document.getElementById('po-director-pct').textContent    = dPct + '%';
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
}

function buildPayoutChart(){
  if(payoutChartInst){ payoutChartInst.destroy(); payoutChartInst=null; }
  const ctx  = document.getElementById('payoutChart').getContext('2d');
  const net  = Math.max(0, netProfit());
  const pPct = Math.round(producerSplit * 100);
  const dPct = Math.round((1 - producerSplit) * 100);
  payoutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Producer (${pPct}%)`, `Director (${dPct}%)`],
      datasets: [{
        data: [net * producerSplit, net * (1 - producerSplit)],
        backgroundColor: ['rgba(212,175,55,0.85)','rgba(245,245,245,0.5)'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'right', labels: { color: '#aaa', font: { size: 11 } } },
        tooltip: { callbacks: { label: c => c.label + ': RM ' + Math.round(c.parsed).toLocaleString() } }
      }
    }
  });
}

function buildPayoutTable(){
  const net    = netProfit();
  const insight = document.getElementById('producerInsight');
  const pPct   = Math.round(producerSplit * 100);
  const dPct   = Math.round((1 - producerSplit) * 100);
  if(net > 0){
    insight.innerHTML = `<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      With <strong style="color:var(--gold)">${fmt(net)}</strong> net profit:<br>
      Producer earns <strong style="color:var(--gold)">${fmt(net*producerSplit)}</strong> ·
      Director earns <strong style="color:var(--white)">${fmt(net*(1-producerSplit))}</strong>.
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML = `
      <tr><td>Producer</td><td>${pPct}%</td><td class="pos-val">${fmt(net*producerSplit)}</td><td>—</td></tr>
      <tr><td>Director</td><td>${dPct}%</td><td>${fmt(net*(1-producerSplit))}</td><td>—</td></tr>`;
  } else {
    insight.innerHTML = `<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      Currently showing a loss of <strong style="color:var(--crimson)">${fmtNet(net)}</strong>. No payout until net profit is positive.
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML = `
      <tr><td colspan="4" style="color:var(--muted);text-align:center;padding:1rem;">No payout — net profit is negative</td></tr>`;
  }
}

function buildHolidayCards(){
  const el = document.getElementById('holidayCards');
  if(el) el.innerHTML = '';
}
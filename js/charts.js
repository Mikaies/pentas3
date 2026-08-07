/* ═══════════════════════════════════════════
   MAIN CHART — Monthly breakdown (paying users)
═══════════════════════════════════════════ */
function renderMainChart(){
  if(chartInst){ chartInst.destroy(); chartInst=null; }
  const ctx  = document.getElementById('mainChart').getContext('2d');
  const data = calcMonthData();
  const gc   = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tc   = isLight ? '#888' : '#666';

  const datasets = [{
    label: 'Paying users',
    data: data.map(d => d.paying),
    borderColor: '#BE1E2D',
    backgroundColor: 'rgba(190,30,45,0.15)',
    fill: true,
    tension: 0.4,
    pointRadius: data.map((_,i) => i < 6 ? 5 : 3),
    pointBackgroundColor: data.map((_,i) => i < 3 ? '#BE1E2D' : i < 6 ? '#D4AF37' : 'rgba(245,245,245,0.4)'),
    borderWidth: 2.5
  }];
  const legendHTML = `
    <div class="leg"><div class="leg-sq" style="background:#BE1E2D;border-radius:50%"></div>Peak (M1–3)</div>
    <div class="leg"><div class="leg-sq" style="background:#D4AF37;border-radius:50%"></div>Decline (M4–6)</div>
    <div class="leg"><div class="leg-sq" style="background:rgba(245,245,245,0.4);border-radius:50%"></div>Steady (M7–12)</div>`;

  document.getElementById('chartLegend').innerHTML = legendHTML;
  chartInst = new Chart(ctx, {
    type: 'line',
    data: { labels: MONTH_LABELS, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => 'Paying users: ' + Math.round(c.parsed.y).toLocaleString() } }
      },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } },
        y: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, callback: v => v.toLocaleString() } }
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
   PAYOUT PAGE
═══════════════════════════════════════════ */
function renderPayoutAmounts(){
  const net = netProfit();
  if(net > 0){
    document.getElementById('po-producer').textContent = fmt(net * producerSplit);
    document.getElementById('po-director').textContent = fmt(net * directorSplit);
  } else {
    ['po-producer','po-director'].forEach(id => document.getElementById(id).textContent = '—');
  }
}

function updateProducerSplit(val){
  let pVal = Math.round(parseFloat(val));
  if(isNaN(pVal)) pVal = Math.round(producerSplit*100);
  pVal = Math.min(95, Math.max(10, pVal));
  const dVal = 100 - pVal;
  producerSplit = pVal / 100;
  directorSplit = dVal / 100;

  document.getElementById('producer-pct-input').value       = pVal;
  document.getElementById('po-producer-pct').textContent    = pVal + '%';
  document.getElementById('director-pct-input').value       = dVal;
  document.getElementById('po-director-pct').textContent    = dVal + '%';
  document.getElementById('producer-split-slider').value    = pVal;
  document.getElementById('director-split-slider').value    = dVal;

  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
  buildCumulativeChart();
}

function updateDirectorSplit(val){
  let dVal = Math.round(parseFloat(val));
  if(isNaN(dVal)) dVal = Math.round(directorSplit*100);
  dVal = Math.min(90, Math.max(5, dVal));
  const pVal = 100 - dVal;
  directorSplit = dVal / 100;
  producerSplit = pVal / 100;

  document.getElementById('director-pct-input').value       = dVal;
  document.getElementById('po-director-pct').textContent    = dVal + '%';
  document.getElementById('producer-pct-input').value       = pVal;
  document.getElementById('po-producer-pct').textContent    = pVal + '%';
  document.getElementById('director-split-slider').value    = dVal;
  document.getElementById('producer-split-slider').value    = pVal;

  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
  buildCumulativeChart();
}

function buildPayoutChart(){
  if(payoutChartInst){ payoutChartInst.destroy(); payoutChartInst=null; }
  const ctx  = document.getElementById('payoutChart').getContext('2d');
  const net  = Math.max(0, netProfit());
  const pPct = Math.round(producerSplit * 100);
  const dPct = Math.round(directorSplit * 100);
  payoutChartInst = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Producer (${pPct}%)`, `Director (${dPct}%)`],
      datasets: [{
        data: [net * producerSplit, net * directorSplit],
        backgroundColor: ['rgba(212,175,55,0.85)', 'rgba(245,245,245,0.5)'],
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
  const net     = netProfit();
  const insight = document.getElementById('producerInsight');
 const pPct    = Math.round(producerSplit * 100);
  const dPct    = Math.round(directorSplit * 100);
  if(net > 0){
    insight.innerHTML = `<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      With <strong style="color:var(--gold)">${fmt(net)}</strong> net profit:<br>
      Producer earns <strong style="color:var(--gold)">${fmt(net*producerSplit)}</strong> ·
      Director earns <strong style="color:var(--white)">${fmt(net*directorSplit)}</strong>.
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML = `
      <tr><td>Producer</td><td>${pPct}%</td><td class="pos-val">${fmt(net*producerSplit)}</td><td>—</td></tr>
      <tr><td>Director</td><td>${dPct}%</td><td>${fmt(net*directorSplit)}</td><td>—</td></tr>`; 
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
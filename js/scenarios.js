/* ═══════════════════════════════════════════
   SCENARIOS COMPARISON PAGE
═══════════════════════════════════════════ */
function buildScenariosPage(){
  const SC_COLORS = { min:'#cd853f', decent:'#D4AF37', max:'#e05060' };
  const SC_LABELS = { min:'Minimum', decent:'Decent', max:'Maximum' };
  const gc = 'rgba(255,255,255,0.05)';

  // Top metric cards
  const metricHTML = ['min','decent','max'].map(sc=>{
    const s     = scenarios[sc];
    const net   = netProfitFor(s);
    const rev   = totalRevenueFor(s);
    const fixed = totalFixedFor(s);
    const roi   = fixed > 0 ? ((net/fixed)*100) : 0;
    return `
      <div class="metric-card ${net>=0?'gold-accent':'red-accent'}" style="border-top-color:${SC_COLORS[sc]}">
        <div class="metric-label" style="color:${SC_COLORS[sc]}">${SC_LABELS[sc]}</div>
        <div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div>
        <div class="metric-note">${fmt(rev)} revenue · ${fmt(fixed)} fixed · ROI ${roi.toFixed(0)}%</div>
      </div>`;
  }).join('');
  document.getElementById('scCompareMetrics').innerHTML = metricHTML;

  // Legend
  document.getElementById('scCompareLegend').innerHTML = ['min','decent','max'].map(sc=>
    `<div class="leg"><div class="leg-sq" style="background:${SC_COLORS[sc]};border-radius:50%;width:10px;height:10px;"></div>
    <span style="color:${SC_COLORS[sc]};font-weight:600">${SC_LABELS[sc]}</span></div>`
  ).join('');

  // Line chart — monthly net profit per scenario
  if(scCompareChartInst){ scCompareChartInst.destroy(); scCompareChartInst=null; }
  const ctx = document.getElementById('scCompareChart').getContext('2d');
  const datasets = ['min','decent','max'].map(sc=>{
    const s = scenarios[sc];
    return {
      label: SC_LABELS[sc],
      data: calcMonthDataFor(s).map(d => Math.round(d.profit)),
      borderColor: SC_COLORS[sc],
      backgroundColor: SC_COLORS[sc]+'22',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: SC_COLORS[sc],
      borderWidth: 2.5
    };
  });
  scCompareChartInst = new Chart(ctx, {
    type: 'line',
    data: { labels: MONTH_LABELS, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c =>
          `${c.dataset.label}: ${c.parsed.y>=0?'+ ':'− '}RM ${Math.abs(c.parsed.y).toLocaleString()}`
        }}
      },
      scales: {
        x: { grid: { color: gc }, ticks: { color: '#666', font: { size: 10 } } },
        y: { grid: { color: gc }, ticks: { color: '#666', font: { size: 10 },
          callback: v => (v>=0?'':'−')+'RM '+Math.abs(v).toLocaleString()
        }}
      }
    }
  });

  // Prediction
  buildScenarioPrediction();

  // Detail table
  const scKeys = ['min','decent','max'];
  const rows = [
    ['Peak paying users', ...scKeys.map(sc => (scenarios[sc].peakUsers||0).toLocaleString()+' users')],
    ['Price per episode', ...scKeys.map(sc => 'RM '+scenarios[sc].price.toFixed(2)+'/ep')],
    ['Paid episodes',     ...scKeys.map(sc => scenarios[sc].paidEps+' eps')],
    ['Production cost',  ...scKeys.map(sc => fmt(scenarios[sc].production))],
    ['Management cost',  ...scKeys.map(sc => fmt(scenarios[sc].management))],
    ['Marketing cost',   ...scKeys.map(sc => fmt(scenarios[sc].marketing))],
    ['Total fixed cost', ...scKeys.map(sc => fmt(totalFixedFor(scenarios[sc])))],
    ['Total revenue',    ...scKeys.map(sc => fmt(totalRevenueFor(scenarios[sc])))],
    ['Net profit',       ...scKeys.map(sc => { const n=netProfitFor(scenarios[sc]); return `<span class="${n>=0?'pos-val':'neg-val'}">${fmtNet(n)}</span>`; })],
    ['ROI on fixed cost',...scKeys.map(sc => { const n=netProfitFor(scenarios[sc]); const f=totalFixedFor(scenarios[sc]); const r=f>0?(n/f*100):0; return `<span class="${r>=0?'pos-val':'neg-val'}">${r.toFixed(0)}%</span>`; })],
    ['Producer payout',  ...scKeys.map(sc => { const n=Math.max(0,netProfitFor(scenarios[sc])); const s=(payoutSplits[sc]||{producer:0.5}).producer; return n>0?`<span class="pos-val">${fmt(n*s)}</span>`:'—'; })],
    ['Director payout',  ...scKeys.map(sc => { const n=Math.max(0,netProfitFor(scenarios[sc])); const s=(payoutSplits[sc]||{director:0.5}).director; return n>0?`<span class="pos-val">${fmt(n*s)}</span>`:'—'; })],
  ].map(row => `<tr>${row.map((c,i) => i===0
    ? `<td style="font-weight:500;color:var(--muted2)">${c}</td>`
    : `<td>${c}</td>`).join('')}</tr>`).join('');
  document.getElementById('scDetailTable').innerHTML = rows;
}

/* ═══════════════════════════════════════════
   SCENARIO PREDICTION ENGINE
═══════════════════════════════════════════ */
function buildScenarioPrediction(){
  const nets  = { min: netProfitFor(scenarios.min), decent: netProfitFor(scenarios.decent), max: netProfitFor(scenarios.max) };
  const fixed = { min: totalFixedFor(scenarios.min), decent: totalFixedFor(scenarios.decent), max: totalFixedFor(scenarios.max) };
  const rois  = {
    min:    fixed.min    > 0 ? nets.min    / fixed.min    : 0,
    decent: fixed.decent > 0 ? nets.decent / fixed.decent : 0,
    max:    fixed.max    > 0 ? nets.max    / fixed.max    : 0,
  };

  const maxNet   = Math.max(...Object.values(nets));
  const maxFixed = Math.max(...Object.values(fixed));
  const scores   = {};
  ['min','decent','max'].forEach(sc=>{
    scores[sc] = (maxNet > 0 ? Math.max(0, nets[sc]/maxNet)*50 : 0)
               + rois[sc] * 30
               + (1 - fixed[sc]/maxFixed) * 20;
  });

  const best   = Object.keys(scores).reduce((a,b) => scores[a]>scores[b]?a:b);
  const LABELS = { min:'Minimum', decent:'Decent', max:'Maximum' };
  const COLORS = { min:'#cd853f', decent:'#D4AF37', max:'#e05060' };
  const EMOJIS = { min:'🌿', decent:'⚖️', max:'🚀' };

  const allProfit  = Object.values(nets).every(n => n >= 0);
  const noneProfit = Object.values(nets).every(n => n < 0);
  const profList   = Object.entries(nets).filter(([,n]) => n>=0).map(([k]) => LABELS[k]);

  let reasoning = '';
  if(noneProfit){
    reasoning = 'All three scenarios currently project a loss. Consider increasing peak paying users or reducing fixed costs.';
  } else if(allProfit){
    reasoning = `All three scenarios are profitable. The <strong style="color:${COLORS[best]}">${LABELS[best]}</strong> scenario leads with the best blend of net profit and ROI.`;
  } else {
    reasoning = `Only ${profList.join(' and ')} scenario(s) are profitable. The <strong style="color:${COLORS[best]}">${LABELS[best]}</strong> scenario offers the best risk-adjusted return.`;
  }

  document.getElementById('scPredictionBody').innerHTML = `
    <div style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(212,175,55,.15);border:2px solid ${COLORS[best]};display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">${EMOJIS[best]}</div>
      <div>
        <div style="font-family:var(--font-head);font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${COLORS[best]};margin-bottom:4px;">Best Scenario: ${LABELS[best]}</div>
        <div style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:10px;">${reasoning}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          <div style="background:var(--surface2);border-radius:var(--radius);padding:8px 14px;">
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">Net profit</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:${nets[best]>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(nets[best])}</div>
          </div>
          <div style="background:var(--surface2);border-radius:var(--radius);padding:8px 14px;">
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">ROI</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--gold)">${(rois[best]*100).toFixed(0)}%</div>
          </div>
          <div style="background:var(--surface2);border-radius:var(--radius);padding:8px 14px;">
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">Producer payout</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--gold)">${nets[best]>0?fmt(nets[best]*((payoutSplits[best]||{producer:0.5}).producer)):'—'}</div>
          </div>
        </div>
      </div>
    </div>`;
}
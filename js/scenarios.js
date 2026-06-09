/* ═══════════════════════════════════════════
   SCENARIOS COMPARISON PAGE
═══════════════════════════════════════════ */
function buildScenariosPage(){
  const SC_COLORS = { min:'#cd853f', decent:'#D4AF37', max:'#e05060' };
  const SC_LABELS = { min:'Minimum', decent:'Decent', max:'Maximum' };
  const labels=['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];
  const gc='rgba(255,255,255,0.05)';

  // Top metric cards
  const metricHTML = ['min','decent','max'].map(sc=>{
    const s = scenarios[sc];
    const net = netProfitFor(s);
    const rev = calcMonthDataFor(s).reduce((a,d)=>a+d.rev,0);
    const fixed = totalFixedFor(s);
    const roi = fixed>0?((net/fixed)*100):0;
    return `<div class="metric-card ${net>=0?'gold-accent':'red-accent'}" style="border-top-color:${SC_COLORS[sc]}">
      <div class="metric-label" style="color:${SC_COLORS[sc]}">${SC_LABELS[sc]}</div>
      <div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div>
      <div class="metric-note">${fmt(rev)} revenue · ${fmt(fixed)} fixed · ROI ${roi.toFixed(0)}%</div>
    </div>`;
  }).join('');
  document.getElementById('scCompareMetrics').innerHTML = metricHTML;

  // Legend
  document.getElementById('scCompareLegend').innerHTML = ['min','decent','max'].map(sc=>
    `<div class="leg"><div class="leg-sq" style="background:${SC_COLORS[sc]};border-radius:50%;width:10px;height:10px;"></div><span style="color:${SC_COLORS[sc]};font-weight:600">${SC_LABELS[sc]}</span></div>`
  ).join('');

  // Line chart — monthly net profit for each scenario
  if(scCompareChartInst){ scCompareChartInst.destroy(); scCompareChartInst=null; }
  const ctx = document.getElementById('scCompareChart').getContext('2d');
  const datasets = ['min','decent','max'].map(sc=>{
    const s = scenarios[sc];
    const mf = totalFixedFor(s)/12;
    const data = calcMonthDataFor(s).map(d=>Math.round(d.gp - mf));
    return {
      label: SC_LABELS[sc],
      data,
      borderColor: SC_COLORS[sc],
      backgroundColor: SC_COLORS[sc]+'22',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: SC_COLORS[sc],
      borderWidth: 2.5
    };
  });
  scCompareChartInst = new Chart(ctx,{
    type:'line',
    data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      interaction:{mode:'index',intersect:false},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>`${c.dataset.label}: ${c.parsed.y>=0?'+ ':'− '}RM ${Math.abs(c.parsed.y).toLocaleString()}`}}},
      scales:{x:{grid:{color:gc},ticks:{color:'#666',font:{size:10}}},y:{grid:{color:gc},ticks:{color:'#666',font:{size:10},callback:v=>(v>=0?'':'−')+'RM '+Math.abs(v).toLocaleString()}}}}
  });

  // Bar chart — revenue / fixed cost / net profit per scenario
  if(scBarChartInst){ scBarChartInst.destroy(); scBarChartInst=null; }
  const ctx2 = document.getElementById('scBarChart').getContext('2d');
  const scKeys = ['min','decent','max'];
  const revData = scKeys.map(sc=>Math.round(calcMonthDataFor(scenarios[sc]).reduce((a,d)=>a+d.rev,0)));
  const fixedData = scKeys.map(sc=>Math.round(totalFixedFor(scenarios[sc])));
  const netData = scKeys.map(sc=>Math.round(netProfitFor(scenarios[sc])));
  scBarChartInst = new Chart(ctx2,{
    type:'bar',
    data:{
      labels:['Minimum','Decent','Maximum'],
      datasets:[
        {label:'Total Revenue',   data:revData,   backgroundColor:'rgba(212,175,55,0.7)', borderRadius:5},
        {label:'Fixed Cost',      data:fixedData, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:5},
        {label:'Net Profit',      data:netData,   backgroundColor:netData.map(v=>v>=0?'rgba(212,175,55,0.9)':'rgba(190,30,45,0.7)'), borderRadius:5},
      ]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{color:'#aaa',font:{size:11}}},tooltip:{callbacks:{label:(c)=>`${c.dataset.label}: RM ${Math.round(c.parsed.y).toLocaleString()}`}}},
      scales:{x:{grid:{color:gc},ticks:{color:'#666',font:{size:11}}},y:{grid:{color:gc},ticks:{color:'#666',font:{size:11},callback:v=>'RM '+v.toLocaleString()}}}}
  });

  // Prediction
  buildScenarioPrediction();

  // Detail table
  const rows = [
    ['Price per episode',  ...scKeys.map(sc=>'RM '+scenarios[sc].price.toFixed(2)+'/ep')],
    ['Paid episodes',      ...scKeys.map(sc=>scenarios[sc].paidEps+' eps')],
    ['Number of dramas',   ...scKeys.map(sc=>scenarios[sc].dramas+'')],
    ['Production cost',    ...scKeys.map(sc=>fmt(scenarios[sc].production))],
    ['Management cost',    ...scKeys.map(sc=>fmt(scenarios[sc].management))],
    ['Marketing cost',     ...scKeys.map(sc=>fmt(scenarios[sc].marketing))],
    ['Total fixed cost',   ...scKeys.map(sc=>fmt(totalFixedFor(scenarios[sc])))],
    ['Total revenue',      ...scKeys.map(sc=>fmt(calcMonthDataFor(scenarios[sc]).reduce((a,d)=>a+d.rev,0)))],
    ['Gross profit (60%)', ...scKeys.map(sc=>fmt(totalGPFor(scenarios[sc])))],
    ['Net profit',         ...scKeys.map(sc=>{const n=netProfitFor(scenarios[sc]);return `<span class="${n>=0?'pos-val':'neg-val'}">${fmtNet(n)}</span>`})],
    ['ROI on fixed cost',  ...scKeys.map(sc=>{const n=netProfitFor(scenarios[sc]);const f=totalFixedFor(scenarios[sc]);const r=f>0?(n/f*100):0;return `<span class="${r>=0?'pos-val':'neg-val'}">${r.toFixed(0)}%</span>`})],
    ['Producer payout (80%)',...scKeys.map(sc=>{const n=Math.max(0,netProfitFor(scenarios[sc]));return n>0?`<span class="pos-val">${fmt(n*0.80)}</span>`:'—'})],
    ['Director payout (20%)',...scKeys.map(sc=>{const n=Math.max(0,netProfitFor(scenarios[sc]));return n>0?`<span class="pos-val">${fmt(n*0.20)}</span>`:'—'})],
  ].map(row=>`<tr>${row.map((c,i)=>i===0?`<td style="font-weight:500;color:var(--muted2)">${c}</td>`:`<td>${c}</td>`).join('')}</tr>`).join('');
  document.getElementById('scDetailTable').innerHTML = rows;
}

function buildScenarioPrediction(){
  const nets = {
    min:    netProfitFor(scenarios.min),
    decent: netProfitFor(scenarios.decent),
    max:    netProfitFor(scenarios.max),
  };
  const revs = {
    min:    calcMonthDataFor(scenarios.min).reduce((a,d)=>a+d.rev,0),
    decent: calcMonthDataFor(scenarios.decent).reduce((a,d)=>a+d.rev,0),
    max:    calcMonthDataFor(scenarios.max).reduce((a,d)=>a+d.rev,0),
  };
  const fixed = {
    min:    totalFixedFor(scenarios.min),
    decent: totalFixedFor(scenarios.decent),
    max:    totalFixedFor(scenarios.max),
  };
  const rois = {
    min:    fixed.min>0?nets.min/fixed.min:0,
    decent: fixed.decent>0?nets.decent/fixed.decent:0,
    max:    fixed.max>0?nets.max/fixed.max:0,
  };

  // Scoring: net profit 50%, ROI 30%, risk (lower fixed cost) 20%
  const maxNet = Math.max(...Object.values(nets));
  const maxRev = Math.max(...Object.values(revs));
  const maxFixed = Math.max(...Object.values(fixed));
  const scores = {};
  ['min','decent','max'].forEach(sc=>{
    const netScore  = maxNet>0 ? Math.max(0, nets[sc]/maxNet)*50 : 0;
    const roiScore  = rois[sc]*30;
    const riskScore = (1 - fixed[sc]/maxFixed)*20;
    scores[sc] = netScore + roiScore + riskScore;
  });

  const best = Object.keys(scores).reduce((a,b)=>scores[a]>scores[b]?a:b);
  const LABELS = {min:'Minimum',decent:'Decent',max:'Maximum'};
  const COLORS = {min:'#cd853f',decent:'#D4AF37',max:'#e05060'};
  const EMOJIS = {min:'&#127807;',decent:'&#9878;&#65039;',max:'&#128640;'};

  const allProfitable = Object.values(nets).every(n=>n>=0);
  const noneProfitable = Object.values(nets).every(n=>n<0);
  const profitableList = Object.entries(nets).filter(([,n])=>n>=0).map(([k])=>LABELS[k]);

  let reasoning = '';
  if(noneProfitable){
    reasoning = `All three scenarios currently project a loss. Consider increasing price per episode, adding more dramas, or reducing fixed costs before approaching funders.`;
  } else if(allProfitable){
    reasoning = `All three scenarios are profitable. The <strong style="color:${COLORS[best]}">${LABELS[best]}</strong> scenario leads with the best blend of net profit and return on investment, making it the strongest pitch for funder confidence.`;
  } else {
    reasoning = `Only ${profitableList.join(' and ')} scenario(s) are currently profitable. The <strong style="color:${COLORS[best]}">${LABELS[best]}</strong> scenario offers the highest risk-adjusted return.`;
  }

  const tenfold = fixed[best]>0 ? fmt(fixed[best]*10) : '—';

  document.getElementById('scPredictionBody').innerHTML=`
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
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">ROI on investment</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--gold)">${(rois[best]*100).toFixed(0)}%</div>
          </div>
          <div style="background:var(--surface2);border-radius:var(--radius);padding:8px 14px;">
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">Tenfold target</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--muted2)">${tenfold}</div>
          </div>
          <div style="background:var(--surface2);border-radius:var(--radius);padding:8px 14px;">
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;">Producer payout (80%)</div>
            <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--gold)">${nets[best]>0?fmt(nets[best]*0.80):'—'}</div>
          </div>
        </div>
      </div>
    </div>`;
}

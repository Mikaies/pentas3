/* ═══════════════════════════════════════════
   MAIN CHART
═══════════════════════════════════════════ */
function renderMainChart(){
  if(chartInst){ chartInst.destroy(); chartInst=null; }
  const ctx=document.getElementById('mainChart').getContext('2d');
  const data=calcMonthData();
  const labels=['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];
  const gc=isLight?'rgba(0,0,0,0.06)':'rgba(255,255,255,0.06)';
  const tc=isLight?'#888':'#666';
  let datasets,legendHTML,type='bar';

  if(currentChart==='revenue'){
    datasets=[
      {label:'Gross profit (60%)',data:data.map(d=>Math.round(d.gp)),backgroundColor:'#BE1E2D',borderRadius:4},
      {label:'Direct cost (40%)', data:data.map(d=>Math.round(d.dc)),backgroundColor:'#D4AF37',borderRadius:4},
    ];
    legendHTML=`<div class="leg"><div class="leg-sq" style="background:#BE1E2D"></div>Gross profit (60%)</div><div class="leg"><div class="leg-sq" style="background:#D4AF37"></div>Direct cost (40%)</div>`;
  } else if(currentChart==='users'){
    datasets=[
      {label:'Total users', data:data.map(d=>d.users), backgroundColor:'#BE1E2D',borderRadius:4},
      {label:'Paying users',data:data.map(d=>d.paying),backgroundColor:'#D4AF37',borderRadius:4},
    ];
    legendHTML=`<div class="leg"><div class="leg-sq" style="background:#BE1E2D"></div>Total users</div><div class="leg"><div class="leg-sq" style="background:#D4AF37"></div>Paying users</div>`;
  } else {
    type='line';
    const mf=monthlyFixed();
    const nd=data.map(d=>Math.round(d.gp-mf));
    datasets=[{label:'Net profit',data:nd,borderColor:'#BE1E2D',backgroundColor:'rgba(190,30,45,0.12)',fill:true,tension:0.35,pointRadius:4,pointBackgroundColor:nd.map(v=>v>=0?'#D4AF37':'#BE1E2D'),borderWidth:2}];
    legendHTML=`<div class="leg"><div class="leg-sq" style="background:#BE1E2D;border-radius:50%"></div>Net profit per month</div>`;
  }
  document.getElementById('chartLegend').innerHTML=legendHTML;
  chartInst=new Chart(ctx,{
    type,data:{labels,datasets},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>currentChart==='users'?c.dataset.label+': '+Math.round(c.parsed.y).toLocaleString():(c.parsed.y>=0?'+ ':'− ')+'RM '+Math.round(Math.abs(c.parsed.y)).toLocaleString()}}},
      scales:{x:{grid:{color:gc},ticks:{color:tc,font:{size:10}}},y:{grid:{color:gc},ticks:{color:tc,font:{size:10},callback:(v)=>currentChart==='users'?v.toLocaleString():'RM '+Math.abs(v).toLocaleString()}}}}
  });
}

/* ═══════════════════════════════════════════
   OVERVIEW TABLE
═══════════════════════════════════════════ */
function renderTable(){
  const data=calcMonthData();
  const mf=monthlyFixed();
  const rows=data.map((d,i)=>{
    const net=d.gp-mf;
    return `<tr onclick="showDetail(${i})"><td style="font-weight:500;white-space:nowrap">Month ${i+1}</td><td><span class="badge ${phaseStyle(PHASES[i])}">${PHASES[i]}</span></td><td>${d.users.toLocaleString()}</td><td>${d.paying.toLocaleString()}</td><td>${fmt(d.rev)}</td><td style="color:var(--muted2)">${fmt(d.dc)}</td><td style="color:var(--gold)">${fmt(d.gp)}</td><td class="${net>=0?'pos-val':'neg-val'}">${fmtNet(net)}</td></tr>`;
  });
  const tU=data.reduce((a,d)=>a+d.users,0),tP=data.reduce((a,d)=>a+d.paying,0),tR=data.reduce((a,d)=>a+d.rev,0),tD=data.reduce((a,d)=>a+d.dc,0),tG=data.reduce((a,d)=>a+d.gp,0),tn=netProfit();
  rows.push(`<tr style="background:var(--surface2)"><td style="font-weight:700">TOTAL</td><td>—</td><td>${tU.toLocaleString()}</td><td>${tP.toLocaleString()}</td><td>${fmt(tR)}</td><td style="color:var(--muted2)">${fmt(tD)}</td><td style="color:var(--gold)">${fmt(tG)}</td><td class="${tn>=0?'pos-val':'neg-val'}">${fmtNet(tn)}</td></tr>`);
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

/* holiday cards */
function buildHolidayCards(){
  document.getElementById('holidayCards').innerHTML=HOLIDAY_INFO.map(h=>
    `<div style="padding:.9rem;background:var(--surface2);border-radius:var(--radius);border-left:3px solid ${h.color}"><div style="font-size:10px;color:var(--muted);margin-bottom:3px">${h.month}</div><div style="font-size:12px;font-weight:500;color:var(--white);margin-bottom:3px">${h.name}</div><div style="font-size:11px;color:var(--muted2)">${h.desc}</div></div>`
  ).join('');
}

/* ═══════════════════════════════════════════
   COST BREAKDOWN PAGE
═══════════════════════════════════════════ */
function buildCostCards(){
  const gp=totalGP();
  const net=netProfit();
  document.getElementById('costCards').innerHTML=`
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:8px;">Production</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.production)}</div>
      <div style="font-size:11px;color:var(--muted2);">${((cfg.production/totalFixed())*100).toFixed(1)}% of total fixed cost</div>
    </div>
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--crimson);margin-bottom:8px;">Management</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.management)}</div>
      <div style="font-size:11px;color:var(--muted2);">${((cfg.management/totalFixed())*100).toFixed(1)}% of total fixed cost</div>
    </div>
    <div class="sc-card-full" style="border:1px solid var(--border);">
      <div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a0522d;margin-bottom:8px;">Marketing</div>
      <div style="font-family:var(--font-head);font-size:24px;font-weight:700;color:var(--white);margin-bottom:4px;">${fmt(cfg.marketing)}</div>
      <div style="font-size:11px;color:var(--muted2);">${((cfg.marketing/totalFixed())*100).toFixed(1)}% of total fixed cost</div>
    </div>`;
}

function buildCostChart(){
  if(costChartInst){ costChartInst.destroy(); costChartInst=null; }
  const ctx=document.getElementById('costChart').getContext('2d');
  const gp=totalGP();
  const net=netProfit();
  costChartInst=new Chart(ctx,{
    type:'bar',
    data:{
      labels:['Gross Profit','Production','Management','Marketing','Net Profit'],
      datasets:[{
        data:[Math.round(gp), cfg.production, cfg.management, cfg.marketing, Math.round(Math.abs(net))],
        backgroundColor:['rgba(212,175,55,0.8)','rgba(190,30,45,0.7)','rgba(143,21,32,0.7)','rgba(160,82,45,0.7)',net>=0?'rgba(212,175,55,0.9)':'rgba(190,30,45,0.5)'],
        borderRadius:6,
      }]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>'RM '+Math.round(c.parsed.y).toLocaleString()}}},
      scales:{x:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#666',font:{size:11}}},y:{grid:{color:'rgba(255,255,255,0.05)'},ticks:{color:'#666',font:{size:11},callback:v=>'RM '+v.toLocaleString()}}}}
  });
}

/* ═══════════════════════════════════════════
   PAYOUT
═══════════════════════════════════════════ */
function renderPayoutAmounts(){
  const net=netProfit();
  const directorSplit = 1 - producerSplit;
  if(net>=0){
    document.getElementById('po-producer').textContent=fmt(net*producerSplit);
    document.getElementById('po-director').textContent=fmt(net*directorSplit);
  } else {
    ['po-producer','po-director'].forEach(id=>document.getElementById(id).textContent='—');
  }
}

function updatePayoutSplit(val){
  producerSplit = parseInt(val) / 100;
  const directorSplit = Math.round((1 - producerSplit) * 100);
  document.getElementById('producer-pct-label').textContent = val + '%';
  document.getElementById('po-producer-pct').textContent = val + '%';
  document.getElementById('po-director-pct').textContent = directorSplit + '%';
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
}

function buildPayoutChart(){
  if(payoutChartInst){ payoutChartInst.destroy(); payoutChartInst=null; }
  const ctx=document.getElementById('payoutChart').getContext('2d');
  const net=Math.max(0,netProfit());
  const directorSplit = Math.round((1-producerSplit)*100);
  const producerPct = Math.round(producerSplit*100);
  payoutChartInst = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:[`Producer (${producerPct}%)`,`Director (${directorSplit}%)`],
      datasets:[{data:[net*producerSplit,net*(1-producerSplit)],backgroundColor:['rgba(212,175,55,0.85)','rgba(245,245,245,0.5)'],borderWidth:0}]
    },
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'right',labels:{color:'#aaa',font:{size:11}}},tooltip:{callbacks:{label:(c)=>c.label+': RM '+Math.round(c.parsed).toLocaleString()}}}}
  });
}

function buildPayoutTable(){
  const net=netProfit();
  const gp=totalGP();
  const insight=document.getElementById('producerInsight');
  if(net>=0){
    const perDrama=net/cfg.dramas;
const producerPct = Math.round(producerSplit*100);
    const directorSplit = 1 - producerSplit;
    const directorPct = Math.round(directorSplit*100);
    insight.innerHTML=`<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      With <strong style="color:var(--gold)">${fmt(net)}</strong> net profit across <strong style="color:var(--gold)">${cfg.dramas} drama(s)</strong>:<br>
      Producer earns <strong style="color:var(--gold)">${fmt(net*producerSplit)}</strong> total (${fmt((net/cfg.dramas)*producerSplit)} per drama) ·
      Director earns <strong style="color:var(--white)">${fmt(net*directorSplit)}</strong> total.<br>
      <span style="color:var(--muted);font-size:11px;">Note: Pentas3 only deducts transaction costs (Android/Apple store fees) — not taken from net profit.</span>
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML=`
      <tr><td>Producer</td><td>${producerPct}%</td><td class="pos-val">${fmt(net*producerSplit)}</td><td>${fmt((net/cfg.dramas)*producerSplit)}</td></tr>
      <tr><td>Director</td><td>${directorPct}%</td><td>${fmt(net*directorSplit)}</td><td>${fmt((net/cfg.dramas)*directorSplit)}</td></tr>
      <tr><td colspan="4" style="font-size:11px;color:var(--muted);padding-top:10px;">&#8505; Pentas3 takes transaction costs only (app store/gateway fees) — deducted before gross profit, not from net profit split.</td></tr>`;
  } else {
    insight.innerHTML=`<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      Currently showing a loss of <strong style="color:var(--crimson)">${fmtNet(net)}</strong>. No payout is distributed until net profit turns positive.
      Try reducing your fixed costs or increasing price per episode / number of dramas.
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML=`<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:1rem;">No payout — net profit is negative</td></tr>`;
  }
}
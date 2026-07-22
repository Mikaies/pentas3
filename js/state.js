/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let userName = '';

// Scenarios now focus on viewer reach + pricing, not dramas
const DEFAULT_SCENARIOS = {
  min: {
    label: 'Minimum',
    totalViewers: 50000,
    conversionRate: 0.02,
    price: 0.30,
    paidEps: 17,
    platformFee: 0.20,
    production: 8000,
    management: 15000,
    marketing: 5000
  },
  decent: {
    label: 'Decent',
    totalViewers: 150000,
    conversionRate: 0.03,
    price: 0.40,
    paidEps: 17,
    platformFee: 0.20,
    production: 15000,
    management: 30000,
    marketing: 10000
  },
  max: {
    label: 'Maximum',
    totalViewers: 500000,
    conversionRate: 0.05,
    price: 0.50,
    paidEps: 17,
    platformFee: 0.20,
    production: 30000,
    management: 50000,
    marketing: 25000
  }
};

let scenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));

function resetScenariosToDefault(){
  scenarios = JSON.parse(JSON.stringify(DEFAULT_SCENARIOS));
  cfg = { ...scenarios.decent };
}

let cfg = { ...scenarios.decent };

let currentChart = 'revenue';
let chartInst = null;
let costChartInst = null;
let payoutChartInst = null;
let scCompareChartInst = null;
let scBarChartInst = null;
let isLight = false;
let producerSplit = 0.80;
let activeScenarioTab = 'min';

// 6-month viewer curve: peak months 1-3, dropping 4-6, flat low 7-12
// These are MULTIPLIERS applied to totalViewers
const VIEWER_CURVE = [1.0, 0.80, 0.60, 0.20, 0.10, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02];

const PHASES = [
  'Launch Peak','Growth','Early Momentum',
  'Post-Peak Drop','Settling Down','Low Baseline',
  'Steady State','Steady State','Steady State',
  'Steady State','Steady State','Steady State'
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(n){ return 'RM '+Math.round(Math.abs(n)).toLocaleString(); }
function fmtNet(n){ return (n>=0?'+ ':'− ')+'RM '+Math.round(Math.abs(n)).toLocaleString(); }

function totalFixedFor(sc){ return (sc.production||0)+(sc.management||0)+(sc.marketing||0); }
function totalFixed(){ return totalFixedFor(cfg); }

function calcMonthDataFor(sc){
  return VIEWER_CURVE.map(multiplier => {
    const viewers  = Math.round(sc.totalViewers * multiplier);
    const paying   = Math.round(viewers * (sc.conversionRate || 0.03));
    const revenue  = paying * (sc.price || 0.40) * (sc.paidEps || 17);
    const platFee  = revenue * (sc.platformFee || 0.20);
    const netRev   = revenue - platFee;
    return { viewers, paying, revenue, platFee, netRev };
  });
}
function calcMonthData(){ return calcMonthDataFor(cfg); }

function totalNetRevFor(sc){ return calcMonthDataFor(sc).reduce((a,d)=>a+d.netRev,0); }
function totalNetRev(){ return totalNetRevFor(cfg); }

function netProfitFor(sc){ return totalNetRevFor(sc) - totalFixedFor(sc); }
function netProfit(){ return netProfitFor(cfg); }
function monthlyFixed(){ return totalFixed() / 12; }

function phaseStyle(p){
  if(['Launch Peak','Growth','Early Momentum'].includes(p)) return 'badge-gold';
  if(['Post-Peak Drop','Settling Down'].includes(p)) return 'badge-red';
  return 'badge-dim';
}
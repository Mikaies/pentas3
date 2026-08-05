/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let userName = '';

const DEFAULT_SCENARIOS = {
  min: {
    label: 'Minimum',
    peakUsers: 50000,
    price: 0.30,
    paidEps: 17,
    production: 8000,
    management: 15000,
    marketing: 5000
  },
  decent: {
    label: 'Decent',
    peakUsers: 50000,
    price: 0.40,
    paidEps: 17,
    production: 15000,
    management: 30000,
    marketing: 10000
  },
  max: {
    label: 'Maximum',
    peakUsers: 50000,
    price: 0.50,
    paidEps: 17,
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

let currentChart = 'users';
let chartInst = null;
let costChartInst = null;
let payoutChartInst = null;
let scCompareChartInst = null;
let scBarChartInst = null;
let isLight = false;
let producerSplit = 0.80;
let directorSplit = 0.20;
let activeScenarioTab = 'min';
let activeOverviewScenario = 'decent';

// Bell curve: starts lower, peaks at M2-3, drops M4-6, flat very low M7-12
const USER_CURVE = [0.40, 0.90, 1.00, 0.60, 0.30, 0.15, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];

const PHASES = [
  'Launch', 'Peak', 'Peak',
  'Declining', 'Declining', 'Low',
  'Steady', 'Steady', 'Steady',
  'Steady', 'Steady', 'Steady'
];

const MONTH_LABELS = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'];

/* ═══════════════════════════════════════════
   CORE CALCULATION
═══════════════════════════════════════════ */
function calcMonthDataFor(sc){
  const mf = totalFixedFor(sc) / 12;
  return USER_CURVE.map(mult => {
    const paying  = Math.round((sc.peakUsers || 0) * mult);
    const revenue = paying * (sc.price || 0.40) * (sc.paidEps || 17);
    const profit  = revenue - mf;
    return { paying, revenue, profit, monthlyFixed: mf };
  });
}
function calcMonthData(){ return calcMonthDataFor(cfg); }

function totalRevenueFor(sc){
  return calcMonthDataFor(sc).reduce((a,d) => a + d.revenue, 0);
}
function totalRevenue(){ return totalRevenueFor(cfg); }

function totalPayingUsersFor(sc){
  return calcMonthDataFor(sc).reduce((a,d) => a + d.paying, 0);
}

function netProfitFor(sc){ return totalRevenueFor(sc) - totalFixedFor(sc); }
function netProfit(){ return netProfitFor(cfg); }

function totalFixedFor(sc){ return (sc.production||0) + (sc.management||0) + (sc.marketing||0); }
function totalFixed(){ return totalFixedFor(cfg); }
function monthlyFixed(){ return totalFixed() / 12; }

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(n){ return 'RM ' + Math.round(Math.abs(n)).toLocaleString(); }
function fmtNet(n){ return (n >= 0 ? '+ ' : '− ') + 'RM ' + Math.round(Math.abs(n)).toLocaleString(); }

function phaseStyle(p){
  if(['Peak','Launch'].includes(p)) return 'badge-gold';
  if(['Declining','Low'].includes(p)) return 'badge-red';
  return 'badge-dim';
}
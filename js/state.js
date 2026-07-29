/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let userName = '';

const DEFAULT_SCENARIOS = {
  min: {
    label: 'Minimum',
    peakUsers: 1000,
    price: 0.30,
    paidEps: 17,
    production: 8000,
    management: 15000,
    marketing: 5000
  },
  decent: {
    label: 'Decent',
    peakUsers: 5000,
    price: 0.40,
    paidEps: 17,
    production: 15000,
    management: 30000,
    marketing: 10000
  },
  max: {
    label: 'Maximum',
    peakUsers: 15000,
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
let activeScenarioTab = 'min';
let activeOverviewScenario = 'decent';

// 12-month paying user curve
// Month 1-3: peak, Month 4-6: declining, Month 7-12: flat very low
const USER_CURVE = [1.0, 0.85, 0.65, 0.30, 0.15, 0.08, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03];

const PHASES = [
  'Launch Peak', 'Growth', 'Early Momentum',
  'Post-Peak Drop', 'Settling Down', 'Low Baseline',
  'Steady State', 'Steady State', 'Steady State',
  'Steady State', 'Steady State', 'Steady State'
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
  if(['Launch Peak','Growth','Early Momentum'].includes(p)) return 'badge-gold';
  if(['Post-Peak Drop','Settling Down'].includes(p)) return 'badge-red';
  return 'badge-dim';
}
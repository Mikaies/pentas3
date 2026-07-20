/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let userName = '';

const TOTAL_EPISODES = 17;
const FREE_EPISODES = 3;
const PAID_EPISODES = TOTAL_EPISODES - FREE_EPISODES; // 14

const DEFAULT_SCENARIOS = {
  min:    { price:0.30, viewers:20000,  conversionRate:0.02, platformFee:0.20, dramas:1, production:8000,  management:15000, marketing:5000  },
  decent: { price:0.40, viewers:60000,  conversionRate:0.03, platformFee:0.20, dramas:1, production:15000, management:30000, marketing:10000 },
  max:    { price:0.50, viewers:150000, conversionRate:0.05, platformFee:0.20, dramas:1, production:30000, management:50000, marketing:25000 }
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

// Monthly viewer curve as a % of the scenario's base "viewers" figure,
// modelling launch peak -> decline -> steady state over 12 months.
const VIEWER_CURVE = [1.00, 0.80, 0.60, 0.20, 0.10, 0.05, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02];
const PHASES = ['Launch Peak','Growth','Early Momentum','Post-Peak Drop','Settling Down','Low Baseline','Steady State','Steady State','Steady State','Steady State','Steady State','Steady State'];
const HOLIDAYS = ['','','','','','','','','','','',''];
const HOLIDAY_INFO = [];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(n){ return 'RM '+Math.round(Math.abs(n)).toLocaleString(); }
function fmtNet(n){ return (n>=0?'+ ':'− ')+'RM '+Math.round(Math.abs(n)).toLocaleString(); }

function totalFixedFor(sc){ return (sc.production||0)+(sc.management||0)+(sc.marketing||0); }
function totalFixed(){ return totalFixedFor(cfg); }

/**
 * Monthly breakdown using the new model:
 * viewers -> conversion rate -> paying users -> revenue -> platform fee -> net revenue
 */
function calcMonthDataFor(sc){
  return VIEWER_CURVE.map(mult=>{
    const viewers = Math.round((sc.viewers||0) * mult);
    const paying  = Math.round(viewers * (sc.conversionRate||0));
    const rev     = paying * sc.price * PAID_EPISODES;
    const fee     = rev * (sc.platformFee||0);
    const netRev  = rev - fee;
    return { viewers, users: viewers, paying, rev, fee, netRev, dc: fee, gp: netRev };
  });
}
function calcMonthData(){ return calcMonthDataFor(cfg); }

function totalGPFor(sc){ return calcMonthDataFor(sc).reduce((a,d)=>a+d.netRev,0); }
function totalGP(){ return totalGPFor(cfg); }

function netProfitFor(sc){ return totalGPFor(sc) - totalFixedFor(sc); }
function netProfit(){ return netProfitFor(cfg); }
function monthlyFixed(){ return totalFixed() / 12; }

function phaseStyle(p){
  if(['Launch Peak','Growth','Early Momentum'].includes(p)) return 'badge-gold';
  if(['Post-Peak Drop','Settling Down'].includes(p)) return 'badge-red';
  return 'badge-dim';
}
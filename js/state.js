/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let userName = '';

const DEFAULT_SCENARIOS = {
  min:    { price:0.30, paidEps:10, dramas:3,  production:8000,  management:15000, marketing:5000  },
  decent: { price:0.40, paidEps:14, dramas:5,  production:15000, management:30000, marketing:10000 },
  max:    { price:0.50, paidEps:17, dramas:8,  production:30000, management:50000, marketing:25000 }
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

// Per-scenario drama counters
let dramaCounts = { min:3, decent:5, max:8 };
let activeScenarioTab = 'min';

const BASE_USERS = [100000,80000,60000,20000,10000,5000,2000,2000,2000,2000,2000,2000];
const PAYING_RATE = 0.10;
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

function calcMonthDataFor(sc){
  return BASE_USERS.map(u=>{
    const paying = Math.round(u * PAYING_RATE) * sc.dramas;
    const rev    = paying * sc.price * sc.paidEps;
    const dc     = rev * 0.40;
    const gp     = rev * 0.60;
    return { users: u * sc.dramas, paying, rev, dc, gp };
  });
}
function calcMonthData(){ return calcMonthDataFor(cfg); }

function totalGPFor(sc){ return calcMonthDataFor(sc).reduce((a,d)=>a+d.gp,0); }
function totalGP(){ return totalGPFor(cfg); }

function netProfitFor(sc){ return totalGPFor(sc) - totalFixedFor(sc); }
function netProfit(){ return netProfitFor(cfg); }
function monthlyFixed(){ return totalFixed() / 12; }

function phaseStyle(p){
  if(['Launch Peak','Heavy Momentum','Holiday Peak','Year-End Peak','Deepavali Surge','Merdeka Upswing'].includes(p)) return 'badge-gold';
  if(['Post-Peak Drop','Pre-Festive Drop','Quiet Baseline'].includes(p)) return 'badge-red';
  return 'badge-dim';
}
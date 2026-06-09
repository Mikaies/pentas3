/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
const CREDS = { username:'admin', password:'pentas3' };

// Three scenarios stored here
let scenarios = {
  min:    { price:0.30, paidEps:10, dramas:3,  production:8000,  management:15000, marketing:5000  },
  decent: { price:0.40, paidEps:14, dramas:5,  production:15000, management:30000, marketing:10000 },
  max:    { price:0.50, paidEps:17, dramas:8,  production:30000, management:50000, marketing:25000 }
};
// Active scenario driving the dashboard
let cfg = { ...scenarios.decent };

let currentChart = 'revenue';
let chartInst = null;
let costChartInst = null;
let scCompareChartInst = null;
let scBarChartInst = null;
let isLight = false;
let loggedInUser = '';

// Per-scenario drama counters
let dramaCounts = { min:3, decent:5, max:8 };
let activeScenarioTab = 'min';

const BASE_USERS = [50000,100000,75000,20000,10000,5000,1500,8000,6500,1500,12000,25000];
const PAYING_RATE = 0.10;
const PHASES = ['Launch Peak','Heavy Momentum','Holiday Peak','Post-Peak Drop','Normal Month','Mid-Year Surge','Quiet Baseline','Merdeka Upswing','Malaysia Day Break','Pre-Festive Drop','Deepavali Surge','Year-End Peak'];
const HOLIDAYS = ['','','','','','','Post-Raya Haji','Merdeka Day','Malaysia Day','Calm period','Deepavali','Christmas / Year-End'];
const HOLIDAY_INFO = [
  {month:'Month 7 · July',  name:'Post-Raya Haji quiet',   desc:'Hari Raya Haji aftermath. Minor Sarawak Day lift.',          color:'var(--border2)'},
  {month:'Month 8 · August',name:'Merdeka upswing',         desc:'Maulidur Rasul + Merdeka Day long weekend surge.',           color:'var(--crimson)'},
  {month:'Month 9 · Sept',  name:'Malaysia Day break',      desc:'Malaysia Day + mid-term school holidays.',                   color:'var(--crimson)'},
  {month:'Month 10 · Oct',  name:'Pre-festive calm',        desc:'Quiet baseline before the year-end push.',                   color:'var(--border2)'},
  {month:'Month 11 · Nov',  name:'Deepavali surge',         desc:'Deepavali + start of year-end school holidays.',             color:'var(--gold)'},
  {month:'Month 12 · Dec',  name:'Year-end grand peak',     desc:'Christmas · school holidays · monsoon season indoors.',      color:'var(--gold)'},
];

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
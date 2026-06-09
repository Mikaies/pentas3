<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Pentas3 — Financial Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Playfair+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<style>
:root{
  --crimson:#BE1E2D; --crimson-d:#8f1520;
  --gold:#D4AF37;
  --midnight:#0F0F0F; --white:#F5F5F5;
  --surface:#1a1a1a; --surface2:#222; --surface3:#2c2c2c;
  --border:rgba(255,255,255,0.08); --border2:rgba(255,255,255,0.14);
  --muted:rgba(245,245,245,0.40); --muted2:rgba(245,245,245,0.65);
  --font-head:'Montserrat',sans-serif; --font-serif:'Playfair Display',serif; --font-body:'Inter',sans-serif;
  --radius:10px; --radius-lg:16px;
}
.light{
  --midnight:#f0eeeb; --surface:#fff; --surface2:#f5f3f0; --surface3:#eae8e4;
  --border:rgba(0,0,0,0.08); --border2:rgba(0,0,0,0.14);
  --white:#1a1a1a; --muted:rgba(20,20,20,0.42); --muted2:rgba(20,20,20,0.65);
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{background:var(--midnight);color:var(--white);font-family:var(--font-body);font-size:14px;line-height:1.6;min-height:100vh;transition:background .3s,color .3s;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:var(--crimson);border-radius:2px;}

/* SCREENS */
.screen{display:none;min-height:100vh;}
.screen.active{display:flex;}

/* ── LOGIN ── */
#screen-login{align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,rgba(190,30,45,.18) 0%,transparent 65%),var(--midnight);}
.login-box{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:2.5rem 2rem;margin:1rem;}
.login-logo{text-align:center;margin-bottom:2rem;}
.login-logo-icon{width:52px;height:52px;border-radius:14px;background:var(--crimson);display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:18px;color:#fff;margin-bottom:10px;}
.login-title{font-family:var(--font-head);font-weight:700;font-size:20px;letter-spacing:.08em;text-transform:uppercase;color:var(--white);}
.login-sub{font-family:var(--font-serif);font-style:italic;font-size:13px;color:var(--crimson);margin-top:2px;}
.form-group{margin-bottom:1rem;}
.form-label{display:block;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.form-input{width:100%;padding:10px 14px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--radius);color:var(--white);font-family:var(--font-body);font-size:13px;outline:none;transition:border-color .2s;}
.form-input:focus{border-color:var(--crimson);}
.form-input::placeholder{color:var(--muted);}
.form-error{font-size:11px;color:var(--crimson);margin-top:6px;display:none;}
.form-error.show{display:block;}
.btn-primary{width:100%;padding:12px;background:var(--crimson);border:none;border-radius:var(--radius);color:#fff;font-family:var(--font-head);font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;transition:background .2s;margin-top:.5rem;}
.btn-primary:hover{background:var(--crimson-d);}
.login-hint{text-align:center;font-size:11px;color:var(--muted);margin-top:1rem;}
.login-hint span{color:var(--gold);}

/* ── CALCULATOR ── */
#screen-calc{flex-direction:column;align-items:center;justify-content:flex-start;padding:2rem 1rem;overflow-y:auto;}
.calc-box{width:100%;max-width:580px;background:var(--surface);border:1px solid var(--border2);border-radius:20px;padding:2rem;margin-bottom:2rem;}
.calc-header{text-align:center;margin-bottom:1.75rem;}
.calc-step{font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--crimson);margin-bottom:4px;}
.calc-title{font-family:var(--font-head);font-size:18px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--white);}
.calc-sub{font-family:var(--font-serif);font-style:italic;font-size:12px;color:var(--muted2);margin-top:3px;}
.calc-section-title{font-family:var(--font-head);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--crimson);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid rgba(190,30,45,.2);}
.input-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.input-hint{font-size:10px;color:var(--muted);margin-top:4px;}
.input-hint.error-hint{color:var(--crimson);}
.input-addon{position:relative;}
.input-addon .form-input{padding-left:38px;}
.input-addon .addon-text{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:12px;font-weight:600;color:var(--gold);pointer-events:none;}
.free-tag{display:inline-block;background:rgba(212,175,55,.15);color:var(--gold);font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:20px;margin-left:6px;vertical-align:middle;}
.calc-divider{height:1px;background:var(--border);margin:1.25rem 0;}

/* hide native spinner arrows on ALL number inputs */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
input[type=number]{-moz-appearance:textfield;}

/* spin controls — crimson/gold brand colours */
.spin-group{display:flex;align-items:center;gap:0;border:1px solid var(--border2);border-radius:var(--radius);overflow:hidden;}
.spin-btn{
  width:38px;height:40px;flex-shrink:0;
  background:rgba(190,30,45,.15);
  border:none;
  color:var(--crimson);
  font-size:18px;font-weight:700;
  cursor:pointer;transition:background .15s;
  display:flex;align-items:center;justify-content:center;
}
.spin-btn:hover{background:var(--crimson);color:#fff;}
.spin-input{
  flex:1;min-width:0;
  padding:10px 8px;text-align:center;
  background:var(--surface2);
  border:none;border-left:1px solid var(--border2);border-right:1px solid var(--border2);
  color:var(--white);font-family:var(--font-head);font-size:14px;font-weight:600;
  outline:none;
}
.spin-input:focus{background:var(--surface3);}

/* episode visual dots */
.episodes-visual{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
.ep-dot{width:22px;height:22px;border-radius:5px;background:var(--surface3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--muted);transition:all .15s;}
.ep-dot.free{background:rgba(212,175,55,.15);border-color:rgba(212,175,55,.4);color:var(--gold);}
.ep-dot.paid{background:rgba(190,30,45,.2);border-color:rgba(190,30,45,.5);color:#e05060;}

/* drama counter */
.drama-counter{display:flex;align-items:center;gap:12px;}
.counter-btn{width:36px;height:36px;border-radius:50%;background:rgba(190,30,45,.15);border:1px solid var(--crimson);color:var(--crimson);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.counter-btn:hover{background:var(--crimson);color:#fff;}
.counter-val{font-family:var(--font-head);font-size:32px;font-weight:700;color:var(--white);flex:1;text-align:center;}
.counter-label{font-size:11px;color:var(--muted);text-align:center;margin-top:2px;}

/* cost input cards */
.cost-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;}
.cost-card{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:.75rem;}
.cost-card-label{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.cost-card-total{font-family:var(--font-head);font-size:12px;font-weight:600;color:var(--gold);margin-top:8px;text-align:right;}
.total-cost-bar{background:rgba(190,30,45,.08);border:1px solid rgba(190,30,45,.2);border-radius:var(--radius);padding:.75rem 1rem;display:flex;justify-content:space-between;align-items:center;margin-top:4px;}
.total-cost-label{font-size:11px;color:var(--muted2);font-weight:500;}
.total-cost-val{font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--crimson);}

/* ── SUMMARY ── */
#screen-summary{flex-direction:column;align-items:center;justify-content:center;padding:2rem 1rem;}
.summary-box{width:100%;max-width:580px;background:var(--surface);border:1px solid var(--crimson);border-radius:20px;padding:2rem;}
.summary-header{text-align:center;margin-bottom:1.5rem;}
.summary-check{width:52px;height:52px;border-radius:50%;background:rgba(190,30,45,.15);border:2px solid var(--crimson);display:inline-flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px;}
.summary-title{font-family:var(--font-head);font-size:17px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--white);}
.summary-sub{font-family:var(--font-serif);font-style:italic;font-size:12px;color:var(--crimson);margin-top:3px;}
.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:1.25rem;}
.summary-item{background:var(--surface2);border-radius:var(--radius);padding:.85rem 1rem;}
.summary-item-label{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:4px;}
.summary-item-val{font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--white);}
.summary-item-val.gold{color:var(--gold);}
.summary-item-val.red{color:var(--crimson);}
.summary-total{background:rgba(190,30,45,.1);border:1px solid rgba(190,30,45,.3);border-radius:var(--radius);padding:1rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;}
.summary-total-label{font-size:11px;font-weight:600;color:var(--muted2);text-transform:uppercase;letter-spacing:.06em;}
.summary-total-val{font-family:var(--font-head);font-size:20px;font-weight:700;}
.btn-row{display:flex;gap:10px;}
.btn-secondary{flex:1;padding:10px;background:transparent;border:1px solid var(--border2);border-radius:var(--radius);color:var(--muted2);font-family:var(--font-head);font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.btn-secondary:hover{border-color:var(--gold);color:var(--gold);}
.btn-primary-sm{flex:2;padding:10px;background:var(--crimson);border:none;border-radius:var(--radius);color:#fff;font-family:var(--font-head);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:background .2s;}
.btn-primary-sm:hover{background:var(--crimson-d);}

/* ── TOPBAR ── */
.topbar{display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:60px;border-bottom:1px solid var(--border);background:var(--midnight);position:sticky;top:0;z-index:100;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-icon{width:32px;height:32px;border-radius:8px;background:var(--crimson);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:700;font-size:13px;color:#fff;}
.logo-name{font-family:var(--font-head);font-weight:700;font-size:15px;color:var(--white);letter-spacing:.06em;text-transform:uppercase;}
.logo-sub{font-family:var(--font-serif);font-style:italic;font-size:11px;color:var(--crimson);margin-top:-2px;}
.topbar-right{display:flex;align-items:center;gap:10px;}
.topbar-user{font-size:11px;color:var(--muted);padding:5px 12px;border:1px solid var(--border);border-radius:20px;}
.topbar-user span{color:var(--gold);font-weight:500;}
.icon-btn{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--font-body);font-size:12px;cursor:pointer;transition:all .2s;}
.icon-btn:hover{border-color:var(--gold);color:var(--gold);}
.icon-btn svg{width:14px;height:14px;flex-shrink:0;}

/* ── DASHBOARD LAYOUT ── */
#screen-dashboard{flex-direction:column;}
.layout{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 60px);}
.sidebar{border-right:1px solid var(--border);padding:1.5rem 1rem;background:var(--midnight);position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto;}
.nav-label{font-family:var(--font-head);font-size:9px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding:0 .5rem;margin-bottom:6px;margin-top:1.25rem;}
.nav-label:first-child{margin-top:0;}
.nav-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--radius);font-size:13px;color:var(--muted2);cursor:pointer;transition:all .15s;margin-bottom:2px;}
.nav-item:hover{background:var(--surface2);color:var(--white);}
.nav-item.active{background:rgba(190,30,45,.15);color:var(--crimson);font-weight:500;}
.nav-item svg{width:15px;height:15px;flex-shrink:0;}
.nav-divider{height:1px;background:var(--border);margin:.75rem 0;}
.sc-pills{padding:0 .5rem;}
.sc-pill{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-radius:var(--radius);border:1px solid var(--border);margin-bottom:6px;cursor:pointer;transition:all .15s;}
.sc-pill:hover{border-color:var(--crimson);}
.sc-pill.active{border-color:var(--crimson);background:rgba(190,30,45,.12);}
.sc-pill-name{font-size:12px;font-weight:500;color:var(--white);}
.sc-pill-cost{font-size:10px;color:var(--muted);}
.sc-pill-dot{width:7px;height:7px;border-radius:50%;}
.main{padding:1.75rem 2rem;overflow:hidden;}
.page{display:none;}
.page.active{display:block;}
.page-header{margin-bottom:1.5rem;}
.page-title{font-family:var(--font-head);font-weight:700;font-size:20px;letter-spacing:.04em;color:var(--white);text-transform:uppercase;}
.page-sub{font-family:var(--font-serif);font-style:italic;font-size:13px;color:var(--crimson);margin-top:2px;}
.config-banner{background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.25);border-radius:var(--radius);padding:10px 14px;margin-bottom:1.25rem;display:flex;flex-wrap:wrap;gap:16px;align-items:center;}
.config-tag{font-size:11px;color:var(--muted2);}
.config-tag strong{color:var(--gold);font-weight:600;}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:1.5rem;}
.metric-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1rem 1.25rem;position:relative;overflow:hidden;}
.metric-card.gold-accent::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--gold);}
.metric-card.red-accent::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--crimson);}
.metric-label{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.metric-val{font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--white);line-height:1.1;}
.metric-val.pos{color:var(--gold);}
.metric-val.neg{color:var(--crimson);}
.metric-note{font-size:10px;color:var(--muted);margin-top:4px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:1.25rem;}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}
.card-title{font-family:var(--font-head);font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--white);}
.card-sub{font-size:11px;color:var(--muted);margin-top:2px;}
.chart-tabs{display:flex;gap:6px;}
.ctab{font-size:11px;font-weight:500;padding:5px 12px;border-radius:20px;border:1px solid var(--border2);background:transparent;color:var(--muted2);cursor:pointer;font-family:var(--font-body);transition:all .15s;}
.ctab:hover{border-color:var(--gold);color:var(--gold);}
.ctab.active{background:var(--crimson);border-color:var(--crimson);color:#fff;}
.legend{display:flex;gap:14px;flex-wrap:wrap;}
.leg{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted2);}
.leg-sq{width:9px;height:9px;border-radius:2px;flex-shrink:0;}
.table-wrap{overflow-x:auto;}
table{width:100%;border-collapse:collapse;font-size:12px;}
thead tr{border-bottom:1px solid var(--border2);}
th{padding:8px 12px;text-align:left;font-family:var(--font-head);font-size:9px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap;}
td{padding:9px 12px;border-bottom:1px solid var(--border);color:var(--white);vertical-align:middle;}
tbody tr{cursor:pointer;transition:background .1s;}
tbody tr:hover td{background:var(--surface2);}
tbody tr:last-child td{border-bottom:none;font-weight:600;}
.pos-val{color:var(--gold);}
.neg-val{color:var(--crimson);}
.badge{display:inline-block;font-size:10px;font-weight:500;padding:2px 8px;border-radius:20px;white-space:nowrap;}
.badge-gold{background:rgba(212,175,55,.15);color:var(--gold);}
.badge-red{background:rgba(190,30,45,.15);color:#e05060;}
.badge-dim{background:rgba(255,255,255,.06);color:var(--muted2);}
.detail-panel{border:1px solid var(--crimson);border-radius:var(--radius-lg);padding:1.25rem;margin-bottom:1.25rem;background:rgba(190,30,45,.07);display:none;}
.detail-panel.show{display:block;}
.detail-title{font-family:var(--font-head);font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--crimson);margin-bottom:10px;}
.detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;}
.detail-item{background:var(--surface2);border-radius:var(--radius);padding:10px 12px;}
.detail-item-label{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px;}
.detail-item-val{font-family:var(--font-head);font-size:15px;font-weight:600;color:var(--white);}
.sc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:1.5rem;}
.sc-card-full{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;transition:all .2s;position:relative;overflow:hidden;}
.sc-row-item{display:flex;justify-content:space-between;font-size:11px;color:var(--muted2);border-bottom:1px solid var(--border);padding:5px 0;}
.sc-row-total{display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:var(--white);padding-top:8px;margin-top:2px;}
.payout-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:1.25rem;}
.payout-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.25rem;text-align:center;}
.payout-role{font-family:var(--font-head);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.payout-pct{font-family:var(--font-head);font-size:36px;font-weight:700;line-height:1;margin-bottom:6px;}
.payout-pct.gold{color:var(--gold);}
.payout-pct.red{color:var(--crimson);}
.payout-desc{font-size:11px;color:var(--muted);}
.payout-amt{font-family:var(--font-head);font-size:13px;font-weight:600;color:var(--white);margin-top:8px;}
@media(max-width:900px){.layout{grid-template-columns:1fr;}.sidebar{display:none;}.sc-grid{grid-template-columns:1fr;}.payout-grid{grid-template-columns:1fr;}.input-row{grid-template-columns:1fr;}.summary-grid{grid-template-columns:1fr;}.cost-grid{grid-template-columns:1fr;}}
</style>
</head>
<body>

<!-- ══ SCREEN 1: LOGIN ══ -->
<div class="screen active" id="screen-login">
  <div class="login-box">
    <div class="login-logo">
      <div class="login-logo-icon">P3</div>
      <div class="login-title">Pentas3</div>
      <div class="login-sub">Theater in Your Pocket</div>
    </div>
    <div class="form-group">
      <label class="form-label" for="inp-user">Username</label>
      <input class="form-input" id="inp-user" type="text" placeholder="Enter username" autocomplete="username"/>
    </div>
    <div class="form-group">
      <label class="form-label" for="inp-pass">Password</label>
      <input class="form-input" id="inp-pass" type="password" placeholder="Enter password" autocomplete="current-password"/>
      <div class="form-error" id="login-error">Incorrect username or password. Please try again.</div>
    </div>
    <button class="btn-primary" id="btn-login">Sign In</button>
    <div class="login-hint">Credentials: <span>admin</span> / <span>pentas3</span></div>
  </div>
</div>

<!-- ══ SCREEN 2: SCENARIO WIZARD ══ -->
<style>
.scenario-tabs{display:flex;gap:0;border:1px solid var(--border2);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:1.75rem;}
.sc-tab{flex:1;padding:10px 8px;background:transparent;border:none;color:var(--muted2);font-family:var(--font-head);font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;cursor:pointer;transition:all .2s;text-align:center;border-right:1px solid var(--border2);}
.sc-tab:last-child{border-right:none;}
.sc-tab.active{background:var(--crimson);color:#fff;}
.sc-tab.done{background:rgba(212,175,55,.15);color:var(--gold);}
.sc-tab-dot{width:7px;height:7px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:middle;}
.scenario-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;}
.badge-min{background:rgba(160,82,45,.2);color:#cd853f;}
.badge-decent{background:rgba(212,175,55,.2);color:var(--gold);}
.badge-max{background:rgba(190,30,45,.2);color:#e05060;}
</style>
<div class="screen" id="screen-calc">
  <div class="calc-box" style="max-width:620px;">
    <div class="calc-header">
      <div class="calc-step">Step 1 of 2 — Configure 3 Scenarios</div>
      <div class="calc-title">Budget Scenarios</div>
      <div class="calc-sub">Define Minimum, Decent and Maximum budgets to compare investment outcomes</div>
    </div>
    <div class="scenario-tabs">
      <button class="sc-tab active" id="tab-min" onclick="switchScenarioTab('min')"><span class="sc-tab-dot" style="background:#cd853f"></span>Minimum</button>
      <button class="sc-tab" id="tab-decent" onclick="switchScenarioTab('decent')"><span class="sc-tab-dot" style="background:var(--gold)"></span>Decent</button>
      <button class="sc-tab" id="tab-max" onclick="switchScenarioTab('max')"><span class="sc-tab-dot" style="background:#e05060"></span>Maximum</button>
    </div>

    <!-- SCENARIO: MINIMUM -->
    <div id="sc-panel-min">
      <div style="text-align:center;margin-bottom:1.25rem;">
        <div class="scenario-badge badge-min">&#127807; Minimum Budget</div>
        <div style="font-size:12px;color:var(--muted2);">Conservative investment — lean team, tight spend, proof of concept</div>
      </div>
      <div class="calc-section-title">&#128176; Pricing</div>
      <div class="form-group">
        <label class="form-label">Price per episode (RM)</label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinPrice('min',-0.10)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-price-min" type="number" step="0.01" min="0.01" value="0.30"/>
          <button class="spin-btn" onclick="spinPrice('min',0.10)" type="button">+</button>
        </div>
        <div class="input-hint">RM 0.30 baseline — clears gateway fees, low friction</div>
      </div>
      <div class="form-group">
        <label class="form-label">Number of paid episodes <span class="free-tag">+ 3 free</span></label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinEps('min',-1)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-eps-min" type="number" min="1" max="17" value="10" oninput="updateEpisodeVisualFor('min')"/>
          <button class="spin-btn" onclick="spinEps('min',1)" type="button">+</button>
        </div>
        <div class="episodes-visual" id="ep-visual-min"></div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#127916; Dramas</div>
      <div class="form-group">
        <div class="drama-counter">
          <button class="counter-btn" onclick="spinDrama('min',-1)" type="button">&#8722;</button>
          <div><div class="counter-val" id="drama-count-min">3</div><div class="counter-label">drama(s)</div></div>
          <button class="counter-btn" onclick="spinDrama('min',1)" type="button">+</button>
        </div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#128202; Cost structure (RM)</div>
      <div class="cost-grid">
        <div class="cost-card"><div class="cost-card-label">Production</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-production-min" type="number" min="0" value="8000" oninput="updateTotalCostFor('min')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Management</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-management-min" type="number" min="0" value="15000" oninput="updateTotalCostFor('min')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Marketing</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-marketing-min" type="number" min="0" value="5000" oninput="updateTotalCostFor('min')" style="padding-left:38px;"/></div></div>
      </div>
      <div class="total-cost-bar"><div class="total-cost-label">Total fixed cost</div><div class="total-cost-val" id="total-cost-display-min">RM 28,000</div></div>
    </div>

    <!-- SCENARIO: DECENT -->
    <div id="sc-panel-decent" style="display:none;">
      <div style="text-align:center;margin-bottom:1.25rem;">
        <div class="scenario-badge badge-decent">&#9878;&#65039; Decent Budget</div>
        <div style="font-size:12px;color:var(--muted2);">Balanced investment — solid production, moderate marketing push</div>
      </div>
      <div class="calc-section-title">&#128176; Pricing</div>
      <div class="form-group">
        <label class="form-label">Price per episode (RM)</label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinPrice('decent',-0.10)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-price-decent" type="number" step="0.01" min="0.01" value="0.40"/>
          <button class="spin-btn" onclick="spinPrice('decent',0.10)" type="button">+</button>
        </div>
        <div class="input-hint">RM 0.40 moderate — psychological sweet spot</div>
      </div>
      <div class="form-group">
        <label class="form-label">Number of paid episodes <span class="free-tag">+ 3 free</span></label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinEps('decent',-1)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-eps-decent" type="number" min="1" max="17" value="14" oninput="updateEpisodeVisualFor('decent')"/>
          <button class="spin-btn" onclick="spinEps('decent',1)" type="button">+</button>
        </div>
        <div class="episodes-visual" id="ep-visual-decent"></div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#127916; Dramas</div>
      <div class="form-group">
        <div class="drama-counter">
          <button class="counter-btn" onclick="spinDrama('decent',-1)" type="button">&#8722;</button>
          <div><div class="counter-val" id="drama-count-decent">5</div><div class="counter-label">drama(s)</div></div>
          <button class="counter-btn" onclick="spinDrama('decent',1)" type="button">+</button>
        </div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#128202; Cost structure (RM)</div>
      <div class="cost-grid">
        <div class="cost-card"><div class="cost-card-label">Production</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-production-decent" type="number" min="0" value="15000" oninput="updateTotalCostFor('decent')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Management</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-management-decent" type="number" min="0" value="30000" oninput="updateTotalCostFor('decent')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Marketing</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-marketing-decent" type="number" min="0" value="10000" oninput="updateTotalCostFor('decent')" style="padding-left:38px;"/></div></div>
      </div>
      <div class="total-cost-bar"><div class="total-cost-label">Total fixed cost</div><div class="total-cost-val" id="total-cost-display-decent">RM 55,000</div></div>
    </div>

    <!-- SCENARIO: MAXIMUM -->
    <div id="sc-panel-max" style="display:none;">
      <div style="text-align:center;margin-bottom:1.25rem;">
        <div class="scenario-badge badge-max">&#128640; Maximum Budget</div>
        <div style="font-size:12px;color:var(--muted2);">Full-scale launch — premium production, aggressive marketing, max dramas</div>
      </div>
      <div class="calc-section-title">&#128176; Pricing</div>
      <div class="form-group">
        <label class="form-label">Price per episode (RM)</label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinPrice('max',-0.10)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-price-max" type="number" step="0.01" min="0.01" value="0.50"/>
          <button class="spin-btn" onclick="spinPrice('max',0.10)" type="button">+</button>
        </div>
        <div class="input-hint">RM 0.50 premium — safely below iQIYI subscription</div>
      </div>
      <div class="form-group">
        <label class="form-label">Number of paid episodes <span class="free-tag">+ 3 free</span></label>
        <div class="spin-group">
          <button class="spin-btn" onclick="spinEps('max',-1)" type="button">&#8722;</button>
          <input class="spin-input" id="inp-eps-max" type="number" min="1" max="17" value="17" oninput="updateEpisodeVisualFor('max')"/>
          <button class="spin-btn" onclick="spinEps('max',1)" type="button">+</button>
        </div>
        <div class="episodes-visual" id="ep-visual-max"></div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#127916; Dramas</div>
      <div class="form-group">
        <div class="drama-counter">
          <button class="counter-btn" onclick="spinDrama('max',-1)" type="button">&#8722;</button>
          <div><div class="counter-val" id="drama-count-max">8</div><div class="counter-label">drama(s)</div></div>
          <button class="counter-btn" onclick="spinDrama('max',1)" type="button">+</button>
        </div>
      </div>
      <div class="calc-divider"></div>
      <div class="calc-section-title">&#128202; Cost structure (RM)</div>
      <div class="cost-grid">
        <div class="cost-card"><div class="cost-card-label">Production</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-production-max" type="number" min="0" value="30000" oninput="updateTotalCostFor('max')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Management</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-management-max" type="number" min="0" value="50000" oninput="updateTotalCostFor('max')" style="padding-left:38px;"/></div></div>
        <div class="cost-card"><div class="cost-card-label">Marketing</div><div class="input-addon"><span class="addon-text">RM</span><input class="form-input" id="inp-marketing-max" type="number" min="0" value="25000" oninput="updateTotalCostFor('max')" style="padding-left:38px;"/></div></div>
      </div>
      <div class="total-cost-bar"><div class="total-cost-label">Total fixed cost</div><div class="total-cost-val" id="total-cost-display-max">RM 105,000</div></div>
    </div>

    <div class="calc-divider"></div>
    <div style="display:flex;gap:10px;">
      <button class="btn-secondary" id="btn-calc-back" style="flex:1;padding:12px;">&#8592; Back to Login</button>
      <button class="btn-primary" id="btn-calculate" style="flex:3;">Preview All 3 Scenarios &#8594;</button>
    </div>
  </div>
</div>

<!-- ══ SCREEN 3: SUMMARY ══ -->
<style>
.sc-summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:1.25rem;}
.sc-summary-card{background:var(--surface2);border-radius:var(--radius-lg);padding:1rem;border-top:3px solid;}
.sc-summary-card.sc-min{border-color:#cd853f;}
.sc-summary-card.sc-decent{border-color:var(--gold);}
.sc-summary-card.sc-max{border-color:var(--crimson);}
.sc-sum-label{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:2px;}
.sc-sum-val{font-family:var(--font-head);font-size:13px;font-weight:600;color:var(--white);margin-bottom:6px;}
.sc-sum-net{font-family:var(--font-head);font-size:16px;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);}
@media(max-width:600px){.sc-summary-grid{grid-template-columns:1fr;}}
</style>
<div class="screen" id="screen-summary">
  <div class="summary-box" style="max-width:680px;">
    <div class="summary-header">
      <div class="summary-check">✓</div>
      <div class="summary-title">Scenarios Overview</div>
      <div class="summary-sub">Compare all 3 budget scenarios before entering the dashboard</div>
    </div>
    <div class="sc-summary-grid">
      <div class="sc-summary-card sc-min">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#cd853f;margin-bottom:10px;">&#127807; Minimum</div>
        <div class="sc-sum-label">Price/ep</div><div class="sc-sum-val" id="ssum-price-min">—</div>
        <div class="sc-sum-label">Paid Episodes</div><div class="sc-sum-val" id="ssum-eps-min">—</div>
        <div class="sc-sum-label">Dramas</div><div class="sc-sum-val" id="ssum-dramas-min">—</div>
        <div class="sc-sum-label">Fixed Cost</div><div class="sc-sum-val" id="ssum-fixed-min">—</div>
        <div class="sc-sum-label">Est. Net Profit</div>
        <div class="sc-sum-net" id="ssum-net-min">—</div>
      </div>
      <div class="sc-summary-card sc-decent">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;">&#9878;&#65039; Decent</div>
        <div class="sc-sum-label">Price/ep</div><div class="sc-sum-val" id="ssum-price-decent">—</div>
        <div class="sc-sum-label">Paid Episodes</div><div class="sc-sum-val" id="ssum-eps-decent">—</div>
        <div class="sc-sum-label">Dramas</div><div class="sc-sum-val" id="ssum-dramas-decent">—</div>
        <div class="sc-sum-label">Fixed Cost</div><div class="sc-sum-val" id="ssum-fixed-decent">—</div>
        <div class="sc-sum-label">Est. Net Profit</div>
        <div class="sc-sum-net" id="ssum-net-decent">—</div>
      </div>
      <div class="sc-summary-card sc-max">
        <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#e05060;margin-bottom:10px;">&#128640; Maximum</div>
        <div class="sc-sum-label">Price/ep</div><div class="sc-sum-val" id="ssum-price-max">—</div>
        <div class="sc-sum-label">Paid Episodes</div><div class="sc-sum-val" id="ssum-eps-max">—</div>
        <div class="sc-sum-label">Dramas</div><div class="sc-sum-val" id="ssum-dramas-max">—</div>
        <div class="sc-sum-label">Fixed Cost</div><div class="sc-sum-val" id="ssum-fixed-max">—</div>
        <div class="sc-sum-label">Est. Net Profit</div>
        <div class="sc-sum-net" id="ssum-net-max">—</div>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn-secondary" id="btn-back">&#8592; Back to Editing</button>
      <button class="btn-primary-sm" id="btn-enter-dash">Enter Dashboard &#8594;</button>
    </div>
  </div>
</div>

<!-- ══ SCREEN 4: DASHBOARD ══ -->
<div class="screen" id="screen-dashboard" style="flex-direction:column;">
  <header class="topbar">
    <div class="logo">
      <div class="logo-icon">P3</div>
      <div>
        <div class="logo-name">Pentas3</div>
        <div class="logo-sub">Financial Dashboard</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="topbar-user">Signed in as <span id="topbar-username">admin</span></div>
      <button class="icon-btn" id="btn-mode">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        Light mode
      </button>
      <button class="icon-btn" id="btn-back-to-summary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Edit Scenarios
      </button>
      <button class="icon-btn" id="btn-logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        Sign out
      </button>
    </div>
  </header>
  <div class="layout">
    <aside class="sidebar">
      <div class="nav-label">Navigation</div>
      <div class="nav-item active" data-page="overview">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>Overview
      </div>
      <div class="nav-item" data-page="projections">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>12-Month Projections
      </div>
      <div class="nav-item" data-page="costs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>Cost Breakdown
      </div>
      <div class="nav-item" data-page="payout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>Payout Split
      </div>
      <div class="nav-item" data-page="scenarios">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>Scenarios Compare
      </div>
      <div class="nav-divider"></div>
      <div class="nav-label">Your configuration</div>
      <div class="sc-pills" id="configPills"></div>
    </aside>
    <main class="main">

      <!-- OVERVIEW -->
      <div class="page active" id="page-overview">
        <div class="page-header">
          <div class="page-title">Overview</div>
          <div class="page-sub" id="dash-sub">—</div>
        </div>
        <div class="config-banner" id="configBanner"></div>
        <div class="metrics-grid" id="overviewMetrics"></div>
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Monthly revenue breakdown</div><div class="card-sub">12-month projection based on your configuration</div></div>
            <div class="chart-tabs">
              <button class="ctab active" data-chart="revenue">Revenue</button>
              <button class="ctab" data-chart="users">Users</button>
              <button class="ctab" data-chart="net">Net profit</button>
            </div>
          </div>
          <div class="legend" style="margin-bottom:12px;" id="chartLegend"></div>
          <div style="position:relative;width:100%;height:260px;"><canvas id="mainChart"></canvas></div>
        </div>
        <div id="detailPanel" class="detail-panel">
          <div class="detail-title" id="detailTitle"></div>
          <div class="detail-grid" id="detailGrid"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Monthly breakdown table</div><div class="card-sub" style="font-size:11px;color:var(--muted)">Click any row for details</div></div>
          <div class="table-wrap"><table><thead><tr>
            <th>Month</th><th>Phase</th><th>Total users</th><th>Paying users</th><th>Revenue</th><th>Direct cost</th><th>Gross profit</th><th>Net profit</th>
          </tr></thead><tbody id="tableBody"></tbody></table></div>
        </div>
      </div>

      <!-- PROJECTIONS -->
      <div class="page" id="page-projections">
        <div class="page-header">
          <div class="page-title">12-Month Projections</div>
          <div class="page-sub">Holiday-adjusted · Malaysian public holidays anchored for months 7–12</div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Full projection table</div></div>
          <div class="table-wrap"><table><thead><tr>
            <th>Month</th><th>Phase & holiday</th><th>Total users</th><th>Paying users</th><th>Revenue</th><th>Direct cost (40%)</th><th>Gross profit (60%)</th><th>Monthly fixed</th><th>Net profit</th>
          </tr></thead><tbody id="projTableBody"></tbody></table></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Holiday alignment — months 7–12</div></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;" id="holidayCards"></div>
        </div>
      </div>

      <!-- COSTS -->
      <div class="page" id="page-costs">
        <div class="page-header">
          <div class="page-title">Cost Breakdown</div>
          <div class="page-sub">Your custom cost structure and how it affects profitability</div>
        </div>
        <div class="sc-grid" id="costCards"></div>
        <div class="card">
          <div class="card-header"><div class="card-title">Cost vs gross profit comparison</div></div>
          <div style="position:relative;width:100%;height:260px;"><canvas id="costChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Pricing rationale</div></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
            <div style="padding:1rem;background:var(--surface2);border-radius:var(--radius);"><div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">RM 0.30 baseline</div><div style="font-size:12px;color:var(--muted2);line-height:1.6;">Clears payment gateway fees (Touch 'n Go / FPX). Avoids "cheap content" perception while keeping friction low.</div></div>
            <div style="padding:1rem;background:var(--surface2);border-radius:var(--radius);"><div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">RM 0.40 moderate</div><div style="font-size:12px;color:var(--muted2);line-height:1.6;">RM 6.80 total stays well under a fast-food meal. Psychological sweetspot between accessible and premium.</div></div>
            <div style="padding:1rem;background:var(--surface2);border-radius:var(--radius);"><div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">RM 0.50 maximum</div><div style="font-size:12px;color:var(--muted2);line-height:1.6;">RM 8.50 total sits safely below the RM 16.90/month iQIYI subscription — avoids direct streaming comparison.</div></div>
          </div>
        </div>
      </div>

      <!-- PAYOUT -->
      <div class="page" id="page-payout">
        <div class="page-header">
          <div class="page-title">Payout Split</div>
          <div class="page-sub">Revenue distribution — Producer · Director · Pentas3</div>
        </div>
        <div class="payout-grid">
          <div class="payout-card" style="border-color:rgba(212,175,55,.4)"><div class="payout-role">Producer</div><div class="payout-pct gold">80%</div><div class="payout-desc">Primary content creator share</div><div class="payout-amt" id="po-producer">—</div></div>
          <div class="payout-card" style="border-color:rgba(245,245,245,.3)"><div class="payout-role">Director</div><div class="payout-pct" style="color:var(--white)">20%</div><div class="payout-desc">Creative direction share</div><div class="payout-amt" id="po-director">—</div></div>
          <div class="payout-card" style="border-color:rgba(190,30,45,.4);opacity:.5"><div class="payout-role">Pentas3</div><div class="payout-pct red" style="font-size:16px;padding-top:8px;">Transaction cost only</div><div class="payout-desc">App store / gateway fees (not from net profit)</div><div class="payout-amt" id="po-pentas" style="font-size:11px;color:var(--muted)">Android/Apple cut</div></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Payout breakdown chart</div></div>
          <div style="position:relative;width:100%;height:240px;"><canvas id="payoutChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Profitability for producer & director</div></div>
          <div style="padding:1rem;background:rgba(212,175,55,.06);border:1px solid rgba(212,175,55,.2);border-radius:var(--radius);margin-bottom:12px;" id="producerInsight"></div>
          <div class="table-wrap"><table><thead><tr><th>Role</th><th>Share</th><th>Amount from net profit</th><th>Per drama</th></tr></thead><tbody id="payoutDetailBody"></tbody></table></div>
        </div>
      </div>

      <!-- SCENARIOS COMPARISON -->
      <div class="page" id="page-scenarios">
        <div class="page-header">
          <div class="page-title">Scenarios Comparison</div>
          <div class="page-sub">Minimum · Decent · Maximum — side-by-side 12-month projection</div>
        </div>
        <div id="scCompareMetrics" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:1.5rem;"></div>
        <div class="card">
          <div class="card-header">
            <div><div class="card-title">Net profit trajectory — all 3 scenarios</div><div class="card-sub">Monthly net profit across 12 months · hover for details</div></div>
          </div>
          <div style="display:flex;gap:16px;margin-bottom:12px;" id="scCompareLegend"></div>
          <div style="position:relative;width:100%;height:300px;"><canvas id="scCompareChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Revenue vs Investment comparison</div><div class="card-sub">Total revenue, fixed cost and net profit per scenario</div></div>
          <div style="position:relative;width:100%;height:260px;"><canvas id="scBarChart"></canvas></div>
        </div>
        <div class="card" id="scPredictionCard">
          <div class="card-header"><div class="card-title">&#127775; Best Outcome Prediction</div></div>
          <div id="scPredictionBody" style="padding:.5rem 0;"></div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Scenario detail table</div></div>
          <div class="table-wrap">
            <table><thead><tr>
              <th>Metric</th>
              <th style="color:#cd853f">&#127807; Minimum</th>
              <th style="color:var(--gold)">&#9878; Decent</th>
              <th style="color:#e05060">&#128640; Maximum</th>
            </tr></thead>
            <tbody id="scDetailTable"></tbody></table>
          </div>
        </div>
      </div>

    </main>
  </div>
</div>

<script>
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

/* ═══════════════════════════════════════════
   SCENARIO TAB SWITCHING (wizard)
═══════════════════════════════════════════ */
function switchScenarioTab(tab){
  activeScenarioTab = tab;
  ['min','decent','max'].forEach(t=>{
    document.getElementById('tab-'+t).className = 'sc-tab' + (t===tab?' active':'');
    document.getElementById('sc-panel-'+t).style.display = t===tab?'':'none';
  });
}

/* Spinner helpers */
function spinPrice(sc, delta){
  const el = document.getElementById('inp-price-'+sc);
  el.value = Math.max(0.01,(parseFloat(el.value||0)+delta)).toFixed(2);
}
function spinEps(sc, delta){
  const el = document.getElementById('inp-eps-'+sc);
  el.value = Math.min(17, Math.max(1, parseInt(el.value||0)+delta));
  updateEpisodeVisualFor(sc);
}
function spinDrama(sc, delta){
  dramaCounts[sc] = Math.max(1, dramaCounts[sc]+delta);
  document.getElementById('drama-count-'+sc).textContent = dramaCounts[sc];
}
function updateTotalCostFor(sc){
  const p = parseFloat(document.getElementById('inp-production-'+sc).value)||0;
  const m = parseFloat(document.getElementById('inp-management-'+sc).value)||0;
  const mk= parseFloat(document.getElementById('inp-marketing-'+sc).value)||0;
  document.getElementById('total-cost-display-'+sc).textContent = 'RM '+(p+m+mk).toLocaleString();
}
function updateEpisodeVisualFor(sc){
  const val = parseInt(document.getElementById('inp-eps-'+sc).value)||0;
  const paid = Math.min(Math.max(val,0),17);
  let dots='';
  for(let i=1;i<=paid+3;i++){
    let cls='ep-dot'; if(i<=3) cls+=' free'; else cls+=' paid';
    dots+=`<div class="${cls}" title="Ep ${i}">${i}</div>`;
  }
  document.getElementById('ep-visual-'+sc).innerHTML=dots;
}

/* ═══════════════════════════════════════════
   SCREEN SWITCHING
═══════════════════════════════════════════ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ═══════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════ */
document.getElementById('btn-login').addEventListener('click', ()=>{
  const u = document.getElementById('inp-user').value.trim();
  const p = document.getElementById('inp-pass').value;
  const err = document.getElementById('login-error');
  if(u===CREDS.username && p===CREDS.password){
    loggedInUser = u;
    err.classList.remove('show');
    showScreen('screen-calc');
    ['min','decent','max'].forEach(sc=>{
      updateEpisodeVisualFor(sc);
      updateTotalCostFor(sc);
    });
  } else {
    err.classList.add('show');
  }
});
['inp-user','inp-pass'].forEach(id=>{
  document.getElementById(id).addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('btn-login').click(); });
});
document.getElementById('btn-logout').addEventListener('click',()=>{
  document.getElementById('inp-user').value='';
  document.getElementById('inp-pass').value='';
  showScreen('screen-login');
});

/* ═══════════════════════════════════════════
   CALCULATE & PREVIEW
═══════════════════════════════════════════ */
function readScenario(sc){
  return {
    price:      parseFloat(document.getElementById('inp-price-'+sc).value)||0.30,
    paidEps:    parseInt(document.getElementById('inp-eps-'+sc).value)||10,
    dramas:     dramaCounts[sc],
    production: parseFloat(document.getElementById('inp-production-'+sc).value)||0,
    management: parseFloat(document.getElementById('inp-management-'+sc).value)||0,
    marketing:  parseFloat(document.getElementById('inp-marketing-'+sc).value)||0,
  };
}

document.getElementById('btn-calculate').addEventListener('click',()=>{
  ['min','decent','max'].forEach(sc=>{
    const s = readScenario(sc);
    if(s.price<=0||isNaN(s.price)){ alert('Please enter a valid price for '+sc+' scenario.'); return; }
    scenarios[sc] = s;
  });

  // Populate summary cards
  ['min','decent','max'].forEach(sc=>{
    const s = scenarios[sc];
    const net = netProfitFor(s);
    document.getElementById('ssum-price-'+sc).textContent   = 'RM '+s.price.toFixed(2)+'/ep';
    document.getElementById('ssum-eps-'+sc).textContent     = s.paidEps+' eps';
    document.getElementById('ssum-dramas-'+sc).textContent  = s.dramas+' drama'+(s.dramas>1?'s':'');
    document.getElementById('ssum-fixed-'+sc).textContent   = fmt(totalFixedFor(s));
    const netEl = document.getElementById('ssum-net-'+sc);
    netEl.textContent = fmtNet(net);
    netEl.style.color = net>=0?'var(--gold)':'var(--crimson)';
  });

  showScreen('screen-summary');
});

document.getElementById('btn-back').addEventListener('click',()=>showScreen('screen-calc'));
document.getElementById('btn-calc-back').addEventListener('click',()=>showScreen('screen-login'));
document.getElementById('btn-back-to-summary').addEventListener('click',()=>showScreen('screen-summary'));
document.getElementById('btn-enter-dash').addEventListener('click',()=>{
  // Use 'decent' as default active scenario for individual dashboard pages
  cfg = { ...scenarios.decent };
  document.getElementById('topbar-username').textContent=loggedInUser;
  buildDashboard();
  showScreen('screen-dashboard');
});

/* ═══════════════════════════════════════════
   LIGHT/DARK MODE
═══════════════════════════════════════════ */
document.getElementById('btn-mode').addEventListener('click',()=>{
  isLight=!isLight;
  document.body.classList.toggle('light',isLight);
  const btn=document.getElementById('btn-mode');
  btn.innerHTML=isLight
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg> Dark mode`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Light mode`;
  if(chartInst) renderMainChart();
});

/* ═══════════════════════════════════════════
   PAGE NAV
═══════════════════════════════════════════ */
document.querySelectorAll('.nav-item[data-page]').forEach(el=>{
  el.addEventListener('click',()=>{
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+el.dataset.page).classList.add('active');
    if(el.dataset.page==='scenarios') buildScenariosPage();
  });
});

/* chart tab switch */
document.querySelectorAll('.ctab[data-chart]').forEach(el=>{
  el.addEventListener('click',()=>{
    document.querySelectorAll('.ctab').forEach(t=>t.classList.remove('active'));
    el.classList.add('active');
    currentChart=el.dataset.chart;
    renderMainChart();
  });
});

/* ═══════════════════════════════════════════
   BUILD DASHBOARD
═══════════════════════════════════════════ */
function buildDashboard(){
  document.getElementById('dash-sub').textContent=
    scenarios.decent.dramas+' dramas (decent) · RM '+scenarios.decent.price.toFixed(2)+'/ep · '+scenarios.decent.paidEps+' paid eps';

  buildConfigBanner();
  buildConfigPills();
  renderOverviewMetrics();
  renderMainChart();
  renderTable();
  renderProjTable();
  buildHolidayCards();
  buildCostCards();
  buildCostChart();
  renderPayoutAmounts();
  buildPayoutChart();
  buildPayoutTable();
}

function buildConfigBanner(){
  document.getElementById('configBanner').innerHTML=
    `<div class="config-tag">&#128176; <strong>RM ${cfg.price.toFixed(2)}/ep</strong></div>
     <div class="config-tag">&#127916; <strong>${cfg.paidEps} paid eps</strong></div>
     <div class="config-tag">&#128250; <strong>${cfg.dramas} drama(s)</strong></div>
     <div class="config-tag">&#128202; Fixed cost: <strong>${fmt(totalFixed())}</strong></div>
     <div class="config-tag">&#128181; Net profit: <strong style="color:${netProfit()>=0?'var(--gold)':'var(--crimson)'}">${fmtNet(netProfit())}</strong></div>`;
}

function buildConfigPills(){
  document.getElementById('configPills').innerHTML=`
    <div class="sc-pill active"><div><div class="sc-pill-name">Production</div><div class="sc-pill-cost">${fmt(cfg.production)}</div></div><div class="sc-pill-dot" style="background:var(--gold)"></div></div>
    <div class="sc-pill active"><div><div class="sc-pill-name">Management</div><div class="sc-pill-cost">${fmt(cfg.management)}</div></div><div class="sc-pill-dot" style="background:var(--crimson)"></div></div>
    <div class="sc-pill active"><div><div class="sc-pill-name">Marketing</div><div class="sc-pill-cost">${fmt(cfg.marketing)}</div></div><div class="sc-pill-dot" style="background:#a0522d"></div></div>`;
}

/* ═══════════════════════════════════════════
   OVERVIEW METRICS
═══════════════════════════════════════════ */
function renderOverviewMetrics(){
  const data=calcMonthData();
  const tRev=data.reduce((a,d)=>a+d.rev,0);
  const tGP=data.reduce((a,d)=>a+d.gp,0);
  const tDC=data.reduce((a,d)=>a+d.dc,0);
  const tU=data.reduce((a,d)=>a+d.users,0);
  const net=netProfit();
  document.getElementById('overviewMetrics').innerHTML=`
    <div class="metric-card"><div class="metric-label">Total users (12mo)</div><div class="metric-val">${tU.toLocaleString()}</div><div class="metric-note">×${cfg.dramas} drama(s) · 10% conversion</div></div>
    <div class="metric-card"><div class="metric-label">Total revenue</div><div class="metric-val">${fmt(tRev)}</div><div class="metric-note">RM ${cfg.price.toFixed(2)} × ${cfg.paidEps} paid eps</div></div>
    <div class="metric-card"><div class="metric-label">Direct cost (40%)</div><div class="metric-val">${fmt(tDC)}</div><div class="metric-note">Platform & operations</div></div>
    <div class="metric-card gold-accent"><div class="metric-label">Gross profit (60%)</div><div class="metric-val">${fmt(tGP)}</div><div class="metric-note">Before fixed costs</div></div>
    <div class="metric-card"><div class="metric-label">Total fixed cost</div><div class="metric-val">${fmt(totalFixed())}</div><div class="metric-note">Production + Management + Marketing</div></div>
    <div class="metric-card ${net>=0?'gold-accent':'red-accent'}"><div class="metric-label">Net profit</div><div class="metric-val ${net>=0?'pos':'neg'}">${fmtNet(net)}</div><div class="metric-note">All dramas · 12 months</div></div>`;
}

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
  if(net>=0){
    document.getElementById('po-producer').textContent=fmt(net*0.80);
    document.getElementById('po-director').textContent=fmt(net*0.20);
  } else {
    ['po-producer','po-director'].forEach(id=>document.getElementById(id).textContent='—');
  }
}

function buildPayoutChart(){
  const ctx=document.getElementById('payoutChart').getContext('2d');
  const net=Math.max(0,netProfit());
  new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['Producer (80%)','Director (20%)'],
      datasets:[{data:[net*0.80,net*0.20],backgroundColor:['rgba(212,175,55,0.85)','rgba(245,245,245,0.5)'],borderWidth:0}]
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
    insight.innerHTML=`<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      With <strong style="color:var(--gold)">${fmt(net)}</strong> net profit across <strong style="color:var(--gold)">${cfg.dramas} drama(s)</strong>:<br>
      Producer earns <strong style="color:var(--gold)">${fmt(net*0.80)}</strong> total (${fmt(perDrama*0.80)} per drama) ·
      Director earns <strong style="color:var(--white)">${fmt(net*0.20)}</strong> total.<br>
      <span style="color:var(--muted);font-size:11px;">Note: Pentas3 only deducts transaction costs (Android/Apple store fees) — not taken from net profit.</span>
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML=`
      <tr><td>Producer</td><td>80%</td><td class="pos-val">${fmt(net*0.80)}</td><td>${fmt(net*0.80/cfg.dramas)}</td></tr>
      <tr><td>Director</td><td>20%</td><td>${fmt(net*0.20)}</td><td>${fmt(net*0.20/cfg.dramas)}</td></tr>
      <tr><td colspan="4" style="font-size:11px;color:var(--muted);padding-top:10px;">&#8505; Pentas3 takes transaction costs only (app store/gateway fees) — deducted before gross profit, not from net profit split.</td></tr>`;
  } else {
    insight.innerHTML=`<div style="font-size:12px;color:var(--muted2);line-height:1.7;">
      Currently showing a loss of <strong style="color:var(--crimson)">${fmtNet(net)}</strong>. No payout is distributed until net profit turns positive.
      Try reducing your fixed costs or increasing price per episode / number of dramas.
    </div>`;
    document.getElementById('payoutDetailBody').innerHTML=`<tr><td colspan="3" style="color:var(--muted);text-align:center;padding:1rem;">No payout — net profit is negative</td></tr>`;
  }
}

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

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
['min','decent','max'].forEach(sc=>{
  updateEpisodeVisualFor(sc);
  updateTotalCostFor(sc);
});
</script>
</body>
</html>

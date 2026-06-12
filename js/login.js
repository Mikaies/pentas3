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
    showScreen('screen-setup');
    updateGlobalEpisodeVisual();
    ['min','decent','max'].forEach(sc=>{
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

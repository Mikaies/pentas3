/* ═══════════════════════════════════════════
   SCREEN SWITCHING
═══════════════════════════════════════════ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ── AUTH TAB SWITCHING ── */
function switchAuthTab(tab){
  ['signin','register'].forEach(t=>{
    document.getElementById('tab-'+t).className = 'sc-tab'+(t===tab?' active':'');
    document.getElementById('panel-'+t).style.display = t===tab?'':'none';
  });
}

/* ── GREETING ── */
function showGreeting(name){
  const greeting = getGreeting();
  const pill = document.getElementById('topbarUserName');
  if(pill){
    pill.textContent = `${greeting}, ${name}!`;
    pill.style.display = '';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{

  // Wire up tabs
  document.getElementById('tab-signin').addEventListener('click', ()=>switchAuthTab('signin'));
  document.getElementById('tab-register').addEventListener('click', ()=>switchAuthTab('register'));

  /* ── ADMIN BYPASS ── */
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';
  if(isAdmin){
    showScreen('screen-admin');
    // Hide sign out button for admin
    const logoutBtn = document.getElementById('btn-logout');
    if(logoutBtn) logoutBtn.style.display = 'none';
  }

  document.getElementById('btn-admin-enter').addEventListener('click', ()=>{
    showScreen('screen-setup');
    updateGlobalEpisodeVisual();
    ['min','decent','max'].forEach(sc=>{ updateTotalCostFor(sc); });
  });

  /* ── SIGN IN ── */
  document.getElementById('btn-login').addEventListener('click', async ()=>{
    const email = document.getElementById('inp-email').value.trim();
    const pass = document.getElementById('inp-pass').value;
    const err = document.getElementById('login-error');
    err.textContent = '';
    try {
      const cred = await auth.signInWithEmailAndPassword(email, pass);
      const data = await loadUserData(cred.user.uid);
      if(data){
        userName = data.name || data.email || email;
        if(data.scenarios) scenarios = data.scenarios;
        if(data.globalDramas) globalDramas = data.globalDramas;
        if(data.globalEps) globalEps = data.globalEps;
      } else {
        userName = email;
      }
      showGreeting(userName);
      showScreen('screen-setup');
      updateGlobalEpisodeVisual();
      ['min','decent','max'].forEach(sc=>{ updateTotalCostFor(sc); });
    } catch(e){
      err.textContent = 'Incorrect email or password. Please try again.';
      err.classList.add('show');
    }
  });

  /* ── REGISTER ── */
  document.getElementById('btn-register').addEventListener('click', async ()=>{
    const name = document.getElementById('inp-reg-name').value.trim();
    const email = document.getElementById('inp-reg-email').value.trim();
    const pass = document.getElementById('inp-reg-pass').value;
    const err = document.getElementById('register-error');
    err.textContent = '';
    if(!name){ err.textContent = 'Please enter your name.'; err.classList.add('show'); return; }
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, pass);
      await saveUserData(cred.user.uid, { name, email });
      userName = name;
      showGreeting(userName);
      showScreen('screen-setup');
      updateGlobalEpisodeVisual();
      ['min','decent','max'].forEach(sc=>{ updateTotalCostFor(sc); });
    } catch(e){
      err.textContent = e.message;
      err.classList.add('show');
    }
  });

/* ── SIGN OUT ── */
  document.getElementById('btn-logout').addEventListener('click', async ()=>{
    if(isAdmin) return;
    await auth.signOut();
    userName = '';
    resetScenariosToDefault();
    globalDramas = 1;
    globalEps = 4;
    const pill = document.getElementById('topbarUserName');
    if(pill){ pill.style.display = 'none'; }
    showScreen('screen-login');
  });

  /* ── PROFILE MODAL ── */
  document.getElementById('btn-profile').addEventListener('click', ()=>{
    document.getElementById('inp-profile-name').value = userName || '';
    document.getElementById('inp-profile-email').value = auth.currentUser ? auth.currentUser.email : '';
    document.getElementById('profile-error').textContent = '';
    document.getElementById('profile-success').textContent = '';
    const modal = document.getElementById('profileModal');
    modal.style.display = 'flex';
  });

  document.getElementById('btn-profile-save').addEventListener('click', async ()=>{
    const newName = document.getElementById('inp-profile-name').value.trim();
    const newEmail = document.getElementById('inp-profile-email').value.trim();
    const pass = document.getElementById('inp-profile-pass').value;
    const errEl = document.getElementById('profile-error');
    const successEl = document.getElementById('profile-success');
    errEl.textContent = '';
    errEl.classList.remove('show');
    successEl.textContent = '';

    if(!newName){ errEl.textContent = 'Please enter a name.'; errEl.classList.add('show'); return; }

    try {
      const user = auth.currentUser;
      const emailChanged = newEmail !== user.email;

      if(emailChanged){
        if(!pass){ errEl.textContent = 'Please enter your current password to change email.'; errEl.classList.add('show'); return; }
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, pass);
        await user.reauthenticateWithCredential(credential);
        await user.updateEmail(newEmail);
      }

      await saveUserData(user.uid, { name: newName, email: newEmail });
      userName = newName;
      showGreeting(userName);
      successEl.textContent = 'Profile updated successfully!';
    } catch(e){
      let msg = 'Something went wrong. Please try again.';
      if(e.code === 'auth/wrong-password') msg = 'Incorrect current password.';
      else if(e.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
      else if(e.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
      else if(e.code === 'auth/requires-recent-login') msg = 'Please sign out and sign in again before changing your email.';
      errEl.textContent = msg;
      errEl.classList.add('show');
    }
  });

/* ── START OVER ── */
  document.getElementById('btn-start-over').addEventListener('click',()=>{
    globalDramas = 1;
    globalEps = 4;
    document.getElementById('global-drama-count').textContent = globalDramas;
    document.getElementById('global-eps').value = globalEps;
    updateGlobalEpisodeVisual();
    resetScenariosToDefault();
    showScreen('screen-setup');
  });

  /* ── AUTO SAVE when entering dashboard ── */
  document.getElementById('btn-enter-dash').addEventListener('click', async ()=>{
    cfg = { ...scenarios.decent };
    buildDashboard();
    showScreen('screen-dashboard');
    if(auth.currentUser){
      await saveUserData(auth.currentUser.uid, {
        scenarios,
        globalDramas,
        globalEps,
      });
    }
  });

});

function closeProfileModal(){
  document.getElementById('profileModal').style.display = 'none';
}
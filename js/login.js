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
    // Clear all fields and reset to sign in tab
    document.getElementById('inp-email').value = '';
    document.getElementById('inp-pass').value = '';
    document.getElementById('inp-reg-name').value = '';
    document.getElementById('inp-reg-email').value = '';
    document.getElementById('inp-reg-pass').value = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('register-error').textContent = '';
    document.getElementById('register-error').classList.remove('show');
    switchAuthTab('signin');
    showScreen('screen-login');
  });

/* ── PROFILE MODAL ── */
  document.getElementById('btn-profile').addEventListener('click', ()=>{
    document.getElementById('inp-profile-name').value = userName || '';
    document.getElementById('inp-profile-email').value = auth.currentUser ? auth.currentUser.email : '';
    document.getElementById('inp-profile-currpass').value = '';
    document.getElementById('inp-profile-newpass').value = '';
    document.getElementById('inp-profile-currpass2').value = '';
    document.getElementById('profile-error').textContent = '';
    document.getElementById('profile-error').classList.remove('show');
    document.getElementById('profile-success').textContent = '';
    document.getElementById('profileModal').style.display = 'flex';
  });

  document.getElementById('btn-profile-save').addEventListener('click', async ()=>{
    const newName = document.getElementById('inp-profile-name').value.trim();
    const newEmail = document.getElementById('inp-profile-email').value.trim();
    const currPass = document.getElementById('inp-profile-currpass').value;
    const newPass = document.getElementById('inp-profile-newpass').value;
    const currPass2 = document.getElementById('inp-profile-currpass2').value;
    const errEl = document.getElementById('profile-error');
    const successEl = document.getElementById('profile-success');
    errEl.textContent = '';
    errEl.classList.remove('show');
    successEl.textContent = '';

    if(!newName){ errEl.textContent = 'Please enter a name.'; errEl.classList.add('show'); return; }

    const user = auth.currentUser;
    const emailChanged = newEmail && newEmail !== user.email;
    const passwordChanged = newPass && newPass.length > 0;
    let messages = [];

    try {
      // Update name
      await updateUserName(newName);
      userName = newName;
      showGreeting(userName);
      messages.push('Name updated');

      // Update email if changed
      if(emailChanged){
        if(!currPass){ errEl.textContent = 'Please enter your current password to change email.'; errEl.classList.add('show'); return; }
        try {
          await updateUserEmail(newEmail, currPass);
          messages.push('Email updated');
        } catch(e){
          let msg = 'Email update failed.';
          if(e.code === 'auth/wrong-password') msg = 'Incorrect current password for email change.';
          else if(e.code === 'auth/email-already-in-use') msg = 'This email is already in use.';
          else if(e.code === 'auth/requires-recent-login') msg = 'Please sign out and sign in again to change email.';
          errEl.textContent = msg;
          errEl.classList.add('show');
          return;
        }
      }

      // Update password if filled
      if(passwordChanged){
        if(newPass.length < 6){ errEl.textContent = 'New password must be at least 6 characters.'; errEl.classList.add('show'); return; }
        if(!currPass2){ errEl.textContent = 'Please enter your current password to change password.'; errEl.classList.add('show'); return; }
        try {
          await updateUserPassword(newPass, currPass2);
          messages.push('Password updated');
        } catch(e){
          let msg = 'Password update failed.';
          if(e.code === 'auth/wrong-password') msg = 'Incorrect current password for password change.';
          else if(e.code === 'auth/requires-recent-login') msg = 'Please sign out and sign in again to change password.';
          errEl.textContent = msg;
          errEl.classList.add('show');
          return;
        }
      }

      successEl.textContent = messages.join(' · ') + ' successfully!';

    } catch(e){
      errEl.textContent = 'Something went wrong. Please try again.';
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
// ── FIREBASE SETUP ──
const firebaseConfig = {
  apiKey: "AIzaSyCgDS-bePAeHBPRwfI2xLT7rvKEAI7mBC8",
  authDomain: "pentas3-dashboard.firebaseapp.com",
  projectId: "pentas3-dashboard",
  storageBucket: "pentas3-dashboard.firebasestorage.app",
  messagingSenderId: "1029445243282",
  appId: "1:1029445243282:web:90dd101f4dffc4b6b4b14b",
  measurementId: "G-85PJXLQZKR"
};

const fbApp = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── TIME-BASED GREETING ──
function getGreeting(){
  const hour = new Date().getHours();
  if(hour >= 5 && hour < 12) return 'Good Morning';
  if(hour >= 12 && hour < 17) return 'Good Afternoon';
  if(hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

// ── SAVE USER DATA ──
async function saveUserData(uid, data){
  try {
    await db.collection('users').doc(uid).set(data, { merge: true });
  } catch(e){
    console.error('Error saving data:', e);
  }
}

// ── LOAD USER DATA ──
async function loadUserData(uid){
  try {
    const snap = await db.collection('users').doc(uid).get();
    if(snap.exists) return snap.data();
    return null;
  } catch(e){
    console.error('Error loading data:', e);
    return null;
  }
}

// ── RE-AUTHENTICATE USER ──
async function reauthUser(currentPassword){
  const user = auth.currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    currentPassword
  );
  await user.reauthenticateWithCredential(credential);
}

// ── UPDATE EMAIL IN FIREBASE AUTH + FIRESTORE ──
async function updateUserEmail(newEmail, currentPassword){
  await reauthUser(currentPassword);
  await auth.currentUser.updateEmail(newEmail);
  await saveUserData(auth.currentUser.uid, { email: newEmail });
}

// ── UPDATE PASSWORD IN FIREBASE AUTH ──
async function updateUserPassword(newPassword, currentPassword){
  await reauthUser(currentPassword);
  await auth.currentUser.updatePassword(newPassword);
}

// ── UPDATE DISPLAY NAME IN FIRESTORE ──
async function updateUserName(newName){
  await saveUserData(auth.currentUser.uid, { name: newName });
}

// ── SAVE HISTORY ENTRY ──
async function saveHistoryEntry(uid, entry){
  try {
    const histRef = db.collection('users').doc(uid).collection('history');
    await histRef.add({
      ...entry,
      savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e){
    console.error('Error saving history:', e);
  }
}

// ── LOAD HISTORY ──
async function loadHistory(uid){
  try {
    const snap = await db.collection('users').doc(uid)
      .collection('history')
      .get();
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by savedAt descending on client side
    entries.sort((a, b) => {
      const aTime = a.savedAt ? a.savedAt.seconds : 0;
      const bTime = b.savedAt ? b.savedAt.seconds : 0;
      return bTime - aTime;
    });
    return entries.slice(0, 20);
  } catch(e){
    console.error('Error loading history:', e);
    return [];
  }
}
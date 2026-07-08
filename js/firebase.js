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
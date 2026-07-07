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

// Load Firebase from CDN
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
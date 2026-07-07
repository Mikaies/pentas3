// ── FIREBASE SETUP ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgDS-bePAeHBPRwfI2xLT7rvKEAI7mBC8",
  authDomain: "pentas3-dashboard.firebaseapp.com",
  projectId: "pentas3-dashboard",
  storageBucket: "pentas3-dashboard.firebasestorage.app",
  messagingSenderId: "1029445243282",
  appId: "1:1029445243282:web:90dd101f4dffc4b6b4b14b",
  measurementId: "G-85PJXLQZKR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── TIME-BASED GREETING ──
function getGreeting(){
  const hour = new Date().getHours();
  if(hour >= 5 && hour < 12) return 'Good Morning';
  if(hour >= 12 && hour < 17) return 'Good Afternoon';
  if(hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

// ── SAVE USER DATA TO FIRESTORE ──
async function saveUserData(uid, data){
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch(e){
    console.error('Error saving data:', e);
  }
}

// ── LOAD USER DATA FROM FIRESTORE ──
async function loadUserData(uid){
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if(snap.exists()) return snap.data();
    return null;
  } catch(e){
    console.error('Error loading data:', e);
    return null;
  }
}

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getGreeting, saveUserData, loadUserData };
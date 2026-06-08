import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgq_Bbsz6s9m3XwMZN2MLFMExBWLwvub4",
  authDomain: "pear-ai-recipes.firebaseapp.com",
  projectId: "pear-ai-recipes",
  storageBucket: "pear-ai-recipes.firebasestorage.app",
  messagingSenderId: "622273986823",
  appId: "1:622273986823:web:095da8e22213d9c1a985a2",
  measurementId: "G-67F06KZQVR"
};

const app = initializeApp(firebaseConfig);

// This is the critical fix for iOS Capacitor - use indexedDB for persistence
export const auth = window.Capacitor?.isNativePlatform?.()
  ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
  : getAuth(app);

export const db = getFirestore(app);
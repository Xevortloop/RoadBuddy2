import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjd6tfd9v5ECDSwoolp0oPwinOi33SHlc",
  authDomain: "roadbuddy-local.firebaseapp.com",
  projectId: "roadbuddy-local",
  storageBucket: "roadbuddy-local.firebasestorage.app",
  messagingSenderId: "352596508738",
  appId: "1:352596508738:web:5f1dcf159c3041b44baddb",
  measurementId: "G-1MR4HY43WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

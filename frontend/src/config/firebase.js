import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration. Replace these placeholder credentials with your project's credentials.
const firebaseConfig = {
  apiKey: "AIzaSyDFjt0nBYpyVXEFkti8CugjSS5DBwoFI18",
  authDomain: "plataforma-gmax.firebaseapp.com",
  projectId: "plataforma-gmax",
  storageBucket: "plataforma-gmax.firebasestorage.app",
  messagingSenderId: "213219499650",
  appId: "1:213219499650:web:b1f5717ece4268c2111e9b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

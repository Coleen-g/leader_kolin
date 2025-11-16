// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4e3NcH0SubwIUQfmaXW0rEtmnMfogStM",
  authDomain: "campusnewsapp-5cced.firebaseapp.com",
  projectId: "campusnewsapp-5cced",
  storageBucket: "campusnewsapp-5cced.firebasestorage.app",
  messagingSenderId: "661707646713",
  appId: "1:661707646713:web:49493609b8ed57ebb9a428",
  measurementId: "G-5QV1Y1ELDD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
export const db = getFirestore(app);

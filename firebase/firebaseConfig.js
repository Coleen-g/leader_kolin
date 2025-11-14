// firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfISqnebBXZOwkOjnjt4gEj5FyfWlb8bY",
  authDomain: "campusnewsapp-0805.firebaseapp.com",
  projectId: "campusnewsapp-0805",
  storageBucket: "campusnewsapp-0805.firebasestorage.app",
  messagingSenderId: "840894241310",
  appId: "1:840894241310:web:58dd184c7126680e2cec0f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

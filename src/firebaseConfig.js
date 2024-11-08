// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
    apiKey: "AIzaSyAD7JLTfGK8LQdmUL8DutJSmw5s1sP8wzI",
    authDomain: "trading-journal-30008.firebaseapp.com",
    projectId: "trading-journal-30008",
    storageBucket: "trading-journal-30008.firebasestorage.app",
    messagingSenderId: "203207017585",
    appId: "1:203207017585:web:bd2845129f0dc5395c87d0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore export
export const storage = getStorage(app); // Add storage export

export default app;

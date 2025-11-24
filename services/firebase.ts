import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDIn0fhtBqfy2Y6V49o0mWHXxmZWm9tVgU",
  authDomain: "mural-acad.firebaseapp.com",
  projectId: "mural-acad",
  storageBucket: "mural-acad.firebasestorage.app",
  messagingSenderId: "810866493278",
  appId: "1:810866493278:web:048f6d68ebeecb1886b1cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services para uso na aplicação
export const db = getFirestore(app);
export const storage = getStorage(app);
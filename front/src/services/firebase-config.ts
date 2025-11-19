import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIBYbqA4mgZmHCrcr8EM8OP0Rkp4KPG8c",
  authDomain: "api-vidios-30d79.firebaseapp.com",
  projectId: "api-vidios-30d79",
  storageBucket: "api-vidios-30d79.firebasestorage.app",
  messagingSenderId: "420259844821",
  appId: "1:420259844821:web:48a457ba8ff73e6f11085c",
  measurementId: "G-FHDQJYQMQQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

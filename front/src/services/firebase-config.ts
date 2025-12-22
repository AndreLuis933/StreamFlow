import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwGvskDDCE5Dfl4PFG54G7XqkEAFnGM-c",
  authDomain: "streamflow-2510c.firebaseapp.com",
  projectId: "streamflow-2510c",
  storageBucket: "streamflow-2510c.firebasestorage.app",
  messagingSenderId: "760670775870",
  appId: "1:760670775870:web:0984acd93498f0ee087f6f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

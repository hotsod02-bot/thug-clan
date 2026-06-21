import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdSlxL3F0Ot_bSZ0jHjftEu4b2d7_ZgV0",
  authDomain: "thug-clan-8bc3c.firebaseapp.com",
  projectId: "thug-clan-8bc3c",
  storageBucket: "thug-clan-8bc3c.firebasestorage.app",
  messagingSenderId: "814646966531",
  appId: "1:814646966531:web:4b1257a15f0f789e785136",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB61Gdwxaj_EwMb_pJ7n3Yhphq2VeWU0UY",
  authDomain: "ar-zone-app.firebaseapp.com",
  projectId: "ar-zone-app",
  storageBucket: "ar-zone-app.firebasestorage.app",
  messagingSenderId: "741339319559",
  appId: "1:741339319559:web:50f8fbf7784bf80a9b09a2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

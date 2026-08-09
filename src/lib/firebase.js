import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpIvn2o5ZrSqqsZ9uJX9W2CzPamF8AI-w",
  authDomain: "fantasy-scores-app.firebaseapp.com",
  projectId: "fantasy-scores-app",
  storageBucket: "fantasy-scores-app.firebasestorage.app",
  messagingSenderId: "211500207758",
  appId: "1:211500207758:web:6e03b98bba28b7fcd283df"
};

// Initialize Firebase only if it hasn't been initialized already (prevents Next.js hot-reload errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC645C4GGbBx4ZrSznVUz3ZSqOCnS9Dxww",
  authDomain: "salesscan-d7847.firebaseapp.com",
  projectId: "salesscan-d7847",
  storageBucket: "salesscan-d7847.firebasestorage.app",
  messagingSenderId: "1033592006791",
  appId: "1:1033592006791:web:da65377036f022f7b87022",
  measurementId: "G-Z4H9EH93RE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

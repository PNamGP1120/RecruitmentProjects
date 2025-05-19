// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyBGe-8LCm1yNCLgo6u2fJO49ESXvTkoj2M",
  authDomain: "recruitmentchat-a3fde.firebaseapp.com",
  databaseURL: "https://recruitmentchat-a3fde-default-rtdb.firebaseio.com",
  projectId: "recruitmentchat-a3fde",
  storageBucket: "recruitmentchat-a3fde.firebasestorage.app",
  messagingSenderId: "26573681451",
  appId: "1:26573681451:web:8a7f5e71017e215dabcb6e",
  measurementId: "G-8669QMQ3VD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
console.log("Firebase initialized", app.name); // "Firebase App"

export { database };
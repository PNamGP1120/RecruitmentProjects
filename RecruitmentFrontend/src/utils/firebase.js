import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Cấu hình Firebase
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

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

console.log("Firebase initialized with auth, db, and database");

export { app, auth, db, database };
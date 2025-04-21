import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyACyWch0LkThsdp6HWmm9qrKJmmiupxA9M",
    authDomain: "medapp-38667.firebaseapp.com",
    projectId: "medapp-38667",
    storageBucket: "medapp-38667.firebasestorage.app",
    messagingSenderId: "207069580230",
    appId: "1:207069580230:web:e02dd0e16e913831cfc0c7",
    measurementId: "G-6NKLW8Y7DQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set CORS configuration
const storageRef = storage.ref();
storageRef.bucket.setCorsConfiguration([
  {
    origin: ['http://localhost:3000'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    maxAgeSeconds: 3600
  }
]);
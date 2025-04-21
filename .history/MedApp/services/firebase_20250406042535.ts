import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyACyWch0LkThsdp6HWmm9qrKJmmiupxA9M",
    authDomain: "medapp-38667.firebaseapp.com",
    projectId: "medapp-38667",
    storageBucket: "medapp-38667.firebasestorage.app",
    messagingSenderId: "207069580230",
    appId: "1:207069580230:web:e02dd0e16e913831cfc0c7",
    measurementId: "G-6NKLW8Y7DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
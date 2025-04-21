import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Optional: Configure Firebase Storage settings
storage.maxOperationRetryTime = 20000;  // 20 seconds
storage.maxUploadRetryTime = 20000;     // 20 seconds

// Storage reference
const storageRef = ref(storage);

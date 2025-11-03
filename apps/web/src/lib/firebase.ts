import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { env } from '@/lib/env';

const firebaseConfig = JSON.parse(env.VITE_FIREBASE_CONFIG);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



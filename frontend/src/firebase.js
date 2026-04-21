import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAsWl2v5nt1dernw0B1tW2sIDvTjANMF2s",
  authDomain: "leadradar-bc285.firebaseapp.com",
  databaseURL: "https://leadradar-bc285-default-rtdb.firebaseio.com",
  projectId: "leadradar-bc285",
  storageBucket: "leadradar-bc285.firebasestorage.app",
  messagingSenderId: "777170869863",
  appId: "1:777170869863:web:458ab59dbf579476907ec2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export default app;

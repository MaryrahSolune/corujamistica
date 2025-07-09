
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore, type Firestore } from 'firebase/firestore'; // Descomente se você precisar do Firestore
import { getDatabase, type Database } from 'firebase/database'; // Adicionado para Realtime Database

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Descomente se você usar o Analytics
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
// const firestoreDb: Firestore = getFirestore(app); // Descomente se você precisar do Firestore
const rtdb: Database = getDatabase(app); // Inicializa o Realtime Database

const googleProvider = new GoogleAuthProvider();
export { app, auth, rtdb, googleProvider /*, firestoreDb */ };

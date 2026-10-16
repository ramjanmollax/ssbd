import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = (dbId && dbId !== '(default)' && dbId !== '')
  ? initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, dbId)
  : initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

export default app;

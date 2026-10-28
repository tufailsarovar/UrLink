import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

const requiredConfig = ["apiKey", "authDomain", "projectId", "appId"];

const missingConfig = requiredConfig.filter(
  (key) => !firebaseConfig[key] || firebaseConfig[key].startsWith("your-"),
);

let app = null;
let auth = null;
let googleProvider = null;

if (missingConfig.length === 0) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  auth = getAuth(app);

  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
} else if (import.meta.env.DEV) {
  console.error(
    `[urlink] Missing or placeholder Firebase configuration: ${missingConfig.join(", ")}`,
  );
}

export { app, auth, googleProvider };
export default app;

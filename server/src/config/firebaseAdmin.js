
import admin from "firebase-admin";
import { env } from "./env.js";

let firebaseAdminApp = null;

export function initializeFirebaseAdmin() {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const existingApp = admin.apps.find(
    (app) => app?.name === "[DEFAULT]"
  );

  if (existingApp) {
    firebaseAdminApp = existingApp;
    return firebaseAdminApp;
  }

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = env;

  if (
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_CLIENT_EMAIL ||
    !FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      "Firebase Admin configuration is incomplete. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY,
    }),
    projectId: FIREBASE_PROJECT_ID,
  });

  return firebaseAdminApp;
}

export function getFirebaseAdminAuth() {
  const app = initializeFirebaseAdmin();
  return admin.auth(app);
}

export async function verifyFirebaseIdToken(idToken, checkRevoked = true) {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("A Firebase ID token is required.");
  }

  return getFirebaseAdminAuth().verifyIdToken(
    idToken,
    checkRevoked
  );
}

export async function createFirebaseCustomToken(uid, claims = {}) {
  if (!uid || typeof uid !== "string") {
    throw new Error("A valid Firebase user ID is required.");
  }

  return getFirebaseAdminAuth().createCustomToken(uid, claims);
}

export async function getFirebaseUserByEmail(email) {
  if (!email || typeof email !== "string") {
    throw new Error("A valid email address is required.");
  }

  return getFirebaseAdminAuth().getUserByEmail(
    email.trim().toLowerCase()
  );
}

export async function createFirebaseUser({
  email,
  displayName,
  emailVerified = false,
}) {
  if (!email || typeof email !== "string") {
    throw new Error("A valid email address is required.");
  }

  return getFirebaseAdminAuth().createUser({
    email: email.trim().toLowerCase(),
    ...(displayName ? { displayName } : {}),
    emailVerified,
    disabled: false,
  });
}

export default initializeFirebaseAdmin;

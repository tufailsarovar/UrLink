import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";

function ensureFirebaseAuth() {
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Check client/.env and restart Vite.",
    );
  }

  return auth;
}

export function subscribeToAuthChanges(callback) {
  const firebaseAuth = ensureFirebaseAuth();
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function loginWithGoogle() {
  const firebaseAuth = ensureFirebaseAuth();
  const provider = googleProvider || new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in failed:", error.code, error.message);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error(
        "The Google sign-in window was closed before sign-in completed. Please try again and select your account.",
      );
    }

    if (error.code === "auth/unauthorized-domain") {
      throw new Error(
        "This domain is not authorized in Firebase Authentication settings.",
      );
    }

    if (
      error.code === "auth/operation-not-allowed" ||
      error.code === "auth/configuration-not-found"
    ) {
      throw new Error(
        "Google sign-in is not enabled or configured correctly in Firebase Authentication.",
      );
    }

    throw error;
  }
}

export async function fetchCurrentUser(apiClient) {
  if (!apiClient) {
    throw new Error("An API client is required.");
  }

  const response = await apiClient.get("/auth/me");
  return response?.data?.user ?? response?.data?.data?.user ?? response?.data;
}

export async function logout() {
  await signOut(ensureFirebaseAuth());
}

export async function getCurrentIdToken(forceRefresh = false) {
  const currentUser = ensureFirebaseAuth().currentUser;
  return currentUser ? currentUser.getIdToken(forceRefresh) : null;
}

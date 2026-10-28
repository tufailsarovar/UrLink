import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import api from "../services/api.js";

const AuthContext = createContext(null);

const isAdminUser = (data) => {
  const profile = data?.user || data?.data?.user || data?.data || data;
  return profile?.role === "admin" || profile?.isAdmin === true;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshAdminStatus = useCallback(async () => {
    if (!auth?.currentUser) {
      setIsAdmin(false);
      return { isAdmin: false };
    }

    try {
      await auth.currentUser.getIdToken();
      const response = await api.get("/auth/me");
      const data = response?.data;
      const profile = data?.user || data?.data?.user || data?.data || data;
      const admin = isAdminUser(data);

      setUser((previous) => ({
        ...(previous || {}),
        ...(profile || {}),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
      }));
      setIsAdmin(admin);

      return { isAdmin: admin, user: profile };
    } catch (error) {
      setIsAdmin(false);
      if (error?.response?.status === 401) {
        setAuthError(
          "Your session could not be verified. Please sign in again.",
        );
      }
      return { isAdmin: false, error };
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError("");

      if (!firebaseUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });

      try {
        await firebaseUser.getIdToken(true);
        const response = await api.get("/auth/me");
        const data = response?.data;
        const profile = data?.user || data?.data?.user || data?.data || data;

        setUser((previous) => ({
          ...previous,
          ...(profile || {}),
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        }));
        setIsAdmin(isAdminUser(data));
      } catch (error) {
        setIsAdmin(false);
        if (error?.response?.status === 401) {
          setAuthError("Unable to verify your account with the server.");
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      throw new Error("Firebase Google sign-in is not configured.");
    }

    setAuthError("");
    const result = await signInWithPopup(auth, googleProvider);

    try {
      await result.user.getIdToken(true);
      const response = await api.get("/auth/me");
      const data = response?.data;
      const profile = data?.user || data?.data?.user || data?.data || data;
      const admin = isAdminUser(data);

      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        ...(profile || {}),
      });
      setIsAdmin(admin);

      return { user: result.user, profile, isAdmin: admin };
    } catch (error) {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      throw error;
    }
  }, []);

  const loginWithEmailOtp = useCallback(async (email) => {
    const response = await api.post("/auth/email-otp/send", {
      email: email.trim().toLowerCase(),
    });
    return response?.data;
  }, []);

  const verifyEmailOtp = useCallback(async (email, otp) => {
    const response = await api.post("/auth/email-otp/verify", {
      email: email.trim().toLowerCase(),
      otp: String(otp).trim(),
    });

    const customToken =
      response?.data?.customToken || response?.data?.data?.customToken;

    if (!customToken) {
      throw new Error("The server did not return a Firebase custom token.");
    }

    const { signInWithCustomToken } = await import("firebase/auth");
    const result = await signInWithCustomToken(auth, customToken);
    await result.user.getIdToken(true);

    const profileResponse = await api.get("/auth/me");
    const data = profileResponse?.data;
    const profile = data?.user || data?.data?.user || data?.data || data;
    const admin = isAdminUser(data);

    setUser({
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified,
      ...(profile || {}),
    });
    setIsAdmin(admin);

    return { user: result.user, profile, isAdmin: admin };
  }, []);

  const logout = useCallback(async () => {
    if (auth?.currentUser) await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    setAuthError("");
  }, []);

  const getIdToken = useCallback(async () => {
    if (!auth?.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      authError,
      loginWithGoogle,
      loginWithEmailOtp,
      verifyEmailOtp,
      refreshAdminStatus,
      logout,
      getIdToken,
    }),
    [
      user,
      isAdmin,
      loading,
      authError,
      loginWithGoogle,
      loginWithEmailOtp,
      verifyEmailOtp,
      refreshAdminStatus,
      logout,
      getIdToken,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}

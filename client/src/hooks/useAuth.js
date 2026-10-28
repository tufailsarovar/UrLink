import { useAuth as useAuthContext } from "../context/AuthContext.jsx";

export default function useAuth() {
  const auth = useAuthContext();

  return {
    user: auth.user,
    loading: auth.loading,
    authError: auth.authError,
    isAuthenticated: Boolean(auth.user),
    isAdmin: Boolean(auth.isAdmin),
    loginWithGoogle: auth.loginWithGoogle,
    loginWithEmailOtp: auth.loginWithEmailOtp,
    verifyEmailOtp: auth.verifyEmailOtp,
    logout: auth.logout,
    getIdToken: auth.getIdToken,
    refreshAdminStatus: auth.refreshAdminStatus,
  };
}

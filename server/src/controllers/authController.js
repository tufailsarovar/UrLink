
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

function serializeUser(user) {
  return {
    id: user._id.toString(),
    firebaseUid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    isAdmin: user.role === "admin",
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

/**
 * GET /api/auth/me
 * Requires verifyFirebaseToken middleware.
 *
 * The middleware verifies the Firebase ID token and synchronizes the
 * authenticated account with MongoDB before this controller runs.
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user?.firebaseUid) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const user = await User.findOne({
    firebaseUid: req.user.firebaseUid,
  });

  if (!user || !user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is unavailable.",
    });
  }

  return res.status(200).json({
    success: true,
    user: serializeUser(user),
  });
});

/**
 * POST /api/auth/logout
 * Firebase client sign-out remains the client's responsibility.
 * This endpoint confirms the authenticated session reached the server.
 */
export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout request received. Sign out through Firebase on the client.",
  });
});

/**
 * GET /api/auth/admin-status
 * Requires verifyFirebaseToken middleware.
 */
export const getAdminStatus = asyncHandler(async (req, res) => {
  if (!req.user?.firebaseUid) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const user = await User.findOne({
    firebaseUid: req.user.firebaseUid,
  }).select("role isActive email");

  if (!user || !user.isActive) {
    return res.status(403).json({
      success: false,
      message: "Your account is unavailable.",
    });
  }

  return res.status(200).json({
    success: true,
    isAdmin: user.role === "admin",
    role: user.role,
  });
});


import { Router } from "express";
import {
  getAdminStatus,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import { authLimiter, emailOtpLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/me", verifyFirebaseToken, getCurrentUser);
router.get("/admin-status", verifyFirebaseToken, getAdminStatus);
router.post("/logout", authLimiter, verifyFirebaseToken, logout);

// Email OTP endpoints are not implemented yet.
// Do not expose fake endpoints that appear to send codes.
router.post("/email-otp/send", emailOtpLimiter, (_req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Email verification is not configured on the server yet.",
  });
});

router.post("/email-otp/verify", emailOtpLimiter, (_req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Email verification is not configured on the server yet.",
  });
});

export default router;

import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export default async function verifyFirebaseToken(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(
      token,
      true,
    );

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email?.trim().toLowerCase();

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "A verified account email is required.",
      });
    }

    // First look up the existing Firebase account.
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Reuse an existing account with the same email, if present.
      user = await User.findOne({ email });

      if (user) {
        // Link the existing record to this Firebase UID.
        // Never overwrite the existing role.
        user.firebaseUid = firebaseUid;
        user.email = email;
        user.displayName ||= decodedToken.name || "";
        user.photoURL ||= decodedToken.picture || "";
        user.lastLoginAt = new Date();
        await user.save();
      } else {
        // Create a record only when no matching account exists.
        user = await User.create({
          firebaseUid,
          email,
          displayName: decodedToken.name || "",
          photoURL: decodedToken.picture || "",
          role: "user",
          isActive: true,
          lastLoginAt: new Date(),
        });
      }
    } else {
      user.lastLoginAt = new Date();
      if (email) user.email = email;
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled.",
      });
    }

    req.user = {
      id: user._id.toString(),
      firebaseUid,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "admin",
      emailVerified: decodedToken.email_verified === true,
    };

    return next();
  } catch (error) {
    console.error("Firebase authentication failed:", error.message);

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

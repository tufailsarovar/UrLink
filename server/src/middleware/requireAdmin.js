
export default function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.isActive === false) {
    return res.status(403).json({
      success: false,
      message: "Your account has been disabled.",
    });
  }

  if (req.user.role !== "admin" && req.user.isAdmin !== true) {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  return next();
}

import mongoose from "mongoose";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
  );
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "all");

  const filter = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { email: { $regex: escaped, $options: "i" } },
      { displayName: { $regex: escaped, $options: "i" } },
    ];
  }

  if (status === "active") filter.isActive = true;
  if (status === "disabled") filter.isActive = false;
  if (status === "admin") filter.role = "admin";
  if (status === "user") filter.role = "user";

  const [users, total, totalUsers, activeUsers, adminUsers] =
    await Promise.all([
      User.find(filter)
        .select(
          "firebaseUid email displayName photoURL role isActive createdAt lastLoginAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
    ]);

  return res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      disabledUsers: totalUsers - activeUsers,
      adminUsers,
    },
    users: users.map((user) => ({
      ...user,
      id: user._id.toString(),
      _id: undefined,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, role } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID.",
    });
  }

  if (
    typeof isActive !== "boolean" &&
    !["user", "admin"].includes(role)
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid account status or role.",
    });
  }

  if (role !== undefined && !["user", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role.",
    });
  }

  const target = await User.findById(id);

  if (!target) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const currentAdmin = await User.findOne({
    firebaseUid: req.user.firebaseUid,
  });

  if (!currentAdmin || currentAdmin.role !== "admin" || !currentAdmin.isActive) {
    return res.status(403).json({
      success: false,
      message: "Administrator access is required.",
    });
  }

  const isSelf = target.firebaseUid === currentAdmin.firebaseUid;

  if (isSelf && (isActive === false || role === "user")) {
    return res.status(400).json({
      success: false,
      message: "You cannot disable your own account or remove your own admin role.",
    });
  }

  // Prevent accidentally removing the last active administrator.
  if (
    target.role === "admin" &&
    target.isActive &&
    (isActive === false || role === "user")
  ) {
    const activeAdmins = await User.countDocuments({
      role: "admin",
      isActive: true,
    });

    if (activeAdmins <= 1) {
      return res.status(400).json({
        success: false,
        message: "The last active administrator cannot be disabled or demoted.",
      });
    }
  }

  if (typeof isActive === "boolean") target.isActive = isActive;
  if (role !== undefined) target.role = role;

  await target.save();

  return res.json({
    success: true,
    message: "User account updated successfully.",
    user: {
      id: target._id.toString(),
      email: target.email,
      displayName: target.displayName,
      role: target.role,
      isActive: target.isActive,
      createdAt: target.createdAt,
      lastLoginAt: target.lastLoginAt,
    },
  });
});
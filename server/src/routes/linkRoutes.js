
import { Router } from "express";
import {
  createLink,
  deleteLink,
  getLinkById,
  getLinks,
  incrementLinkClick,
  updateLink,
} from "../controllers/linkController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  apiLimiter,
  writeLimiter,
} from "../middleware/rateLimiter.js";

const router = Router();

// Public resource browsing.
router.get("/", apiLimiter, getLinks);

// Public click tracking.
router.post("/:id/click", apiLimiter, incrementLinkClick);

// Individual resource lookup.
router.get("/:id", apiLimiter, getLinkById);

// Admin-only resource management.
router.post(
  "/",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  createLink
);

router.patch(
  "/:id",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  updateLink
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  deleteLink
);

export default router;

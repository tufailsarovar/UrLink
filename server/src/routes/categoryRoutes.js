
import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  reassignCategoryLinks,
} from "../controllers/categoryController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public: list active categories.
router.get("/", getCategories);

router.get(
  "/admin",
  verifyFirebaseToken,
  requireAdmin,
  getCategories
);


router.patch(
  "/:id/reassign-links",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  reassignCategoryLinks
);


// Public: get an individual active category.
router.get("/:id", getCategoryById);

// Admin-only category management.
router.post(
  "/",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  createCategory
);

router.patch(
  "/:id",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  updateCategory
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  requireAdmin,
  writeLimiter,
  deleteCategory
);

export default router;

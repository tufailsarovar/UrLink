import { Router } from "express";
import {
  getAdminUsers,
  updateAdminUser,
} from "../controllers/userController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(verifyFirebaseToken, requireAdmin);

router.get("/", getAdminUsers);
router.patch("/:id", writeLimiter, updateAdminUser);

export default router;
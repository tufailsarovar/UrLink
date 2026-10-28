
import { Router } from "express";
import {
  exportCategories,
  exportLinks,
} from "../controllers/exportController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";
import requireAdmin from "../middleware/requireAdmin.js";
import { exportLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(verifyFirebaseToken, requireAdmin, exportLimiter);

router.get("/links", exportLinks);
router.get("/categories", exportCategories);

export default router;

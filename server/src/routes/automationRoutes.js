
import { Router } from "express";
import {
  receiveWhatsAppMessage,
  verifyWhatsAppWebhook,
} from "../controllers/automationController.js";
import {
  webhookLimiter,
} from "../middleware/rateLimiter.js";

const router = Router();

// Meta WhatsApp webhook verification (GET).
router.get("/", verifyWhatsAppWebhook);

// Incoming WhatsApp messages (POST).
router.post(
  "/whatsapp",
  webhookLimiter,
  receiveWhatsAppMessage
);

export default router;

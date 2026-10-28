
import crypto from "node:crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Link from "../models/Link.js";
import Category from "../models/Category.js";

const MAX_MESSAGE_LENGTH = 20000;

function safeCompare(left, right) {
  if (!left || !right) return false;

  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) return null;

    return url.toString();
  } catch {
    return null;
  }
}

function extractUrl(message) {
  const match = String(message || "").match(/https?:\/\/[^\s<>"']+/i);
  if (!match) return null;

  return normalizeUrl(match[0].replace(/[),.!?;:]+$/g, ""));
}

function extractTitle(message, url) {
  const lines = String(message || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidate = lines.find(
    (line) =>
      line !== url &&
      !/^https?:\/\//i.test(line) &&
      !/^(link|url|title)\s*:/i.test(line)
  );

  return (candidate || new URL(url).hostname)
    .replace(/^(title|name)\s*:\s*/i, "")
    .slice(0, 160)
    .trim();
}

/**
 * Verify the GET webhook challenge used by Meta WhatsApp Cloud API.
 */
export const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    expectedToken &&
    safeCompare(token, expectedToken) &&
    typeof challenge === "string"
  ) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({
    success: false,
    message: "WhatsApp webhook verification failed.",
  });
};

export const receiveWhatsAppMessage = asyncHandler(async (req, res) => {
  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const suppliedSecret =
    req.get("x-urlink-webhook-secret") ||
    req.get("x-webhook-secret") ||
    "";

  if (!expectedSecret || !safeCompare(suppliedSecret, expectedSecret)) {
    return res.status(401).json({
      success: false,
      message: "Webhook authentication failed.",
    });
  }

  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must contain 1–${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  const url = extractUrl(message);

  if (!url) {
    return res.status(422).json({
      success: false,
      message: "No valid HTTP or HTTPS URL was found in the message.",
    });
  }

  const existing = await Link.findOne({
    url: { $regex: `^${escapeRegex(url)}$`, $options: "i" },
  }).select("_id title status");

  if (existing) {
    return res.status(200).json({
      success: true,
      duplicate: true,
      message: "This resource already exists.",
      resource: {
        id: existing._id,
        title: existing.title,
        status: existing.status,
      },
    });
  }

  const requestedCategory =
    typeof req.body?.category === "string"
      ? req.body.category.trim()
      : "";

  let category = null;

  if (requestedCategory) {
    const escapedCategory = escapeRegex(requestedCategory);

    category = await Category.findOne({
      isActive: true,
      $or: [
        { slug: requestedCategory.toLowerCase() },
        { name: { $regex: `^${escapedCategory}$`, $options: "i" } },
      ],
    }).select("_id");
  }

  if (!category) {
    category = await Category.findOne({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select("_id");
  }

  if (!category) {
    return res.status(422).json({
      success: false,
      message: "Create an active category before importing resources.",
    });
  }

  const title = extractTitle(message, url);
  const description = message.replace(url, "").trim().slice(0, 2000);
  const autoPublish = process.env.WHATSAPP_AUTO_PUBLISH === "true";

  const resource = await Link.create({
    title,
    url,
    description,
    category: category._id,
    status: autoPublish ? "published" : "draft",
    publishedAt: autoPublish ? new Date() : null,
    createdBy: "whatsapp-webhook",
    updatedBy: "whatsapp-webhook",
  });

  return res.status(201).json({
    success: true,
    duplicate: false,
    message: autoPublish
      ? "Resource imported and published."
      : "Resource imported as a draft for administrator review.",
    resource: {
      id: resource._id,
      title: resource.title,
      url: resource.url,
      status: resource.status,
    },
  });
});

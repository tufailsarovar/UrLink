
import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = [
  "MONGODB_URI",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

export function validateEnv() {
  const missing = requiredInProduction.filter(
    (key) => !process.env[key]?.trim()
  );

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number.parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  MONGODB_URI: process.env.MONGODB_URI || "",

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  ),

  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),

  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER || "none",
  WHATSAPP_WEBHOOK_SECRET: process.env.WHATSAPP_WEBHOOK_SECRET || "",

  LOG_LEVEL: process.env.LOG_LEVEL || "info",
});

if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65535) {
  throw new Error("PORT must be a valid port number between 1 and 65535.");
}

validateEnv();

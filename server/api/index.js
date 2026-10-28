
import app from "../src/app.js";
import { connectDatabase } from "../src/config/database.js";
import { initializeFirebaseAdmin } from "../src/config/firebaseAdmin.js";

let initializationPromise;

async function initialize() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      initializeFirebaseAdmin();
      await connectDatabase();
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export default async function handler(req, res) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error("[serverless] Initialization failed:", error.message);

    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
    });
  }
}

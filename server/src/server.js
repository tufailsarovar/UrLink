
import app from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { initializeFirebaseAdmin } from "./config/firebaseAdmin.js";
import { env } from "./config/env.js";

let server;
let shuttingDown = false;

async function startServer() {
  try {
    initializeFirebaseAdmin();
    await connectDatabase();

    server = app.listen(env.PORT, "0.0.0.0", () => {
      console.info(
        `[server] urlink API listening on port ${env.PORT} (${env.NODE_ENV})`
      );
    });

    server.on("error", (error) => {
      console.error("[server] HTTP server error:", error.message);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("[server] Startup failed:", error.message);
    process.exitCode = 1;
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.info(`[server] ${signal} received; shutting down gracefully.`);

  const forceExitTimer = setTimeout(() => {
    console.error("[server] Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);

  forceExitTimer.unref();

  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    await disconnectDatabase();
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    console.error("[server] Shutdown failed:", error.message);
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("[server] Unhandled promise rejection:", error);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("[server] Uncaught exception:", error);
  process.exit(1);
});

await startServer();

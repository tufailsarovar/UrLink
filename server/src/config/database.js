
import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from the server environment.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        autoIndex: env.NODE_ENV !== "production",
      })
      .then((connection) => {
        console.info(
          `[database] Connected to MongoDB database: ${
            connection.connection.name || "default"
          }`
        );

        return connection.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        console.error("[database] MongoDB connection failed:", error.message);
        throw error;
      });
  }

  return connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = null;

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.info("[database] Disconnected from MongoDB.");
  }
}

mongoose.connection.on("disconnected", () => {
  connectionPromise = null;
  console.warn("[database] MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("[database] MongoDB error:", error.message);
});

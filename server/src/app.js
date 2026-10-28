
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import linkRoutes from "./routes/linkRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import automationRoutes from "./routes/automationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import apiLimiter from "./middleware/rateLimiter.js";
import {
  notFoundHandler,
  default as errorHandler,
} from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "urlink-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/automation", automationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

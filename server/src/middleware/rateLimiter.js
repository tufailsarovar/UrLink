
import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

function createLimiter({
  windowMs = 15 * 60 * 1000,
  limit = 100,
  message = "Too many requests. Please try again later.",
} = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
    skipSuccessfulRequests: false,
    handler(req, res, next, options) {
      res.setHeader(
        "Retry-After",
        String(Math.ceil(options.windowMs / 1000))
      );

      return res.status(options.statusCode).json(options.message);
    },
  });
}

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 200 : 1000,
  message: "Too many API requests. Please wait before trying again.",
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const emailOtpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: "Too many email verification requests. Please try again later.",
});

export const writeLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  message: "Too many changes submitted. Please wait before trying again.",
});

export const exportLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  message: "Too many export requests. Please try again shortly.",
});

export const webhookLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: isProduction ? 60 : 300,
  message: "Too many webhook requests. Please try again shortly.",
});

export default apiLimiter;

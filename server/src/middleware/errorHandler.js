
import { ZodError } from "zod";
import mongoose from "mongoose";

export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = Number(err.statusCode || err.status || 500);
  let message = err.message || "An unexpected server error occurred.";
  let details;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed.";
    details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "The submitted data is invalid.";
    details = Object.values(err.errors).map((issue) => ({
      field: issue.path,
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "An invalid resource identifier was provided.";
  } else if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `A record with this ${field} already exists.`
      : "A record with these details already exists.";
  } else if (err?.type === "entity.too.large" || err?.status === 413) {
    statusCode = 413;
    message = "The submitted request is too large.";
  } else if (err?.type === "entity.parse.failed") {
    statusCode = 400;
    message = "The request contains invalid JSON.";
  }

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error("[server-error]", {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack:
        process.env.NODE_ENV === "development"
          ? err.stack
          : undefined,
    });

    message =
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred."
        : message;
  }

  const response = {
    success: false,
    message,
  };

  if (details?.length) {
    response.errors = details;
  }

  if (process.env.NODE_ENV === "development" && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

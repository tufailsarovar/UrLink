
import mongoose from "mongoose";

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900,
    },
  },
  { versionKey: false }
);

emailOtpSchema.index({ email: 1, createdAt: -1 });

const EmailOtp =
  mongoose.models.EmailOtp ||
  mongoose.model("EmailOtp", emailOtpSchema);

export default EmailOtp;

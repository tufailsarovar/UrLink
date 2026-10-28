
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import EmailOtp from "../models/EmailOtp.js";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

let transporter;

function getTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASSWORD,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error("Email delivery is not configured on the server.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

function hashCode(email, code) {
  return crypto
    .createHmac("sha256", process.env.OTP_HASH_SECRET)
    .update(`${email}:${code}`)
    .digest("hex");
}

export async function sendEmailOtp(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!process.env.OTP_HASH_SECRET || process.env.OTP_HASH_SECRET.length < 32) {
    throw new Error("OTP_HASH_SECRET must contain at least 32 characters.");
  }

  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = new Date();

  await EmailOtp.deleteMany({
    email: normalizedEmail,
  });

  await EmailOtp.create({
    email: normalizedEmail,
    codeHash: hashCode(normalizedEmail, code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    createdAt: now,
  });

  try {
    await getTransporter().then((mail) =>
      mail.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: normalizedEmail,
        subject: "Your urlink sign-in code",
        text: `Your urlink verification code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`,
      })
    );
  } catch (error) {
    await EmailOtp.deleteMany({ email: normalizedEmail });
    throw error;
  }
}

export async function verifyEmailOtp(email, code) {
  const normalizedEmail = email.trim().toLowerCase();

  const otp = await EmailOtp.findOne({
    email: normalizedEmail,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  })
    .select("+codeHash")
    .sort({ createdAt: -1 });

  if (!otp || otp.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  otp.attempts += 1;

  const expected = Buffer.from(otp.codeHash, "hex");
  const supplied = Buffer.from(hashCode(normalizedEmail, code), "hex");

  const valid =
    expected.length === supplied.length &&
    crypto.timingSafeEqual(expected, supplied);

  if (!valid) {
    if (otp.attempts >= MAX_ATTEMPTS) {
      await EmailOtp.deleteOne({ _id: otp._id });
    } else {
      await otp.save();
    }

    return false;
  }

  otp.consumedAt = new Date();
  await otp.save();
  await EmailOtp.deleteOne({ _id: otp._id });

  return true;
}


import logger from "../utils/logger.js";

function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  };
}

let transporterPromise;

async function getTransporter() {
  const config = getEmailConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    return null;
  }

  if (!transporterPromise) {
    transporterPromise = import("nodemailer").then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
      })
    );
  }

  return transporterPromise;
}

/**
 * Send an email notification.
 * Returns false when email delivery is not configured or fails.
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Recipient, subject, and message content are required.");
  }

  try {
    const transporter = await getTransporter();

    if (!transporter) {
      logger.warn("Email notification skipped: SMTP is not configured.");
      return false;
    }

    const config = getEmailConfig();

    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    });

    return true;
  } catch (error) {
    logger.error("Email notification failed:", error.message);
    return false;
  }
}

/**
 * Notify an administrator about a newly submitted resource.
 */
export async function notifyAdminNewLink(link) {
  const adminEmail = process.env.NOTIFICATION_ADMIN_EMAIL;

  if (!adminEmail) {
    logger.warn("Admin notification skipped: NOTIFICATION_ADMIN_EMAIL is unset.");
    return false;
  }

  const title = String(link?.title || "Untitled resource");
  const url = String(link?.url || "");

  return sendEmail({
    to: adminEmail,
    subject: `urlink: New resource submitted — ${title}`,
    text: `A new resource was submitted to urlink.\n\nTitle: ${title}\nURL: ${url}`,
  });
}

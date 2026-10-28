
const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || "v22.0";

function getConfig() {
  return {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
  };
}

export function verifyWebhookToken(mode, token) {
  const config = getConfig();

  return (
    mode === "subscribe" &&
    Boolean(config.verifyToken) &&
    typeof token === "string" &&
    token === config.verifyToken
  );
}

export async function sendWhatsAppText(to, message) {
  const config = getConfig();

  if (!config.accessToken || !config.phoneNumberId) {
    throw new Error(
      "WhatsApp is not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID."
    );
  }

  if (!to || !message) {
    throw new Error("A recipient and message are required.");
  }

  const endpoint =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/` +
    `${config.phoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: String(to).replace(/[^\d]/g, ""),
      type: "text",
      text: {
        preview_url: true,
        body: String(message).slice(0, 4096),
      },
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result?.error?.message || `WhatsApp API request failed (${response.status}).`
    );
  }

  return result;
}

export default {
  verifyWebhookToken,
  sendWhatsAppText,
};

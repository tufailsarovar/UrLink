
const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

function cleanUrl(value) {
  return value.replace(/[),.!?;:]+$/, "");
}

export function extractUrls(message = "") {
  if (typeof message !== "string" || !message.trim()) {
    return [];
  }

  const matches = message.match(URL_REGEX) || [];

  return [
    ...new Set(
      matches
        .map(cleanUrl)
        .filter((url) => {
          try {
            const parsed = new URL(url);
            return ["http:", "https:"].includes(parsed.protocol);
          } catch {
            return false;
          }
        })
    ),
  ];
}

export function parseResourceMessage(message = "") {
  if (typeof message !== "string" || !message.trim()) {
    return {
      text: "",
      urls: [],
      title: "",
      description: "",
    };
  }

  const urls = extractUrls(message);

  const textWithoutUrls = message
    .replace(URL_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

  let title = "";
  let description = textWithoutUrls;

  const titleMatch = textWithoutUrls.match(
    /(?:title|name)\s*:\s*(.+?)(?=\s+(?:description|desc)\s*:|$)/i
  );

  const descriptionMatch = textWithoutUrls.match(
    /(?:description|desc)\s*:\s*(.+)$/i
  );

  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
  }

  if (!title && textWithoutUrls) {
    title = textWithoutUrls
      .replace(/(?:description|desc)\s*:\s*.+$/i, "")
      .trim()
      .slice(0, 160);
  }

  return {
    text: message.trim(),
    urls,
    title,
    description,
  };
}

export default {
  extractUrls,
  parseResourceMessage,
};

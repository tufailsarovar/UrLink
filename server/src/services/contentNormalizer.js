
const MAX_TITLE_LENGTH = 160;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 40;

export function normalizeTitle(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
}

export function normalizeDescription(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, MAX_DESCRIPTION_LENGTH);
}

export function normalizeHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    if (!url.hostname || url.username || url.password) {
      return null;
    }

    url.hostname = url.hostname.toLowerCase();

    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeCategory(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 100);
}

export function normalizeTags(values) {
  if (!Array.isArray(values)) return [];

  const uniqueTags = new Set();

  for (const value of values) {
    if (typeof value !== "string") continue;

    const tag = value
      .normalize("NFKC")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .slice(0, MAX_TAG_LENGTH);

    if (tag) uniqueTags.add(tag);

    if (uniqueTags.size >= MAX_TAGS) break;
  }

  return [...uniqueTags];
}

export function normalizeResource(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Resource data must be an object.");
  }

  const url = normalizeHttpUrl(input.url);

  if (!url) {
    throw new TypeError("A valid HTTP or HTTPS resource URL is required.");
  }

  const title = normalizeTitle(input.title);

  if (title.length < 2) {
    throw new TypeError("Resource title must contain at least 2 characters.");
  }

  const result = {
    title,
    url,
    description: normalizeDescription(input.description),
    category: normalizeCategory(input.category),
    companyName:
      typeof input.companyName === "string"
        ? input.companyName.trim().slice(0, 160)
        : "",
    location:
      typeof input.location === "string"
        ? input.location.trim().slice(0, 160)
        : "",
    tags: normalizeTags(input.tags),
  };

  return result;
}

export default {
  normalizeTitle,
  normalizeDescription,
  normalizeHttpUrl,
  normalizeCategory,
  normalizeTags,
  normalizeResource,
};


import Link from "../models/Link.js";

function normalizeUrl(value) {
  try {
    const url = new URL(String(value).trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hostname = url.hostname.toLowerCase();
    url.hash = "";

    if (url.pathname.length > 1) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }

    return url.toString();
  } catch {
    return null;
  }
}

export async function findDuplicateUrl(url, { excludeId } = {}) {
  const normalized = normalizeUrl(url);

  if (!normalized) {
    throw new Error("A valid HTTP or HTTPS URL is required.");
  }

  const filter = {};

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const candidates = await Link.find(filter)
    .select("_id title url status")
    .lean();

  const duplicate = candidates.find(
    (candidate) => normalizeUrl(candidate.url) === normalized
  );

  return duplicate || null;
}

export async function findDuplicateUrls(urls = []) {
  if (!Array.isArray(urls)) {
    throw new TypeError("urls must be an array.");
  }

  const normalizedInputs = urls.map((url) => normalizeUrl(url));

  const existingLinks = await Link.find({})
    .select("_id title url status")
    .lean();

  const existingByUrl = new Map();

  for (const link of existingLinks) {
    const normalized = normalizeUrl(link.url);

    if (normalized && !existingByUrl.has(normalized)) {
      existingByUrl.set(normalized, link);
    }
  }

  const seenInBatch = new Set();

  return normalizedInputs.map((normalized, index) => {
    if (!normalized) {
      return {
        index,
        url: urls[index],
        duplicate: false,
        invalid: true,
        existing: null,
      };
    }

    if (seenInBatch.has(normalized)) {
      return {
        index,
        url: urls[index],
        duplicate: true,
        invalid: false,
        existing: null,
        reason: "duplicate_in_batch",
      };
    }

    seenInBatch.add(normalized);

    const existing = existingByUrl.get(normalized);

    return {
      index,
      url: urls[index],
      duplicate: Boolean(existing),
      invalid: false,
      existing: existing
        ? {
            id: existing._id,
            title: existing.title,
            status: existing.status,
          }
        : null,
      reason: existing ? "already_exists" : null,
    };
  });
}

export default {
  findDuplicateUrl,
  findDuplicateUrls,
};


import Link from "../models/Link.js";
import Category from "../models/Category.js";

/**
 * Normalize and validate a resource before saving.
 */
export async function prepareLinkData(input, userId) {
  const title = String(input.title || "").trim();
  const url = String(input.url || "").trim();
  const description = String(input.description || "").trim();

  if (!title) {
    throw new Error("Resource title is required.");
  }

  if (!url) {
    throw new Error("Resource URL is required.");
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Enter a valid resource URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  const categoryId = String(input.category || input.categoryId || "").trim();

  if (!categoryId) {
    throw new Error("A category is required.");
  }

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  }).lean();

  if (!category) {
    throw new Error("The selected category does not exist or is inactive.");
  }

  return {
    title,
    url: parsedUrl.toString(),
    description,
    category: category._id,
    createdBy: userId,
    ...(input.status === "draft" ? { status: "draft" } : {}),
    ...(typeof input.isFeatured === "boolean"
      ? { isFeatured: input.isFeatured }
      : {}),
  };
}

/**
 * Find a resource by URL, ignoring URL fragments and trailing slashes.
 */
export async function findDuplicateLink(url, excludeId = null) {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) return null;

  const links = await Link.find(
    excludeId ? { _id: { $ne: excludeId } } : {}
  )
    .select("_id title url")
    .lean();

  return (
    links.find((link) => normalizeUrl(link.url) === normalizedUrl) || null
  );
}

function normalizeUrl(value) {
  try {
    const parsed = new URL(String(value).trim());
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();

    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

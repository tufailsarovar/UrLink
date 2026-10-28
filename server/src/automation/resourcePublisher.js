
import Link from "../../models/Link.js";
import Category from "../../models/Category.js";
import { findDuplicateLink } from "../linkService.js";
import { parseResourceMessage } from "./messageParser.js";
import { extractHiringDetails } from "./hiringExtractor.js";

function resolveCategoryId(category) {
  return category?._id || category?.id || null;
}

/**
 * Publish a resource from a message after validating its URL and category.
 * The category must already exist and be active in the database.
 */
export async function publishResourceFromMessage({
  message,
  categoryId,
  createdBy,
  allowHiring = true,
}) {
  if (!createdBy) {
    throw new Error("A creator ID is required to publish a resource.");
  }

  const parsed = parseResourceMessage(message);
  const url = parsed.urls[0];

  if (!url) {
    throw new Error("The message must contain a valid HTTP or HTTPS URL.");
  }

  const duplicate = await findDuplicateLink(url);

  if (duplicate) {
    return {
      created: false,
      reason: "duplicate",
      resource: duplicate,
    };
  }

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  });

  if (!category) {
    throw new Error("An active category must be selected before publishing.");
  }

  const hiring = allowHiring
    ? extractHiringDetails(message)
    : { isHiring: false };

  const resource = await Link.create({
    title: parsed.title || hiring.title || url,
    url,
    description: parsed.description || String(message).slice(0, 10000),
    category: resolveCategoryId(category),
    createdBy,
    status: "published",
    publishedAt: new Date(),
  });

  return {
    created: true,
    reason: "published",
    resource,
    isHiring: Boolean(hiring.isHiring),
  };
}

export default { publishResourceFromMessage };

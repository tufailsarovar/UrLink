
import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048, "URL cannot exceed 2048 characters.")
  .url("Enter a valid URL.")
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      );
    } catch {
      return false;
    }
  }, "Only HTTP and HTTPS URLs are allowed.");

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} cannot exceed ${max} characters.`)
    .optional()
    .default("");

export const createLinkSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must contain at least 2 characters.")
      .max(160, "Title cannot exceed 160 characters."),

    url: httpUrlSchema,

    description: optionalText(2000, "Description"),

    category: z
      .string()
      .trim()
      .min(1, "Category is required.")
      .max(100, "Category identifier is invalid."),

    companyName: optionalText(160, "Company name"),

    location: optionalText(160, "Location"),

    // Optional resource logo uploaded to Cloudinary.
    logoUrl: z
      .union([httpUrlSchema, z.literal("")])
      .optional()
      .default(""),

    status: z.enum(["published", "draft", "archived"]).optional(),

    isFeatured: z.boolean().optional(),

    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Tags cannot be empty.")
          .max(40, "Each tag cannot exceed 40 characters.")
      )
      .max(20, "A maximum of 20 tags is allowed.")
      .optional(),
  })
  .strict();

export const updateLinkSchema = createLinkSchema
  .partial()
  .extend({
    title: createLinkSchema.shape.title.optional(),
    url: createLinkSchema.shape.url.optional(),
    category: createLinkSchema.shape.category.optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update."
  );

export function validateCreateLink(input) {
  return createLinkSchema.parse(input);
}

export function validateUpdateLink(input) {
  return updateLinkSchema.parse(input);
}

export default {
  createLinkSchema,
  updateLinkSchema,
  validateCreateLink,
  validateUpdateLink,
};

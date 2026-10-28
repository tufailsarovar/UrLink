
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Link from "../models/Link.js";
import asyncHandler from "../utils/asyncHandler.js";

const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const categoryPayload = (body) => {
  const payload = {};

  if (body.name !== undefined) {
    payload.name = String(body.name).trim();
  }

  if (body.description !== undefined) {
    payload.description = String(body.description).trim();
  }

  if (body.imageUrl !== undefined) {
    payload.imageUrl = String(body.imageUrl || "").trim();
  }

  if (body.slug !== undefined || body.name !== undefined) {
    payload.slug = slugify(body.slug || body.name);
  }

  if (body.isActive !== undefined) {
    payload.isActive = body.isActive;
  }

  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      const error = new Error(
        "sortOrder must be a non-negative integer."
      );
      error.statusCode = 400;
      throw error;
    }

    payload.sortOrder = sortOrder;
  }

  return payload;
};

export const getCategories = asyncHandler(async (req, res) => {
  const includeInactive =
    req.user?.role === "admin" &&
    String(req.query.includeInactive) === "true";

  const filter = includeInactive ? {} : { isActive: true };

  const categories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const filter = mongoose.isValidObjectId(id)
    ? { _id: id }
    : { slug: slugify(id) };

  const category = await Category.findOne(filter).lean();

  if (!category || (!category.isActive && req.user?.role !== "admin")) {
    return res.status(404).json({
      success: false,
      message: "Category not found.",
    });
  }

  return res.status(200).json({
    success: true,
    category,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const payload = categoryPayload(req.body);

  if (!payload.name || payload.name.length < 2 || payload.name.length > 80) {
    return res.status(400).json({
      success: false,
      message: "Category name must contain between 2 and 80 characters.",
    });
  }

  if (!payload.slug) {
    return res.status(400).json({
      success: false,
      message: "A valid category slug is required.",
    });
  }

  payload.createdBy = req.user.firebaseUid;
  payload.updatedBy = req.user.firebaseUid;

  const category = await Category.create(payload);

  return res.status(201).json({
    success: true,
    message: "Category created successfully.",
    category,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID.",
    });
  }

  const payload = categoryPayload(req.body);

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update.",
    });
  }

  if (
    payload.name !== undefined &&
    (payload.name.length < 2 || payload.name.length > 80)
  ) {
    return res.status(400).json({
      success: false,
      message: "Category name must contain between 2 and 80 characters.",
    });
  }

  if (payload.slug !== undefined && !payload.slug) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid category slug.",
    });
  }

  payload.updatedBy = req.user.firebaseUid;

  const category = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    category,
  });
});

// Reassign all links from one category to another.
export const reassignCategoryLinks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newCategoryId } = req.body;

  if (
    !mongoose.isValidObjectId(id) ||
    !mongoose.isValidObjectId(newCategoryId)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid source or replacement category ID.",
    });
  }

  if (String(id) === String(newCategoryId)) {
    return res.status(400).json({
      success: false,
      message: "Choose a different replacement category.",
    });
  }

  const [sourceCategory, replacementCategory] = await Promise.all([
    Category.findById(id),
    Category.findOne({
      _id: newCategoryId,
      isActive: true,
    }),
  ]);

  if (!sourceCategory) {
    return res.status(404).json({
      success: false,
      message: "Category to reassign was not found.",
    });
  }

  if (!replacementCategory) {
    return res.status(404).json({
      success: false,
      message: "Replacement category not found or inactive.",
    });
  }

  const result = await Link.updateMany(
    { category: sourceCategory._id },
    {
      $set: {
        category: replacementCategory._id,
        updatedBy: req.user.firebaseUid,
      },
    }
  );

  return res.status(200).json({
    success: true,
    message: "Links reassigned successfully.",
    reassignedCount: result.modifiedCount,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID.",
    });
  }

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found.",
    });
  }

  // Keep the safety check: never delete a category that still has links.
  const linkedResources = await Link.exists({
    category: category._id,
  });

  if (linkedResources) {
    return res.status(409).json({
      success: false,
      message:
        "This category is assigned to resources. Reassign those resources before deleting it.",
    });
  }

  await category.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully.",
  });
});

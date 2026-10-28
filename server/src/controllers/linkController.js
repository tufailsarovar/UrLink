import mongoose from "mongoose";
import Link from "../models/Link.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validateCreateLink,
  validateUpdateLink,
} from "../validators/linkValidator.js";
import { deleteResourceLogo } from "../utils/cloudinary.js";

const isAdmin = (req) =>
  req.user?.role === "admin" || req.user?.isAdmin === true;

const parsePositiveInteger = (value, fallback, maximum) => {
  const number = Number.parseInt(value, 10);

  if (!Number.isSafeInteger(number) || number < 1) return fallback;

  return Math.min(number, maximum);
};

const getCategoryFilter = async (categoryValue) => {
  if (!categoryValue) return null;

  if (mongoose.isValidObjectId(categoryValue)) {
    const category = await Category.findById(categoryValue).select("_id");

    return category ? category._id : null;
  }

  const category = await Category.findOne({
    slug: String(categoryValue).trim().toLowerCase(),
  }).select("_id");

  return category ? category._id : null;
};

const categoryExistsAndActive = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) return false;

  return Boolean(
    await Category.exists({
      _id: categoryId,
      isActive: true,
    }),
  );
};

export const getLinks = asyncHandler(async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1, 1000000);
  const limit = parsePositiveInteger(req.query.limit, 12, 100);
  const skip = (page - 1) * limit;

  const filter = isAdmin(req) ? {} : { status: "published" };

  if (!isAdmin(req)) {
    filter.publishedAt = { $lte: new Date() };
  }

  if (req.query.category) {
    const categoryId = await getCategoryFilter(req.query.category);

    if (!categoryId) {
      return res.status(200).json({
        success: true,
        links: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    filter.category = categoryId;
  }

  if (req.query.status && isAdmin(req)) {
    const allowedStatuses = ["published", "draft", "archived"];

    if (!allowedStatuses.includes(req.query.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource status.",
      });
    }

    filter.status = req.query.status;
  }

  if (req.query.featured === "true") {
    filter.isFeatured = true;
  }

  if (req.query.search) {
    const search = String(req.query.search).trim().slice(0, 100);

    if (search) {
      filter.$text = { $search: search };
    }
  }

  const sortOptions = {
    latest: { publishedAt: -1, _id: -1 },
    oldest: { publishedAt: 1, _id: 1 },
    title: { title: 1, _id: 1 },
    popular: { clickCount: -1, publishedAt: -1 },
  };

  const sort = sortOptions[req.query.sort] || sortOptions.latest;

  const [links, total] = await Promise.all([
    Link.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Link.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    links,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getLinkById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  const link = await Link.findById(id).populate("category", "name slug").lean();

  if (!link) {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  if (!isAdmin(req)) {
    if (
      link.status !== "published" ||
      !link.publishedAt ||
      new Date(link.publishedAt) > new Date()
    ) {
      return res.status(404).json({
        success: false,
        message: "Resource not found.",
      });
    }
  }

  return res.status(200).json({
    success: true,
    link,
  });
});

export const createLink = asyncHandler(async (req, res) => {
  const payload = validateCreateLink(req.body);

  if (!(await categoryExistsAndActive(payload.category))) {
    return res.status(400).json({
      success: false,
      message: "Select an existing active category.",
    });
  }

  const link = await Link.create({
    ...payload,
    category: payload.category,
    createdBy: req.user.firebaseUid,
    updatedBy: req.user.firebaseUid,
    publishedAt:
      payload.status === "draft" || payload.status === "archived"
        ? null
        : new Date(),
  });

  const populatedLink = await Link.findById(link._id)
    .populate("category", "name slug")
    .lean();

  return res.status(201).json({
    success: true,
    message: "Resource created successfully.",
    link: populatedLink,
  });
});

export const updateLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  const payload = validateUpdateLink(req.body);

  const link = await Link.findById(id);

  if (!link) {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  if (payload.category && !(await categoryExistsAndActive(payload.category))) {
    return res.status(400).json({
      success: false,
      message: "Select an existing active category.",
    });
  }

  const previousStatus = link.status;

  Object.assign(link, payload);
  link.updatedBy = req.user.firebaseUid;

  if (payload.status === "published" && previousStatus !== "published") {
    link.publishedAt = new Date();
  }

  if (payload.status === "draft" || payload.status === "archived") {
    link.publishedAt = null;
  }

  const previousLogoUrl = link.logoUrl;

  await link.save();

  if (previousLogoUrl && previousLogoUrl !== link.logoUrl) {
    try {
      await deleteResourceLogo(previousLogoUrl);
    } catch (error) {
      console.error("Old resource logo could not be deleted.");
    }
  }

  const updatedLink = await Link.findById(link._id)
    .populate("category", "name slug")
    .lean();

  return res.status(200).json({
    success: true,
    message: "Resource updated successfully.",
    link: updatedLink,
  });
});

export const deleteLink = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  const link = await Link.findById(id);

  if (!link) {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  await link.deleteOne();

  if (link.logoUrl) {
    try {
      await deleteResourceLogo(link.logoUrl);
    } catch (error) {
      console.error("Resource deleted, but its Cloudinary logo remains.");
    }
  }

  if (!link) {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Resource deleted successfully.",
  });
});

export const incrementLinkClick = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid resource ID.",
    });
  }

  const link = await Link.findOneAndUpdate(
    {
      _id: id,
      status: "published",
      publishedAt: { $lte: new Date() },
    },
    { $inc: { clickCount: 1 } },
    { new: true },
  ).select("_id url clickCount");

  if (!link) {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  return res.status(200).json({
    success: true,
    url: link.url,
    clickCount: link.clickCount,
  });
});

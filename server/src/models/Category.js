import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required."],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    slug: {
      type: String,
      required: [true, "Category slug is required."],
      trim: true,
      lowercase: true,
      maxlength: 100,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Category slug must contain lowercase letters, numbers, and hyphens only.",
      ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    imageUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: String,
      default: null,
    },

    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, sortOrder: 1, name: 1 });

categorySchema.pre("validate", function normalizeCategory(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (this.imageUrl) {
    try {
      const parsedImageUrl = new URL(this.imageUrl);

      if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
        this.invalidate("imageUrl", "Image URL must use HTTP or HTTPS.");
      } else {
        this.imageUrl = parsedImageUrl.toString();
      }
    } catch {
      this.invalidate("imageUrl", "Enter a valid image URL.");
    }
  }

  next();
});

const Category =
  mongoose.models.Category ||
  mongoose.model("Category", categorySchema);

export default Category;
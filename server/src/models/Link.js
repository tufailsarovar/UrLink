import mongoose from "mongoose";

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required."],
      trim: true,
      minlength: 2,
      maxlength: 160,
    },

    url: {
      type: String,
      required: [true, "Resource URL is required."],
      trim: true,
      maxlength: 2048,
    },

    logoUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Resource category is required."],
      index: true,
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },

    status: {
      type: String,
      enum: ["published", "draft", "archived"],
      default: "published",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    createdBy: {
      type: String,
      required: true,
      index: true,
    },

    updatedBy: {
      type: String,
      default: null,
    },

    clickCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tags) {
          return (
            Array.isArray(tags) &&
            tags.length <= 20 &&
            tags.every(
              (tag) =>
                typeof tag === "string" &&
                tag.trim().length > 0 &&
                tag.trim().length <= 40
            )
          );
        },
        message: "A resource can have up to 20 tags, each up to 40 characters.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

linkSchema.index({ title: "text", description: "text", companyName: "text" });
linkSchema.index({ status: 1, publishedAt: -1 });
linkSchema.index({ category: 1, status: 1, publishedAt: -1 });
linkSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });

linkSchema.pre("validate", function normalizeLink(next) {
  if (this.url) {
    try {
      const parsedUrl = new URL(this.url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        this.invalidate("url", "Only HTTP and HTTPS URLs are allowed.");
      } else {
        this.url = parsedUrl.toString();
      }
    } catch {
      this.invalidate("url", "Enter a valid HTTP or HTTPS URL.");
    }
  }

  if (this.logoUrl) {
    try {
      const parsedLogoUrl = new URL(this.logoUrl);

      if (!["http:", "https:"].includes(parsedLogoUrl.protocol)) {
        this.invalidate("logoUrl", "Logo URL must use HTTP or HTTPS.");
      } else {
        this.logoUrl = parsedLogoUrl.toString();
      }
    } catch {
      this.invalidate("logoUrl", "Enter a valid logo URL.");
    }
  }

  if (Array.isArray(this.tags)) {
    this.tags = [
      ...new Set(
        this.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)
      ),
    ];
  }

  next();
});

const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);

export default Link;
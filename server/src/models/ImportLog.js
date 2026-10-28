
import mongoose from "mongoose";

const importLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["manual", "excel", "whatsapp", "api"],
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "completed_with_errors", "failed"],
      default: "pending",
      index: true,
    },

    fileName: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
    },

    startedBy: {
      type: String,
      required: true,
      index: true,
    },

    totalRecords: {
      type: Number,
      default: 0,
      min: 0,
    },

    importedRecords: {
      type: Number,
      default: 0,
      min: 0,
    },

    skippedRecords: {
      type: Number,
      default: 0,
      min: 0,
    },

    failedRecords: {
      type: Number,
      default: 0,
      min: 0,
    },

    errors: {
      type: [
        new mongoose.Schema(
          {
            row: { type: Number, min: 1, default: null },
            message: { type: String, trim: true, maxlength: 1000 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

importLogSchema.index({ createdAt: -1 });
importLogSchema.index({ status: 1, createdAt: -1 });

const ImportLog =
  mongoose.models.ImportLog ||
  mongoose.model("ImportLog", importLogSchema);

export default ImportLog;

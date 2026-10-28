
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function deleteResourceLogo(logoUrl) {
  if (!logoUrl) return;

  try {
    const url = new URL(logoUrl);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith(`/${cloudName}/image/upload/`)
    ) {
      return;
    }

    const parts = url.pathname
      .split("/image/upload/")[1]
      .split("/");

    const versionIndex = parts.findIndex((part) =>
      /^v\d+$/.test(part)
    );

    if (versionIndex !== -1) {
      parts.splice(0, versionIndex + 1);
    }

    const filename = parts.pop();

    if (!filename) return;

    const name = filename.replace(/\.[^.]+$/, "");
    const publicId = [...parts, name].join("/");

    // Only delete logos uploaded to this project's logo folder.
    if (!publicId.startsWith("urlink/resource-logos/")) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error("Cloudinary logo deletion failed:", error.message);
    throw error;
  }
}

export default cloudinary;

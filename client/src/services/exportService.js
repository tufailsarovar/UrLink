import api from "./api.js";

function buildFilename(filename, fallback = "urlink-export.xlsx") {
  const safeName = String(filename || fallback)
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/[\r\n]+/g, "")
    .trim();

  return safeName || fallback;
}

function getFilenameFromDisposition(disposition) {
  if (!disposition) return null;

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ""));
    } catch {
      return utf8Match[1].trim().replace(/^"|"$/g, "");
    }
  }

  const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1]?.trim() || null;
}

function triggerDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = buildFilename(filename);
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export async function exportLinks(filters = {}, options = {}) {
  const response = await api.get("/export/links", {
    params: filters,
    responseType: "blob",
  });

  const blob = response.data;

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("The export file is empty or invalid.");
  }

  const contentType = response.headers?.["content-type"] || "";

  if (contentType.includes("application/json")) {
    const text = await blob.text();

    try {
      const payload = JSON.parse(text);
      throw new Error(payload?.message || "Unable to export resources.");
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("The server returned an invalid export response.");
      }

      throw error;
    }
  }

  const responseFilename = getFilenameFromDisposition(
    response.headers?.["content-disposition"],
  );

  const filename = buildFilename(
    options.filename || responseFilename,
    "urlink-resources.xlsx",
  );

  triggerDownload(blob, filename);

  return {
    filename,
    size: blob.size,
    contentType,
  };
}

export async function exportCategories(options = {}) {
  const response = await api.get("/export/categories", {
    responseType: "blob",
  });

  const blob = response.data;

  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error("The categories export is empty or invalid.");
  }

  const responseFilename = getFilenameFromDisposition(
    response.headers?.["content-disposition"],
  );

  const filename = buildFilename(
    options.filename || responseFilename,
    "urlink-categories.xlsx",
  );

  triggerDownload(blob, filename);

  return {
    filename,
    size: blob.size,
    contentType: response.headers?.["content-type"] || "",
  };
}

const exportService = {
  exportLinks,
  exportCategories,
};

export default exportService;

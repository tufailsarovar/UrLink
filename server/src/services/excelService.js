
import ExcelJS from "exceljs";
import { normalizeResource } from "./contentNormalizer.js";

const MAX_IMPORT_ROWS = 5000;

const FIELD_ALIASES = {
  title: ["title", "name", "resource title", "job title"],
  url: ["url", "link", "website", "resource url"],
  description: ["description", "details", "summary"],
  category: ["category", "type", "resource category"],
  companyName: ["company", "company name", "organization", "organisation"],
  location: ["location", "city", "place"],
  tags: ["tags", "keywords"],
};

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function readCell(cell) {
  const value = cell?.value;

  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    if (value.text !== undefined) return String(value.text);
    if (value.hyperlink) return String(value.hyperlink);
    if (Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text || "").join("");
    }

    if (value.result !== undefined) {
      return String(value.result);
    }
  }

  return String(value);
}

function buildHeaderMap(worksheet) {
  const headerMap = new Map();

  worksheet.getRow(1).eachCell((cell, columnNumber) => {
    const header = normalizeHeader(readCell(cell));

    if (header) headerMap.set(header, columnNumber);
  });

  return headerMap;
}

function findColumn(headerMap, aliases) {
  for (const alias of aliases) {
    const index = headerMap.get(normalizeHeader(alias));

    if (index) return index;
  }

  return null;
}

function parseTags(value) {
  if (!value) return [];

  return String(value)
    .split(/[,;|]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function parseResourceWorkbook(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new TypeError("A non-empty Excel file buffer is required.");
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("The workbook does not contain a worksheet.");
  }

  if (worksheet.rowCount < 2) {
    throw new Error("The worksheet contains no resource rows.");
  }

  if (worksheet.rowCount - 1 > MAX_IMPORT_ROWS) {
    throw new Error(`The workbook cannot exceed ${MAX_IMPORT_ROWS} data rows.`);
  }

  const headers = buildHeaderMap(worksheet);

  const columns = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([field, aliases]) => [
      field,
      findColumn(headers, aliases),
    ])
  );

  if (!columns.title || !columns.url) {
    throw new Error(
      "The workbook must include Title and URL columns. Accepted aliases include Name, Link, and Website."
    );
  }

  const records = [];
  const errors = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);

    if (!row.hasValues) continue;

    const raw = {
      title: columns.title ? readCell(row.getCell(columns.title)) : "",
      url: columns.url ? readCell(row.getCell(columns.url)) : "",
      description: columns.description
        ? readCell(row.getCell(columns.description))
        : "",
      category: columns.category
        ? readCell(row.getCell(columns.category))
        : "",
      companyName: columns.companyName
        ? readCell(row.getCell(columns.companyName))
        : "",
      location: columns.location
        ? readCell(row.getCell(columns.location))
        : "",
      tags: columns.tags
        ? parseTags(readCell(row.getCell(columns.tags)))
        : [],
    };

    if (!raw.title.trim() && !raw.url.trim()) continue;

    try {
      const resource = normalizeResource(raw);

      if (!resource.category) {
        throw new Error("Category is required.");
      }

      records.push({
        rowNumber,
        resource,
      });
    } catch (error) {
      errors.push({
        rowNumber,
        message: error.message || "Invalid resource row.",
      });
    }
  }

  return {
    worksheetName: worksheet.name,
    totalRows: records.length + errors.length,
    records,
    errors,
  };
}

export async function createResourceWorkbook(resources = []) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "urlink";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Resources");

  worksheet.columns = [
    { header: "Title", key: "title", width: 32 },
    { header: "URL", key: "url", width: 45 },
    { header: "Description", key: "description", width: 45 },
    { header: "Category", key: "category", width: 24 },
    { header: "Company", key: "companyName", width: 24 },
    { header: "Location", key: "location", width: 20 },
    { header: "Tags", key: "tags", width: 30 },
    { header: "Status", key: "status", width: 16 },
    { header: "Clicks", key: "clickCount", width: 12 },
    { header: "Created At", key: "createdAt", width: 24 },
  ];

  worksheet.addRows(
    resources.map((resource) => ({
      title: resource.title || "",
      url: resource.url || "",
      description: resource.description || "",
      category: resource.category?.name || resource.category || "",
      companyName: resource.companyName || "",
      location: resource.location || "",
      tags: Array.isArray(resource.tags) ? resource.tags.join(", ") : "",
      status: resource.status || "",
      clickCount: resource.clickCount || 0,
      createdAt: resource.createdAt || "",
    }))
  );

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: "A1",
    to: `J${Math.max(1, worksheet.rowCount)}`,
  };

  worksheet.getRow(1).height = 24;
  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6554F0" },
  };

  return workbook;
}

export default {
  parseResourceWorkbook,
  createResourceWorkbook,
};

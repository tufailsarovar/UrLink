
import ExcelJS from "exceljs";
import Link from "../models/Link.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

function setExcelHeaders(res, filename) {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  res.setHeader("Cache-Control", "no-store");
}

async function sendWorkbook(res, workbook, filename) {
  setExcelHeaders(res, filename);
  await workbook.xlsx.write(res);
  res.end();
}

function styleWorksheet(worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: {
      row: 1,
      column: worksheet.columnCount,
    },
  };

  worksheet.getRow(1).font = {
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF6554F0" },
  };

  worksheet.columns.forEach((column) => {
    let maxLength = 12;

    column.eachCell?.({ includeEmpty: false }, (cell) => {
      maxLength = Math.max(
        maxLength,
        String(cell.value ?? "").length
      );
    });

    column.width = Math.min(maxLength + 2, 55);
  });
}

export const exportLinks = asyncHandler(async (req, res) => {
  const links = await Link.find({})
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "urlink";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Resources");

  worksheet.columns = [
    { header: "Title", key: "title" },
    { header: "URL", key: "url" },
    { header: "Description", key: "description" },
    { header: "Category", key: "category" },
    { header: "Company", key: "company" },
    { header: "Location", key: "location" },
    { header: "Status", key: "status" },
    { header: "Featured", key: "featured" },
    { header: "Clicks", key: "clicks" },
    { header: "Created At", key: "createdAt" },
    { header: "Published At", key: "publishedAt" },
    { header: "Created By", key: "createdBy" },
  ];

  worksheet.addRows(
    links.map((link) => ({
      title: link.title || "",
      url: link.url || "",
      description: link.description || "",
      category: link.category?.name || "",
      company: link.companyName || "",
      location: link.location || "",
      status: link.status || "",
      featured: link.isFeatured ? "Yes" : "No",
      clicks: link.clickCount || 0,
      createdAt: link.createdAt || "",
      publishedAt: link.publishedAt || "",
      createdBy: link.createdBy || "",
    }))
  );

  styleWorksheet(worksheet);

  return sendWorkbook(
    res,
    workbook,
    `urlink-resources-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
});

export const exportCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "urlink";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Categories");

  worksheet.columns = [
    { header: "Name", key: "name" },
    { header: "Slug", key: "slug" },
    { header: "Description", key: "description" },
    { header: "Active", key: "active" },
    { header: "Sort Order", key: "sortOrder" },
    { header: "Created At", key: "createdAt" },
  ];

  worksheet.addRows(
    categories.map((category) => ({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      active: category.isActive ? "Yes" : "No",
      sortOrder: category.sortOrder ?? 0,
      createdAt: category.createdAt || "",
    }))
  );

  styleWorksheet(worksheet);

  return sendWorkbook(
    res,
    workbook,
    `urlink-categories-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
});

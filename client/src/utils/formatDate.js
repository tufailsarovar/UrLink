import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function parseDate(value) {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? parseISO(value)
        : new Date(value);

  return isValid(date) ? date : null;
}

export function formatDate(value, pattern = "dd MMM yyyy") {
  const date = parseDate(value);

  if (!date) return "Date unavailable";

  return format(date, pattern);
}

export function formatDateTime(value) {
  return formatDate(value, "dd MMM yyyy, hh:mm a");
}

export function formatRelativeDate(value) {
  const date = parseDate(value);

  if (!date) return "Date unavailable";

  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatShortDate(value) {
  return formatDate(value, "dd MMM");
}

export function toDateInputValue(value) {
  const date = parseDate(value);

  return date ? format(date, "yyyy-MM-dd") : "";
}

export function getDateRange(option) {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);

  switch (option) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;

    case "7days":
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "30days":
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;

    case "all":
    default:
      return { startDate: "", endDate: "" };
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

export function isDateInRange(value, start, end) {
  const date = parseDate(value);

  if (!date) return false;

  const startDate = start ? parseDate(start) : null;
  const endDate = end ? parseDate(end) : null;

  if (start && !startDate) return false;
  if (end && !endDate) return false;

  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;

  return true;
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatShortDate,
  toDateInputValue,
  getDateRange,
  isDateInRange,
};

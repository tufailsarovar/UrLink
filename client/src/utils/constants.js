export const APP_NAME = "urlink";

export const APP_DESCRIPTION =
  "Discover useful open-source projects, AI tools, automation workflows, websites, and hiring opportunities.";

export const API_ENDPOINTS = {
  LINKS: "/links",
  CATEGORIES: "/categories",
  EXPORT_LINKS: "/export/links",
  AUTH: "/auth",
  HEALTH: "/health",
};

export const ROUTES = {
  HOME: "/",
  LATEST: "/latest",
  CATEGORIES: "/categories",
  LOGIN: "/login",
  ADMIN: "/admin",
  ADMIN_LINKS: "/admin/links",
  ADMIN_ADD_LINK: "/admin/links/new",
};

export const LINK_CATEGORIES = [
  { name: "GitHub Repositories", slug: "github-repositories" },
  { name: "AI Tools", slug: "ai-tools" },
  { name: "AI Automation", slug: "ai-automation" },
  { name: "Hiring & Jobs", slug: "hiring-jobs" },
  { name: "Internships", slug: "internships" },
  { name: "Websites & Apps", slug: "websites-apps" },
  { name: "Developer Tools", slug: "developer-tools" },
  { name: "Business & Startups", slug: "business-startups" },
  { name: "Other Resources", slug: "other-resources" },
];

export const LINK_SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Title A–Z", value: "title_asc" },
  { label: "Title Z–A", value: "title_desc" },
];

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const SEARCH_DEBOUNCE_MS = 250;
export const API_TIMEOUT_MS = 15000;

export const LINK_FORM_INITIAL_VALUES = {
  title: "",
  url: "",
  description: "",
  category: "",
  companyName: "",
  address: "",
  phone: "",
  email: "",
  source: "",
  publishedAt: "",
  tags: [],
  status: "published",
};

export const LINK_STATUS_OPTIONS = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

export const DATE_FILTER_OPTIONS = [
  { label: "Any time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
];

export const PAGINATION_OPTIONS = [10, 20, 50, 100];

export const EXCEL_EXPORT_FILENAME_PREFIX = "urlink-links";

export const ANIMATION = {
  FAST: 0.15,
  NORMAL: 0.25,
  SLOW: 0.4,
  STAGGER: 0.05,
};

export const UI_COLORS = {
  primary: "#6C4CF1",
  primaryHover: "#5033CC",
  text: "#172033",
  muted: "#64748B",
  border: "#E9EDF5",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
};

export const VALIDATION = {
  TITLE_MAX_LENGTH: 150,
  DESCRIPTION_MAX_LENGTH: 500,
  COMPANY_MAX_LENGTH: 150,
  TAG_MAX_LENGTH: 40,
  MAX_TAGS: 10,
};

export default {
  APP_NAME,
  APP_DESCRIPTION,
  API_ENDPOINTS,
  ROUTES,
  LINK_CATEGORIES,
  LINK_SORT_OPTIONS,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  API_TIMEOUT_MS,
  LINK_FORM_INITIAL_VALUES,
  LINK_STATUS_OPTIONS,
  DATE_FILTER_OPTIONS,
  PAGINATION_OPTIONS,
  EXCEL_EXPORT_FILENAME_PREFIX,
  ANIMATION,
  UI_COLORS,
  VALIDATION,
};

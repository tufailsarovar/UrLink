
const JOB_KEYWORDS =
  /\b(hiring|job|jobs|vacancy|vacancies|recruitment|career|careers|internship|internships|apply|opening|openings|position|positions|freelance|remote role)\b/i;

const EMAIL_REGEX =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const URL_REGEX = /https?:\/\/[^\s<>"']+/gi;

function cleanUrl(value) {
  return value.replace(/[),.!?;:]+$/, "");
}

export function extractHiringDetails(message = "") {
  if (typeof message !== "string" || !message.trim()) {
    return {
      isHiring: false,
      title: "",
      company: "",
      location: "",
      employmentType: "",
      applicationUrl: "",
      contactEmail: "",
      description: "",
    };
  }

  const text = message.trim();
  const urls = (text.match(URL_REGEX) || []).map(cleanUrl);

  const getField = (label) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(
      new RegExp(`(?:^|\\n)\\s*${escaped}\\s*:\\s*(.+)`, "i")
    );
    return match ? match[1].trim() : "";
  };

  const applicationUrl =
    getField("apply") ||
    getField("application link") ||
    getField("application url") ||
    urls[0] ||
    "";

  const title =
    getField("title") ||
    getField("role") ||
    getField("position") ||
    "";

  const company = getField("company") || getField("organization") || "";
  const location = getField("location") || "";
  const employmentType =
    getField("employment type") || getField("type") || "";

  const emailMatch = text.match(EMAIL_REGEX);

  return {
    isHiring: JOB_KEYWORDS.test(text),
    title,
    company,
    location,
    employmentType,
    applicationUrl,
    contactEmail: emailMatch ? emailMatch[0] : "",
    description: text.slice(0, 10000),
  };
}

export default { extractHiringDetails };

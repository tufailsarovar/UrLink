const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function validateUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return {
      valid: false,
      message: "Please enter a URL.",
      normalizedUrl: "",
    };
  }

  const input = value.trim();

  if (/\s/.test(input)) {
    return {
      valid: false,
      message: "The URL must not contain spaces.",
      normalizedUrl: "",
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input) ? input : `https://${input}`,
    );
  } catch {
    return {
      valid: false,
      message: "Please enter a valid URL.",
      normalizedUrl: "",
    };
  }

  if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
    return {
      valid: false,
      message: "Only HTTP and HTTPS links are allowed.",
      normalizedUrl: "",
    };
  }

  if (!parsedUrl.hostname || !parsedUrl.hostname.includes(".")) {
    return {
      valid: false,
      message: "Please enter a valid domain name.",
      normalizedUrl: "",
    };
  }

  if (
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.hostname === "localhost" ||
    parsedUrl.hostname.endsWith(".localhost") ||
    parsedUrl.hostname.endsWith(".local")
  ) {
    return {
      valid: false,
      message: "Please enter a public website URL.",
      normalizedUrl: "",
    };
  }

  return {
    valid: true,
    message: "",
    normalizedUrl: parsedUrl.href,
  };
}

export function normalizeUrl(value) {
  const result = validateUrl(value);

  if (!result.valid) {
    throw new Error(result.message);
  }

  return result.normalizedUrl;
}

export function isValidUrl(value) {
  return validateUrl(value).valid;
}

export default validateUrl;

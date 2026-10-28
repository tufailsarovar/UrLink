
const LEVELS = Object.freeze({
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
});

const configuredLevel = (
  process.env.LOG_LEVEL || "info"
).toLowerCase();

const currentLevel = Object.hasOwn(LEVELS, configuredLevel)
  ? LEVELS[configuredLevel]
  : LEVELS.info;

function serializeError(error) {
  if (!(error instanceof Error)) return error;

  return {
    name: error.name,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  };
}

function normalizeMetadata(metadata) {
  if (metadata === undefined || metadata === null) return {};

  if (metadata instanceof Error) {
    return { error: serializeError(metadata) };
  }

  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    const result = { ...metadata };

    if (result.error instanceof Error) {
      result.error = serializeError(result.error);
    }

    return result;
  }

  return { data: metadata };
}

function write(level, message, metadata) {
  if (LEVELS[level] > currentLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message:
      typeof message === "string"
        ? message
        : String(message ?? ""),
    ...normalizeMetadata(metadata),
  };

  const output = JSON.stringify(entry);

  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

const logger = Object.freeze({
  error: (message, metadata) => write("error", message, metadata),
  warn: (message, metadata) => write("warn", message, metadata),
  info: (message, metadata) => write("info", message, metadata),
  http: (message, metadata) => write("http", message, metadata),
  debug: (message, metadata) => write("debug", message, metadata),
});

export default logger;


const queue = [];
const queuedIds = new Set();

let processing = false;

const DEFAULT_CONCURRENCY = 1;
const DEFAULT_RETRY_DELAY_MS = 2000;
const MAX_ATTEMPTS = 3;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Add a task to the in-memory publishing queue.
 * Tasks are processed sequentially to avoid duplicate concurrent publishing.
 */
export function enqueuePublish(task) {
  if (typeof task !== "function") {
    throw new TypeError("Publish task must be a function.");
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  queue.push({ id, task, attempts: 0 });
  queuedIds.add(id);

  void processQueue();

  return id;
}

async function processQueue() {
  if (processing) return;

  processing = true;

  try {
    while (queue.length > 0) {
      const item = queue.shift();

      if (!item) continue;

      let completed = false;

      while (!completed && item.attempts < MAX_ATTEMPTS) {
        item.attempts += 1;

        try {
          await item.task();
          completed = true;
        } catch (error) {
          if (item.attempts < MAX_ATTEMPTS) {
            await delay(DEFAULT_RETRY_DELAY_MS * item.attempts);
          } else {
            console.error(
              `Publishing task ${item.id} failed after ${MAX_ATTEMPTS} attempts:`,
              error.message
            );
          }
        }
      }

      queuedIds.delete(item.id);
    }
  } finally {
    processing = false;

    if (queue.length > 0) {
      void processQueue();
    }
  }
}

export function getPublishQueueStatus() {
  return {
    pending: queue.length,
    processing,
    queuedTaskIds: [...queuedIds],
    concurrency: DEFAULT_CONCURRENCY,
  };
}

export default {
  enqueuePublish,
  getPublishQueueStatus,
};

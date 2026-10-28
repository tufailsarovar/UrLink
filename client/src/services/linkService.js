import api from "./api.js";

function normalizeParams(params = {}) {
  const normalized = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    normalized[key] = typeof value === "string" ? value.trim() : value;
  }

  return normalized;
}

function unwrapResponse(response) {
  return response?.data;
}

const linkService = {
  async getLinks(params = {}) {
    const response = await api.get("/links", {
      params: normalizeParams(params),
    });

    return unwrapResponse(response);
  },

  async getLinkById(id) {
    if (!id) throw new Error("A resource ID is required.");

    const response = await api.get(`/links/${encodeURIComponent(id)}`);
    return unwrapResponse(response);
  },

  async createLink(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Valid resource details are required.");
    }

    const response = await api.post("/links", payload);
    return unwrapResponse(response);
  },

  async updateLink(id, payload) {
    if (!id) throw new Error("A resource ID is required.");

    if (!payload || typeof payload !== "object") {
      throw new Error("Valid resource details are required.");
    }

    const response = await api.patch(
      `/links/${encodeURIComponent(id)}`,
      payload,
    );

    return unwrapResponse(response);
  },

  async deleteLink(id) {
    if (!id) throw new Error("A resource ID is required.");

    const response = await api.delete(`/links/${encodeURIComponent(id)}`);
    return unwrapResponse(response);
  },

  async getCategories(params = {}) {
    const response = await api.get("/categories", {
      params: normalizeParams(params),
    });

    return unwrapResponse(response);
  },

  async createCategory(payload) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Valid category details are required.");
    }

    const response = await api.post("/categories", payload);
    return unwrapResponse(response);
  },

  async updateCategory(id, payload) {
    if (!id) throw new Error("A category ID is required.");

    const response = await api.patch(
      `/categories/${encodeURIComponent(id)}`,
      payload,
    );

    return unwrapResponse(response);
  },

  async deleteCategory(id) {
    if (!id) throw new Error("A category ID is required.");

    const response = await api.delete(`/categories/${encodeURIComponent(id)}`);

    return unwrapResponse(response);
  },

  async exportLinks(params = {}) {
    const response = await api.get("/export/links", {
      params: normalizeParams(params),
      responseType: "blob",
    });

    return response;
  },
};

export { normalizeParams };
export default linkService;

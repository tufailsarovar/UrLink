import { useCallback, useEffect, useRef, useState } from "react";
import linkService from "../services/linkService.js";

const DEFAULT_PAGE_SIZE = 10;

function normalizeListResponse(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) {
    return {
      items: payload,
      totalItems: payload.length,
      page: 1,
      limit: payload.length || DEFAULT_PAGE_SIZE,
      totalPages: 1,
    };
  }

  const items = Array.isArray(payload?.links)
    ? payload.links
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.results)
        ? payload.results
        : [];

  const meta = payload?.pagination || payload?.meta || {};
  const rawTotal = Number(
    meta.totalItems ?? meta.total ?? payload?.totalItems ?? payload?.total,
  );
  const rawLimit = Number(meta.limit ?? meta.pageSize ?? payload?.limit);
  const rawPage = Number(meta.page ?? payload?.page);
  const rawPages = Number(meta.totalPages ?? meta.pages ?? payload?.totalPages);

  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_PAGE_SIZE;

  const totalItems =
    Number.isFinite(rawTotal) && rawTotal >= 0 ? rawTotal : items.length;

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const totalPages =
    Number.isFinite(rawPages) && rawPages > 0
      ? rawPages
      : Math.max(1, Math.ceil(totalItems / limit));

  return {
    items,
    totalItems,
    page,
    limit,
    totalPages,
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load resources. Please try again."
  );
}

export default function useLinks(initialFilters = {}) {
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    page: Number(initialFilters.page) || 1,
    limit: Number(initialFilters.limit) || DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "latest",
    ...initialFilters,
  });

  const requestId = useRef(0);
  const mounted = useRef(false);

  const fetchLinks = useCallback(
    async (overrides = {}) => {
      const id = ++requestId.current;
      const params = {
        ...filters,
        ...overrides,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === undefined ||
          params[key] === null ||
          params[key] === ""
        ) {
          delete params[key];
        }
      });

      setLoading(true);
      setError("");

      try {
        const response = await linkService.getLinks(params);

        if (id !== requestId.current) return;

        const result = normalizeListResponse(response);

        setLinks(result.items);
        setPagination({
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        });

        return result;
      } catch (err) {
        if (id !== requestId.current) return;

        setError(getErrorMessage(err));
        setLinks([]);
        setPagination((previous) => ({
          ...previous,
          totalItems: 0,
          totalPages: 1,
        }));

        return null;
      } finally {
        if (id === requestId.current) {
          setLoading(false);
        }
      }
    },
    [filters],
  );

  const updateFilters = useCallback((updates = {}) => {
    setFilters((previous) => ({
      ...previous,
      ...updates,
      page: updates.page ?? 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      sort: "latest",
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    });
  }, []);

  const refresh = useCallback(
    (overrides = {}) => fetchLinks(overrides),
    [fetchLinks],
  );

  useEffect(() => {
    mounted.current = true;

    fetchLinks();

    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, [fetchLinks]);

  return {
    links,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    updateFilters,
    resetFilters,
    fetchLinks,
    refresh,
  };
}

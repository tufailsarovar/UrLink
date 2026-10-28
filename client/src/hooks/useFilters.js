import { useCallback, useMemo, useState } from "react";

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  sort: "latest",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 10,
};

function normalizeFilters(filters = {}) {
  return {
    ...DEFAULT_FILTERS,
    ...filters,
    search: String(filters.search ?? ""),
    category: String(filters.category ?? ""),
    sort: String(filters.sort || "latest"),
    startDate: String(filters.startDate ?? ""),
    endDate: String(filters.endDate ?? ""),
    page: Math.max(1, Math.floor(Number(filters.page) || 1)),
    limit: Math.min(
      100,
      Math.max(1, Math.floor(Number(filters.limit) || DEFAULT_FILTERS.limit)),
    ),
  };
}

export default function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(() =>
    normalizeFilters(initialFilters),
  );

  const updateFilter = useCallback((name, value) => {
    setFilters((previous) =>
      normalizeFilters({
        ...previous,
        [name]: value,
        page: name === "page" ? value : 1,
      }),
    );
  }, []);

  const updateFilters = useCallback((updates = {}) => {
    setFilters((previous) =>
      normalizeFilters({
        ...previous,
        ...updates,
        page: Object.prototype.hasOwnProperty.call(updates, "page")
          ? updates.page
          : 1,
      }),
    );
  }, []);

  const setPage = useCallback((page) => {
    setFilters((previous) => ({
      ...previous,
      page: Math.max(1, Math.floor(Number(page) || 1)),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters((previous) => ({
      ...DEFAULT_FILTERS,
      limit: previous.limit,
    }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.search.trim()) count += 1;
    if (filters.category) count += 1;
    if (filters.startDate) count += 1;
    if (filters.endDate) count += 1;

    if (filters.sort !== DEFAULT_FILTERS.sort) count += 1;

    return count;
  }, [filters]);

  const queryParams = useMemo(() => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    return params;
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    updateFilters,
    setPage,
    clearFilters,
    activeFilterCount,
    queryParams,
  };
}

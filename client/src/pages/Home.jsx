
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  CategoryRounded,
  CodeRounded,
  LanguageRounded,
  SearchRounded,
  TuneRounded,
  WorkOutlineRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import LinkList from "../components/LinkList.jsx";
import Pagination from "../components/Pagination.jsx";

const PAGE_SIZE = 10;
const MotionBox = motion.create(Box);

const categoryIcons = [
  AutoAwesomeRounded,
  LanguageRounded,
  CodeRounded,
  WorkOutlineRounded,
  CategoryRounded,
];

function extractArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.links)) return data.links;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function extractPagination(response, itemCount, page) {
  const data = response?.data;
  const meta = data?.pagination || data?.meta || {};

  const total = Number(
    meta.totalItems ?? meta.total ?? data?.total ?? itemCount,
  );
  const limit = Number(meta.limit ?? meta.pageSize ?? PAGE_SIZE);
  const totalPages = Number(
    meta.totalPages ??
      meta.pages ??
      data?.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(1, limit))),
  );

  return {
    totalItems: Number.isFinite(total) ? total : itemCount,
    totalPages:
      Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : PAGE_SIZE,
    page: Number(meta.page ?? page) || page,
  };
}

function getCategoryName(category) {
  return String(category?.name || category?.title || "").trim();
}

function getCategoryValue(category) {
  return String(
    category?.slug ||
      category?.name ||
      category?.title ||
      category?._id ||
      category?.id ||
      "",
  ).trim();
}

function CategoryCard({ item, index, selected, onSelect }) {
  const Icon = categoryIcons[index % categoryIcons.length];

  return (
    <MotionBox
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(item.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.value);
        }
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      sx={{
        flex: "0 0 112px",
        width: 112,
        minWidth: 0,
        p: 1.15,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "#CDBAFF" : "#EEEAF7",
        borderRadius: "15px",
        bgcolor: selected ? "#F5F0FF" : "#FFFFFF",
        boxShadow: "0 3px 10px rgba(30,20,60,0.025)",
        transition:
          "border-color 180ms ease, background 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          borderColor: "#BDAAFF",
          boxShadow: "0 7px 18px rgba(108,76,241,0.08)",
        },
        "&:focus-visible": {
          outline: "2px solid #A78BFA",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          mb: 0.8,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          flexShrink: 0,
          borderRadius: "50%",
          bgcolor: item.color || "#F1EDFF",
          color: item.iconColor || "#7554F4",
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={`${item.name} logo`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
            }}
          />
        ) : (
          <Icon sx={{ fontSize: 21 }} />
        )}
      </Box>

      <Typography
        sx={{
          width: "100%",
          fontSize: 10.5,
          fontWeight: 800,
          lineHeight: 1.4,
          color: "#25213C",
          overflowWrap: "anywhere",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "2.8em",
        }}
      >
        {item.name}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,
          fontSize: 9,
          color: "#8991A7",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {item.count != null ? `${item.count} resources` : "Explore resources"}
      </Typography>
    </MotionBox>
  );
}

function DesktopCategoryCard({ item, index, selected, onSelect }) {
  const Icon = categoryIcons[index % categoryIcons.length];

  return (
    <MotionBox
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(item.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.value);
        }
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        minWidth: 0,
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "#CDBAFF" : "#EEEAF7",
        borderRadius: "16px",
        bgcolor: selected ? "#F5F0FF" : "#FFFFFF",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          borderColor: "#BDAAFF",
          boxShadow: "0 8px 22px rgba(108,76,241,0.08)",
        },
        "&:focus-visible": {
          outline: "2px solid #A78BFA",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          borderRadius: "50%",
          bgcolor: item.color || "#F1EDFF",
          color: item.iconColor || "#7554F4",
        }}
      >
        {item.imageUrl ? (
          <Box
            component="img"
            src={item.imageUrl}
            alt={`${item.name} logo`}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: "50%",
              bgcolor: "#FFFFFF",
            }}
          />
        ) : (
          <Icon sx={{ fontSize: 24 }} />
        )}
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1.4,
          color: "#25213C",
          overflowWrap: "anywhere",
        }}
      >
        {item.name}
      </Typography>

      <Typography sx={{ mt: 0.4, fontSize: 10, color: "#8991A7" }}>
        {item.count != null ? `${item.count} resources` : "Explore resources"}
      </Typography>
    </MotionBox>
  );
}

function AllResourcesCard({ selected, onSelect }) {
  return (
    <MotionBox
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect("")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect("");
        }
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      sx={{
        minWidth: 0,
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        border: "1px solid",
        borderColor: selected ? "#CDBAFF" : "#E5DCFF",
        borderRadius: "16px",
        bgcolor: selected ? "#F2EBFF" : "#F8F5FF",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          borderColor: "#A78BFA",
          boxShadow: "0 8px 22px rgba(108,76,241,0.08)",
        },
        "&:focus-visible": {
          outline: "2px solid #A78BFA",
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          bgcolor: "#E8DEFF",
          color: "#7554F4",
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 24 }} />
      </Box>

      <Typography
        sx={{
          mt: 1,
          fontSize: 12,
          fontWeight: 800,
          color: "#25213C",
        }}
      >
        All Resources
      </Typography>

      <Typography sx={{ mt: 0.4, fontSize: 10, color: "#8991A7" }}>
        Explore everything
      </Typography>
    </MotionBox>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    () => new URLSearchParams(window.location.search).get("category") || "",
  );
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    limit: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      setCategories(extractArray(response));
    } catch {
      setCategories([]);
    }
  }, []);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        category: category || undefined,
        sort,
      };

      const response = await api.get("/links", { params });
      const items = extractArray(response);

      setLinks(items);
      setPagination(extractPagination(response, items.length, page));
    } catch (err) {
      setLinks([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        limit: PAGE_SIZE,
      });
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load resources. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const timeout = window.setTimeout(loadLinks, search.trim() ? 300 : 0);
    return () => window.clearTimeout(timeout);
  }, [loadLinks, search]);

  const categoryOptions = useMemo(
    () =>
      categories
        .filter(
          (item) =>
            item &&
            getCategoryName(item) &&
            getCategoryValue(item) &&
            item.isActive !== false,
        )
        .map((item) => ({
          id: item._id || item.id || getCategoryValue(item),
          name: getCategoryName(item),
          value: getCategoryValue(item),
          imageUrl: item.imageUrl || item.logoUrl || item.iconUrl || "",
          color: item.color,
          iconColor: item.iconColor,
          count: item.linkCount ?? item.resourceCount ?? item.count,
        })),
    [categories],
  );

  const featuredCategories = categoryOptions.slice(0, 8);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategory(value);
    setPage(1);

    if (value) {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSort("latest");
    setPage(1);
    setSearchParams({});
  };

  const scrollToResources = useCallback(() => {
    document.getElementById("resource-explorer")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const openCategory = (value = "") => {
    setCategory(value);
    setPage(1);

    if (value) {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }

    window.setTimeout(scrollToResources, 100);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: { xs: 4, md: 7 },
        bgcolor: "#FCFCFF",
        color: "#17152B",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        {/* Browse by Category */}
        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          sx={{ pt: { xs: 2, sm: 3, md: 4 } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: { xs: 1.5, sm: 2 } }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: { xs: 30, sm: 34 },
                  height: { xs: 30, sm: 34 },
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "10px",
                  bgcolor: "#F0EBFF",
                  color: "#7955F5",
                }}
              >
                <CategoryRounded sx={{ fontSize: { xs: 17, sm: 20 } }} />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 15, sm: 21 },
                  fontWeight: 850,
                  letterSpacing: "-0.5px",
                  color: "#211638",
                }}
              >
                Browse by Category
              </Typography>
            </Stack>

            <Button
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate("/categories")}
              sx={{
                minWidth: 0,
                p: 0.5,
                fontSize: { xs: 10, sm: 12 },
                fontWeight: 750,
                color: "#7554F4",
                textTransform: "none",
                "& .MuiButton-endIcon": { ml: 0.4 },
              }}
            >
              View all
            </Button>
          </Stack>

          {loading && categories.length === 0 ? (
            <Box sx={{ display: "flex", gap: 1, overflow: "hidden" }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    minWidth: 112,
                    p: 1.5,
                    border: "1px solid #EFEDF7",
                    borderRadius: "14px",
                  }}
                >
                  <Skeleton
                    variant="circular"
                    width={38}
                    height={38}
                    sx={{ mx: "auto" }}
                  />
                  <Skeleton width="80%" sx={{ mx: "auto", mt: 1 }} />
                  <Skeleton width="65%" sx={{ mx: "auto" }} />
                </Paper>
              ))}
            </Box>
          ) : featuredCategories.length > 0 ? (
            <>
              {/* Mobile: user-controlled horizontal scrolling */}
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  width: "100%",
                  overflowX: "auto",
                  overflowY: "hidden",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  pb: 0.5,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0.5,
                    width: "max-content",
                    pr: 0.5,
                  }}
                >
                  {featuredCategories.map((item, index) => (
                    <CategoryCard
                      key={item.id}
                      item={item}
                      index={index}
                      selected={category === item.value}
                      onSelect={openCategory}
                    />
                  ))}
                </Box>
              </Box>

              {/* Desktop: category grid */}
              <Box
                sx={{
                  display: { xs: "none", md: "grid" },
                  gridTemplateColumns: {
                    md: "repeat(4, minmax(0, 1fr))",
                    lg: "repeat(6, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                <AllResourcesCard
                  selected={!category}
                  onSelect={openCategory}
                />

                {featuredCategories.map((item, index) => (
                  <DesktopCategoryCard
                    key={item.id}
                    item={item}
                    index={index}
                    selected={category === item.value}
                    onSelect={openCategory}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px dashed #E2DCF8",
                borderRadius: "16px",
                textAlign: "center",
                color: "#8991A7",
                fontSize: 12,
              }}
            >
              Categories will appear here when published.
            </Paper>
          )}
        </MotionBox>

        {/* Latest Resources */}
        <Box
          id="resource-explorer"
          sx={{
            pt: { xs: 3, sm: 4, md: 5 },
            scrollMarginTop: "85px",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            sx={{
              mb: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "minmax(190px, 0.65fr) minmax(0, 1.65fr)",
              },
              alignItems: { xs: "stretch", lg: "center" },
              gap: { xs: 1.5, lg: 2.5 },
            }}
          >
            {/* Heading */}
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: { xs: 34, sm: 36 },
                    height: { xs: 34, sm: 36 },
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    borderRadius: "11px",
                    bgcolor: "#F0EBFF",
                    color: "#7955F5",
                  }}
                >
                  <AutoAwesomeRounded sx={{ fontSize: 20 }} />
                </Box>

                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: 18, sm: 22 },
                    fontWeight: 850,
                    letterSpacing: "-0.6px",
                    color: "#211638",
                  }}
                >
                  {search || category ? "Search Results" : "Latest Resources"}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.55,
                  fontSize: { xs: 11, sm: 12.5 },
                  lineHeight: 1.6,
                  color: "#818BA2",
                }}
              >
                {category
                  ? `Browsing ${
                      categoryOptions.find((item) => item.value === category)
                        ?.name || category
                    }`
                  : "Discover something useful for your next idea."}
              </Typography>

              <Chip
                size="small"
                label={`${pagination.totalItems} resources`}
                sx={{
                  mt: 0.8,
                  height: 23,
                  bgcolor: "#F1EDFF",
                  color: "#6C4CF1",
                  fontSize: 10,
                  fontWeight: 750,
                  borderRadius: "8px",
                }}
              />
            </Box>

            {/* Compact responsive search and filters */}
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                scrollToResources();
              }}
              sx={{
                minWidth: 0,
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr) minmax(0, 1fr)",
                  sm: "minmax(150px, 1fr) 125px 145px auto",
                },
                alignItems: "center",
                gap: { xs: 0.75, sm: 1 },
                p: { xs: 0.75, sm: 1 },
                border: "1px solid #E9E2FA",
                borderRadius: { xs: "13px", sm: "16px" },
                bgcolor: "#FFFFFF",
                boxShadow: "0 4px 16px rgba(65,42,103,0.035)",
                transition: "border-color 180ms ease, box-shadow 180ms ease",
                "&:focus-within": {
                  borderColor: "#C5B3FF",
                  boxShadow: "0 6px 20px rgba(108,76,241,0.07)",
                },
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search resources..."
                aria-label="Search resources"
                sx={{
                  gridColumn: { xs: "1 / -1", sm: "auto" },
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    minHeight: { xs: 38, sm: 40 },
                    borderRadius: "9px",
                    bgcolor: "#FAF9FF",
                    fontSize: 12,
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#E4DAFF" },
                    "&.Mui-focused fieldset": { borderColor: "#B9A4FF" },
                  },
                  "& .MuiInputBase-input": {
                    py: 1,
                    px: 0.5,
                    minWidth: 0,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded
                        sx={{ fontSize: 19, color: "#8B83A2" }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                fullWidth
                size="small"
                value={sort}
                onChange={handleSortChange}
                aria-label="Sort resources"
                sx={{
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    minHeight: { xs: 36, sm: 40 },
                    borderRadius: "9px",
                    bgcolor: "#FAF9FF",
                    fontSize: 11,
                  },
                }}
              >
                <MenuItem value="latest">Latest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="title">Title A–Z</MenuItem>
                <MenuItem value="popular">Most popular</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                size="small"
                value={category}
                onChange={handleCategoryChange}
                aria-label="Filter by category"
                sx={{
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    minHeight: { xs: 36, sm: 40 },
                    borderRadius: "9px",
                    bgcolor: "#FAF9FF",
                    fontSize: 11,
                  },
                }}
              >
                <MenuItem value="">All categories</MenuItem>
                {categoryOptions.map((item) => (
                  <MenuItem key={item.id} value={item.value}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              {(search || category || sort !== "latest") && (
                <Button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Clear all filters"
                  startIcon={<TuneRounded />}
                  sx={{
                    gridColumn: { xs: "1 / -1", sm: "auto" },
                    minWidth: { xs: 0, sm: 65 },
                    minHeight: { xs: 32, sm: 40 },
                    px: 1,
                    borderRadius: "9px",
                    bgcolor: "#F1EDFF",
                    color: "#7045C5",
                    fontSize: 11,
                    fontWeight: 750,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
                    "&:hover": { bgcolor: "#E7DEFF" },
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Box>
          </MotionBox>

          {error && links.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            <MotionBox
              key={`${search}-${category}-${sort}-${page}`}
              initial={{ opacity: 0, y: 9 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
            >
              <LinkList
                links={links}
                loading={loading}
                error={error}
                onRetry={loadLinks}
                onClearFilters={clearFilters}
                emptyTitle="No matching resources"
                emptyDescription={
                  search || category
                    ? "Try another search or clear your filters to discover more resources."
                    : "New resources will appear here when published."
                }
              />
            </MotionBox>
          </AnimatePresence>

          {!loading && links.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                limit={pagination.limit}
                onChange={setPage}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

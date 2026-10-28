import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  DeleteOutlineRounded,
  EditRounded,
  OpenInNewRounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";

const MotionPaper = motion.create(Paper);
const PAGE_SIZE = 10;

function extractLinks(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.links)) return data.links;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function extractPagination(response, itemCount) {
  const data = response?.data;
  const meta = data?.pagination || data?.meta || {};

  const totalItems = Number(
    meta.totalItems ?? meta.total ?? data?.total ?? itemCount,
  );

  const totalPages = Number(
    meta.totalPages ??
      meta.pages ??
      data?.totalPages ??
      Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
  );

  return {
    totalItems: Number.isFinite(totalItems) ? totalItems : itemCount,
    totalPages:
      Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
}

function getCategoryName(link) {
  if (typeof link?.category === "string") return link.category;

  return link?.category?.name || link?.categoryName || "Uncategorized";
}

function getResourceUrl(link) {
  const rawUrl = link?.url || link?.link || "";

  try {
    const parsed = new URL(rawUrl);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

export default function ManageLinks() {
  const navigate = useNavigate();

  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories");
      const data = response?.data;

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setCategories(items.filter((item) => item?.isActive !== false));
    } catch {
      setCategories([]);
    }
  }, []);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/links", {
        params: {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          category: category || undefined,
          sort: "latest",
        },
      });

      const items = extractLinks(response);
      setLinks(items);
      setPagination(extractPagination(response, items.length));
    } catch (err) {
      setLinks([]);
      setPagination({ totalItems: 0, totalPages: 1 });
      setError(
        err?.response?.data?.message ||
          "Unable to load resources. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = window.setTimeout(loadLinks, search.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [loadLinks, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const id = deleteTarget._id || deleteTarget.id;

    if (!id) {
      toast.error("This resource has no valid ID.");
      setDeleteTarget(null);
      return;
    }

    setDeletingId(String(id));

    try {
      await api.delete(`/links/${encodeURIComponent(id)}`);
      toast.success("Resource deleted successfully.");
      setDeleteTarget(null);
      await loadLinks();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to delete this resource.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setPage(1);
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 24, sm: 29 },
              fontWeight: 850,
              letterSpacing: -0.8,
              color: "#17152B",
            }}
          >
            Manage resources
          </Typography>

          <Typography sx={{ mt: 0.6, fontSize: 13, color: "#78839A" }}>
            Create, edit, organize, and remove published resources.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={() => {
              loadCategories();
              loadLinks();
            }}
            disabled={loading}
            sx={{
              borderColor: "#E2E8F0",
              color: "#475569",
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/admin/links/new")}
            sx={{
              borderRadius: "10px",
              bgcolor: "#6C4CF1",
              textTransform: "none",
              fontWeight: 750,
              "&:hover": { bgcolor: "#5033CC" },
            }}
          >
            Add resource
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: "12px" }}
          action={
            <Button color="inherit" size="small" onClick={loadLinks}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          border: "1px solid #E9EAF2",
          borderRadius: "15px",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.3}>
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search title, description, or URL..."
            aria-label="Search resources"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: "#94A3B8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                fontSize: 13,
              },
            }}
          />

          <TextField
            select
            size="small"
            fullWidth
            label="Category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": { borderRadius: "10px" },
              "& .MuiInputLabel-root": { fontSize: 13 },
            }}
          >
            <MenuItem value="">All categories</MenuItem>
            {categories.map((item) => (
              <MenuItem
                key={String(item._id || item.id || item.slug || item.name)}
                value={item.slug || item.name || item._id || item.id}
              >
                {item.name || item.title}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="text"
            onClick={resetFilters}
            sx={{
              flexShrink: 0,
              borderRadius: "10px",
              color: "#6C4CF1",
              textTransform: "none",
            }}
          >
            Reset
          </Button>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          border: "1px solid #E9EAF2",
          borderRadius: "16px",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            borderBottom: "1px solid #EEF0F6",
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#172033" }}>
            Resource library
          </Typography>

          <Chip
            size="small"
            label={`${pagination.totalItems} total`}
            sx={{
              bgcolor: "#F1EDFF",
              color: "#6040D5",
              fontWeight: 750,
              fontSize: 10,
            }}
          />
        </Box>

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              p: 3,
            }}
          >
            <CircularProgress sx={{ color: "#6C4CF1" }} />
          </Box>
        ) : links.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 7, px: 2 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#172033" }}>
              No resources found
            </Typography>

            <Typography sx={{ mt: 0.7, fontSize: 12, color: "#78839A" }}>
              Try changing your search or add a new resource.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => navigate("/admin/links/new")}
              sx={{
                mt: 2,
                bgcolor: "#6C4CF1",
                textTransform: "none",
                "&:hover": { bgcolor: "#5033CC" },
              }}
            >
              Add first resource
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 650 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(220px, 2fr) minmax(120px, 1fr) 110px",
                  gap: 2,
                  px: 2,
                  py: 1.3,
                  bgcolor: "#FAFAFE",
                  borderBottom: "1px solid #EEF0F6",
                }}
              >
                {["Resource", "Category", "Actions"].map((label) => (
                  <Typography
                    key={label}
                    sx={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#94A3B8",
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                    }}
                  >
                    {label}
                  </Typography>
                ))}
              </Box>

              <AnimatePresence initial={false}>
                {links.map((link, index) => {
                  const id = link._id || link.id || link.url;
                  const url = getResourceUrl(link);
                  const title = link.title || link.name || "Untitled resource";

                  return (
                    <MotionPaper
                      key={String(id)}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.18,
                        delay: Math.min(index * 0.02, 0.12),
                      }}
                      square
                      elevation={0}
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(220px, 2fr) minmax(120px, 1fr) 110px",
                        gap: 2,
                        alignItems: "center",
                        px: 2,
                        py: 1.7,
                        borderBottom:
                          index === links.length - 1
                            ? "none"
                            : "1px solid #F0F1F6",
                        bgcolor: "#FFFFFF",
                        "&:hover": { bgcolor: "#FCFBFF" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          minWidth: 0,
                        }}
                      >
                        <Avatar
                          src={link.logoUrl || undefined}
                          alt={`${title} logo`}
                          imgProps={{ referrerPolicy: "no-referrer" }}
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "10px",
                            bgcolor: "#EEE9FF",
                            color: "#6C4CF1",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {title.trim().slice(0, 1).toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 12.5,
                              fontWeight: 750,
                              color: "#172033",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.4,
                              fontSize: 10.5,
                              color: "#94A3B8",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {url || "No valid external URL"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Chip
                          size="small"
                          label={getCategoryName(link)}
                          sx={{
                            maxWidth: "100%",
                            bgcolor: "#F1EDFF",
                            color: "#6040D5",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        />
                      </Box>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit resource">
                          <IconButton
                            size="small"
                            aria-label="Edit resource"
                            onClick={() =>
                              navigate(
                                `/admin/links/${encodeURIComponent(id)}/edit`,
                              )
                            }
                            sx={{ color: "#6C4CF1" }}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Open resource">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Open external resource"
                              disabled={!url}
                              onClick={() =>
                                window.open(
                                  url,
                                  "_blank",
                                  "noopener,noreferrer",
                                )
                              }
                              sx={{ color: "#64748B" }}
                            >
                              <OpenInNewRounded fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Delete resource">
                          <IconButton
                            size="small"
                            aria-label="Delete resource"
                            disabled={!link._id && !link.id}
                            onClick={() => setDeleteTarget(link)}
                            sx={{
                              color: "#DC2626",
                              "&:hover": { bgcolor: "#FEF2F2" },
                            }}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </MotionPaper>
                  );
                })}
              </AnimatePresence>
            </Box>
          </Box>
        )}
      </Paper>

      {pagination.totalPages > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ mt: 2.5 }}
        >
          <Button
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            sx={{ textTransform: "none" }}
          >
            Previous
          </Button>

          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            Page {page} of {pagination.totalPages}
          </Typography>

          <Button
            disabled={page >= pagination.totalPages || loading}
            onClick={() =>
              setPage((current) =>
                Math.min(pagination.totalPages, current + 1),
              )
            }
            sx={{ textTransform: "none" }}
          >
            Next
          </Button>
        </Stack>
      )}

      {deleteTarget && (
        <Box
          role="presentation"
          onClick={() => !deletingId && setDeleteTarget(null)}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            display: "grid",
            placeItems: "center",
            p: 2,
            bgcolor: "rgba(15, 23, 42, 0.42)",
          }}
        >
          <Paper
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-resource-title"
            onClick={(event) => event.stopPropagation()}
            elevation={0}
            sx={{
              width: "100%",
              maxWidth: 390,
              p: 3,
              borderRadius: "18px",
              border: "1px solid #E9EAF2",
            }}
          >
            <Typography
              id="delete-resource-title"
              sx={{ fontSize: 18, fontWeight: 850, color: "#172033" }}
            >
              Delete resource?
            </Typography>

            <Typography
              sx={{ mt: 1, fontSize: 13, lineHeight: 1.8, color: "#64748B" }}
            >
              This will permanently remove{" "}
              <Box component="span" sx={{ fontWeight: 750, color: "#172033" }}>
                {deleteTarget.title || deleteTarget.name || "this resource"}
              </Box>
              . This action cannot be undone.
            </Typography>

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1}
              sx={{ mt: 3 }}
            >
              <Button
                disabled={Boolean(deletingId)}
                onClick={() => setDeleteTarget(null)}
                sx={{ color: "#64748B", textTransform: "none" }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="error"
                disabled={Boolean(deletingId)}
                onClick={handleDelete}
                sx={{ borderRadius: "9px", textTransform: "none" }}
              >
                {deletingId ? "Deleting..." : "Delete"}
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
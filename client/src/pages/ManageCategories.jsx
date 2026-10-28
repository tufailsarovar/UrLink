import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  CategoryRounded,
  CloudUploadRounded,
  DeleteOutlineRounded,
  EditRounded,
  RefreshRounded,
  SearchRounded,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../services/api.js";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
  imageUrl: "",
};

const makeSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replacementCategoryId, setReplacementCategoryId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/categories/admin?includeInactive=true");
      const data = response?.data;

      setCategories(
        Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data)
            ? data.data
            : [],
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load categories. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return categories;

    return categories.filter((category) =>
      [category.name, category.slug, category.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [categories, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setImageLoadError(false);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive !== false,
      imageUrl: category.imageUrl || "",
    });
    setImageLoadError(false);
    setError("");
    setDialogOpen(true);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "name" && !editing ? { slug: makeSlug(value) } : {}),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing.");
      return;
    }

    setUploadingImage(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("folder", "urlink/category-images");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName,
        )}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        throw new Error(result?.error?.message || "Image upload failed.");
      }

      setForm((previous) => ({
        ...previous,
        imageUrl: result.secure_url,
      }));

      setImageLoadError(false);
      toast.success("Image uploaded. Save to apply it.");
    } catch (err) {
      toast.error(err?.message || "Unable to upload category image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      slug: makeSlug(form.slug),
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (editing) {
        await api.patch(`/categories/${editing._id}`, payload);
        toast.success("Category updated.");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created.");
      }

      setDialogOpen(false);
      await loadCategories();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to save this category. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category) => {
    try {
      await api.patch(`/categories/${category._id}`, {
        isActive: category.isActive === false,
      });

      toast.success(
        category.isActive === false
          ? "Category activated."
          : "Category deactivated.",
      );

      await loadCategories();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Unable to update category status.",
      );
    }
  };

  const openDelete = async (category) => {
    setDeleteTarget(category);
    setReplacementCategoryId("");

    try {
      const response = await api.get("/categories/admin?includeInactive=true");

      const data = response?.data;

      const allCategories = Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setCategories(allCategories);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Unable to load replacement categories.",
      );
    }
  };

  const closeDelete = () => {
    if (deleting) return;

    setDeleteTarget(null);
    setReplacementCategoryId("");
  };

  const deleteCategory = async () => {
    if (!deleteTarget || deleting) return;

    if (!replacementCategoryId) {
      toast.error("Select a replacement category.");
      return;
    }

    setDeleting(true);

    try {
      // Move links to the replacement category first.
      await api.patch(`/categories/${deleteTarget._id}/reassign-links`, {
        newCategoryId: replacementCategoryId,
      });

      // Delete the category only after reassignment succeeds.
      await api.delete(`/categories/${deleteTarget._id}`);

      toast.success("Resources reassigned and category deleted.");

      setDeleteTarget(null);
      setReplacementCategoryId("");

      await loadCategories();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to reassign resources or delete this category.";

      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const replacementCategories = categories.filter(
    (category) => category._id !== deleteTarget?._id,
  );

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 23, sm: 28 },
              fontWeight: 850,
              color: "#172033",
            }}
          >
            Manage categories
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 13, color: "#64748B" }}>
            Create, organize, and control the categories shown on urlink.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={openCreate}
          sx={{
            alignSelf: { xs: "flex-start", sm: "auto" },
            bgcolor: "#6C4CF1",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2.5,
            "&:hover": { bgcolor: "#5938D5" },
          }}
        >
          Add category
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }} flexWrap="wrap">
        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 130, borderRadius: 3 }}
        >
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            Total categories
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 25, fontWeight: 800 }}>
            {categories.length}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 130, borderRadius: 3 }}
        >
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            Active
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 25,
              fontWeight: 800,
              color: "#15803D",
            }}
          >
            {categories.filter((item) => item.isActive !== false).length}
          </Typography>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 2, flex: 1, minWidth: 130, borderRadius: 3 }}
        >
          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
            Inactive
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 25,
              fontWeight: 800,
              color: "#B45309",
            }}
          >
            {categories.filter((item) => item.isActive === false).length}
          </Typography>
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            InputProps={{
              startAdornment: (
                <SearchRounded sx={{ mr: 1, color: "#94A3B8" }} />
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={loadCategories}
            disabled={loading}
            sx={{ textTransform: "none", flexShrink: 0 }}
          >
            Refresh
          </Button>
        </Stack>

        {error && !dialogOpen && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" onClick={loadCategories}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 7 }}>
            <CircularProgress sx={{ color: "#6C4CF1" }} />
          </Box>
        ) : filteredCategories.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 7 }}>
            <CategoryRounded sx={{ fontSize: 42, color: "#A78BFA" }} />

            <Typography sx={{ mt: 1, fontWeight: 800 }}>
              {search ? "No matching categories" : "No categories yet"}
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "#64748B" }}>
              {search
                ? "Try another search term."
                : "Create your first category to get started."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 760 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(160px, 1.2fr) minmax(140px, 1fr) 90px 130px 110px",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.3,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                }}
              >
                {["Category", "Slug", "Order", "Status", "Actions"].map(
                  (label) => (
                    <Typography
                      key={label}
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#64748B",
                      }}
                    >
                      {label}
                    </Typography>
                  ),
                )}
              </Box>

              {filteredCategories.map((category) => (
                <Box
                  key={category._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(160px, 1.2fr) minmax(140px, 1fr) 90px 130px 110px",
                    alignItems: "center",
                    gap: 1.5,
                    px: 1.5,
                    py: 1.6,
                    borderBottom: "1px solid #EEF0F6",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                    }}
                  >
                    <Avatar
                      src={category.imageUrl || undefined}
                      alt={`${category.name} logo`}
                      imgProps={{
                        onError: (event) => {
                          event.currentTarget.style.display = "none";
                        },
                      }}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        bgcolor: "#EEE9FF",
                        color: "#6C4CF1",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {(category.name || "C").trim().slice(0, 1).toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 750,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {category.name}
                      </Typography>

                      {category.description && (
                        <Typography
                          sx={{
                            mt: 0.3,
                            fontSize: 11,
                            color: "#64748B",
                          }}
                        >
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#64748B",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {category.slug}
                  </Typography>

                  <Typography sx={{ fontSize: 13 }}>
                    {category.sortOrder ?? 0}
                  </Typography>

                  <Box>
                    <Chip
                      size="small"
                      label={
                        category.isActive === false ? "Inactive" : "Active"
                      }
                      color={
                        category.isActive === false ? "default" : "success"
                      }
                      variant={
                        category.isActive === false ? "outlined" : "filled"
                      }
                      sx={{ fontSize: 10, fontWeight: 700 }}
                    />

                    <Switch
                      size="small"
                      checked={category.isActive !== false}
                      onChange={() => toggleStatus(category)}
                      inputProps={{
                        "aria-label": `Toggle ${category.name}`,
                      }}
                    />
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => openEdit(category)}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      aria-label={`Delete ${category.name}`}
                      onClick={() => openDelete(category)}
                      sx={{ color: "#DC2626" }}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Create / Edit Category */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && !uploadingImage && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={saveCategory}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editing ? "Edit category" : "Create category"}
          </DialogTitle>

          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontSize: 13,
                    fontWeight: 750,
                    color: "#172033",
                  }}
                >
                  Category logo (optional)
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: "#FAFAFE",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems="center"
                  >
                    <Avatar
                      src={
                        form.imageUrl && !imageLoadError
                          ? form.imageUrl
                          : undefined
                      }
                      alt={`${form.name || "Category"} logo`}
                      onError={() => setImageLoadError(true)}
                      sx={{
                        width: 76,
                        height: 76,
                        borderRadius: 2.5,
                        bgcolor: "#EEE9FF",
                        color: "#6C4CF1",
                        fontWeight: 800,
                        fontSize: 24,
                      }}
                    >
                      {(form.name || "C").trim().slice(0, 1).toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#64748B",
                          mb: 1.2,
                        }}
                      >
                        Choose an image from your device. Maximum size: 5 MB.
                      </Typography>

                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Button
                          component="label"
                          variant="contained"
                          disabled={uploadingImage || saving}
                          startIcon={
                            uploadingImage ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <CloudUploadRounded />
                            )
                          }
                          sx={{
                            bgcolor: "#6C4CF1",
                            borderRadius: 2,
                            textTransform: "none",
                            "&:hover": { bgcolor: "#5938D5" },
                          }}
                        >
                          {uploadingImage
                            ? "Uploading..."
                            : form.imageUrl
                              ? "Change logo"
                              : "Upload logo"}

                          <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </Button>

                        {form.imageUrl && (
                          <Button
                            variant="outlined"
                            color="inherit"
                            disabled={uploadingImage || saving}
                            onClick={() => {
                              setForm((previous) => ({
                                ...previous,
                                imageUrl: "",
                              }));
                              setImageLoadError(false);
                            }}
                            sx={{
                              borderRadius: 2,
                              textTransform: "none",
                            }}
                          >
                            Remove logo
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </Box>

              <TextField
                label="Category name"
                required
                fullWidth
                inputProps={{ minLength: 2, maxLength: 80 }}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />

              <TextField
                label="Slug"
                required
                fullWidth
                helperText="Lowercase letters, numbers, and hyphens only."
                value={form.slug}
                onChange={(event) => updateField("slug", event.target.value)}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={2}
                inputProps={{ maxLength: 300 }}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />

              <TextField
                label="Sort order"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                value={form.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", event.target.value)
                }
              />

              <TextField
                select
                label="Status"
                fullWidth
                value={form.isActive ? "active" : "inactive"}
                onChange={(event) =>
                  updateField("isActive", event.target.value === "active")
                }
              >
                <MenuItem value="active">Active — visible publicly</MenuItem>
                <MenuItem value="inactive">Inactive — hidden publicly</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={saving || uploadingImage}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                saving ||
                uploadingImage ||
                !form.name.trim() ||
                !form.slug.trim()
              }
              sx={{
                bgcolor: "#6C4CF1",
                textTransform: "none",
                "&:hover": { bgcolor: "#5938D5" },
              }}
            >
              {uploadingImage
                ? "Uploading logo..."
                : saving
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create category"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Reassign Resources and Delete Category */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={closeDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Reassign and delete category
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: "#64748B",
              mb: 2,
            }}
          >
            All resources assigned to <strong>{deleteTarget?.name}</strong> will
            be moved to the replacement category before this category is
            deleted.
          </Typography>

          <TextField
            select
            fullWidth
            required
            label="Move resources to"
            value={replacementCategoryId}
            onChange={(event) => setReplacementCategoryId(event.target.value)}
            disabled={deleting}
            helperText={
              replacementCategories.length > 0
                ? `${replacementCategories.length} replacement categories available.`
                : "No other categories exist. Create another category first."
            }
          >
            {replacementCategories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={closeDelete}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={deleteCategory}
            disabled={
              deleting ||
              !replacementCategoryId ||
              replacementCategoryId === deleteTarget?._id
            }
            sx={{ textTransform: "none" }}
          >
            {deleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Reassign & Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

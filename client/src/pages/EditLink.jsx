import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  CloudUploadRounded,
  DeleteOutlineRounded,
  EditRounded,
  SaveRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { validateUrl } from "../utils/validateUrl.js";

const MotionPaper = motion.create(Paper);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function isValidHttpUrl(value) {
  if (!value?.trim()) return true;

  try {
    const parsed = new URL(value.trim());
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function extractItem(response) {
  const data = response?.data;

  if (data?.link) return data.link;
  if (data?.data?.link) return data.data.link;
  if (data?.data && !Array.isArray(data.data)) return data.data;

  return data;
}

function extractCategories(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getCategoryValue(category) {
  if (typeof category === "string") return category;

  return String(
    category?._id || category?.id || category?.slug || category?.name || "",
  );
}

export default function EditLink() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    url: "",
    logoUrl: "",
    description: "",
    category: "",
    companyName: "",
    location: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    async function loadResource() {
      if (!id) {
        setError("A valid resource ID is required.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [linkResult, categoryResult] = await Promise.all([
          api.get(`/links/${encodeURIComponent(id)}`),
          api.get("/categories"),
        ]);

        if (!active) return;

        const resource = extractItem(linkResult);
        const categoryList = extractCategories(categoryResult);

        if (!resource || typeof resource !== "object") {
          throw new Error("The requested resource could not be found.");
        }

        const existingCategory = resource.category;

        setForm({
          title: resource.title || resource.name || "",
          url: resource.url || resource.link || "",
          logoUrl: resource.logoUrl || "",
          description: resource.description || "",
          category: getCategoryValue(existingCategory),
          companyName: resource.companyName || resource.company || "",
          location: resource.location || resource.address || "",
        });

        setCategories(
          categoryList.filter(
            (item) =>
              item &&
              (item.isActive !== false ||
                getCategoryValue(item) === getCategoryValue(existingCategory)),
          ),
        );
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this resource.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadResource();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", uploadPreset);
      uploadData.append("folder", "urlink/resource-logos");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName,
        )}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        throw new Error(
          result?.error?.message || "Cloudinary image upload failed.",
        );
      }

      setForm((previous) => ({
        ...previous,
        logoUrl: result.secure_url,
      }));

      setLogoLoadError(false);
      setFieldErrors((previous) => ({ ...previous, logoUrl: "" }));
      toast.success("Logo uploaded. Save changes to apply it.");
    } catch (uploadError) {
      toast.error(uploadError?.message || "Unable to upload the logo.");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Enter a resource title.";
    } else if (form.title.trim().length > 160) {
      errors.title = "Title cannot exceed 160 characters.";
    }

    if (!form.url.trim()) {
      errors.url = "Enter a resource URL.";
    } else {
      const result = validateUrl(form.url.trim());
      const valid =
        typeof result === "boolean" ? result : Boolean(result?.valid);

      if (!valid) {
        errors.url = "Enter a valid public HTTP or HTTPS URL.";
      }
    }

    if (!form.category) {
      errors.category = "Select a category.";
    }

    if (form.logoUrl.trim() && !isValidHttpUrl(form.logoUrl)) {
      errors.logoUrl = "The logo URL is invalid.";
    }

    if (form.description.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters.";
    }

    if (form.companyName.length > 160) {
      errors.companyName = "Company name cannot exceed 160 characters.";
    }

    if (form.location.length > 160) {
      errors.location = "Location cannot exceed 160 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const selectedCategory = categories.find(
        (item) => getCategoryValue(item) === String(form.category),
      );

      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        logoUrl: form.logoUrl.trim(),
        description: form.description.trim(),
        category:
          selectedCategory?._id ||
          selectedCategory?.id ||
          selectedCategory?.slug ||
          form.category,
        companyName: form.companyName.trim(),
        location: form.location.trim(),
      };

      await api.patch(`/links/${encodeURIComponent(id)}`, payload);

      toast.success("Resource updated successfully.");
      navigate("/admin/links", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.[0]?.msg ||
          err?.message ||
          "Unable to update this resource.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#6C4CF1" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" disableGutters>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/admin/links")}
        sx={{
          mb: 2.5,
          color: "#64748B",
          textTransform: "none",
          fontWeight: 650,
        }}
      >
        Resources
      </Button>

      <MotionPaper
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3.5 },
          border: "1px solid #E9EAF2",
          borderRadius: "18px",
          bgcolor: "#FFFFFF",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: "14px",
              bgcolor: "#F1EDFF",
              color: "#6C4CF1",
            }}
          >
            <EditRounded sx={{ fontSize: 24 }} />
          </Box>

          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 23, sm: 28 },
                fontWeight: 850,
                letterSpacing: -0.7,
                color: "#17152B",
              }}
            >
              Edit resource
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12, color: "#78839A" }}>
              Update resource details and save your changes.
            </Typography>
          </Box>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2.5, borderRadius: "11px" }}>
            {error}
          </Alert>
        )}

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={2.3}>
          <TextField
            name="title"
            label="Resource title *"
            value={form.title}
            onChange={handleChange}
            required
            fullWidth
            disabled={saving || uploading}
            error={Boolean(fieldErrors.title)}
            helperText={fieldErrors.title || `${form.title.length}/160`}
            inputProps={{ maxLength: 160 }}
          />

          <TextField
            name="url"
            label="Resource URL *"
            placeholder="https://example.com"
            value={form.url}
            onChange={handleChange}
            required
            fullWidth
            disabled={saving || uploading}
            error={Boolean(fieldErrors.url)}
            helperText={fieldErrors.url || "Use a public HTTP or HTTPS URL."}
          />

          <Box>
            <Typography
              sx={{ mb: 1, fontSize: 14, fontWeight: 750, color: "#172033" }}
            >
              Resource logo{" "}
              <Typography
                component="span"
                sx={{ ml: 0.7, fontSize: 12, color: "#94A3B8" }}
              >
                (Optional)
              </Typography>
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: "1px dashed #D9DCE8",
                borderRadius: "14px",
                bgcolor: "#FAFAFE",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                spacing={2}
              >
                <Avatar
                  src={
                    form.logoUrl && !logoLoadError ? form.logoUrl : undefined
                  }
                  alt={`${form.title || "Resource"} logo`}
                  imgProps={{ referrerPolicy: "no-referrer" }}
                  onError={() => setLogoLoadError(true)}
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: "16px",
                    bgcolor: "#EEE9FF",
                    color: "#6C4CF1",
                    fontSize: 25,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {(form.companyName || form.title || "G")
                    .trim()
                    .slice(0, 1)
                    .toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 750, color: "#172033" }}
                  >
                    {form.logoUrl
                      ? "Logo selected"
                      : "Choose an image from your device"}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      mb: 1.5,
                      fontSize: 12,
                      color: "#78839A",
                    }}
                  >
                    PNG, JPG, WEBP or another supported image. Maximum 5 MB.
                    {logoLoadError && " Preview unavailable; try another image."}
                  </Typography>

                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1}
                    alignItems="center"
                  >
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={
                        uploading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <CloudUploadRounded />
                        )
                      }
                      disabled={saving || uploading}
                      sx={{
                        borderRadius: "10px",
                        bgcolor: "#6C4CF1",
                        textTransform: "none",
                        fontWeight: 700,
                        "&:hover": { bgcolor: "#5033CC" },
                      }}
                    >
                      {uploading
                        ? "Uploading..."
                        : form.logoUrl
                          ? "Change logo"
                          : "Choose from gallery"}
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </Button>

                    {form.logoUrl && (
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<DeleteOutlineRounded />}
                        disabled={saving || uploading}
                        onClick={() => {
                          setForm((previous) => ({
                            ...previous,
                            logoUrl: "",
                          }));
                          setLogoLoadError(false);
                          setFieldErrors((previous) => ({
                            ...previous,
                            logoUrl: "",
                          }));
                        }}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                        }}
                      >
                        Remove logo
                      </Button>
                    )}
                  </Stack>

                  {fieldErrors.logoUrl && (
                    <Typography
                      sx={{ mt: 1, color: "error.main", fontSize: 12 }}
                    >
                      {fieldErrors.logoUrl}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>
          </Box>

          <FormControl
            fullWidth
            required
            disabled={saving || uploading}
            error={Boolean(fieldErrors.category)}
          >
            <InputLabel id="edit-resource-category-label">
              Category *
            </InputLabel>

            <Select
              labelId="edit-resource-category-label"
              name="category"
              value={form.category}
              label="Category *"
              onChange={handleChange}
            >
              {categories.map((item) => {
                const value = getCategoryValue(item);

                return (
                  <MenuItem key={value} value={value}>
                    {item.name || item.title || value}
                  </MenuItem>
                );
              })}
            </Select>

            <FormHelperText>
              {fieldErrors.category ||
                "Choose an administrator-managed category."}
            </FormHelperText>
          </FormControl>

          <TextField
            name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            disabled={saving || uploading}
            error={Boolean(fieldErrors.description)}
            helperText={
              fieldErrors.description ||
              `${form.description.length}/2000 characters`
            }
            inputProps={{ maxLength: 2000 }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              name="companyName"
              label="Company or organization"
              value={form.companyName}
              onChange={handleChange}
              fullWidth
              disabled={saving || uploading}
              error={Boolean(fieldErrors.companyName)}
              helperText={fieldErrors.companyName}
              inputProps={{ maxLength: 160 }}
            />

            <TextField
              name="location"
              label="Location"
              value={form.location}
              onChange={handleChange}
              fullWidth
              disabled={saving || uploading}
              error={Boolean(fieldErrors.location)}
              helperText={fieldErrors.location}
              inputProps={{ maxLength: 160 }}
            />
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          justifyContent="flex-end"
          spacing={1.2}
        >
          <Button
            variant="outlined"
            disabled={saving || uploading}
            onClick={() => navigate("/admin/links")}
            sx={{
              px: 2.5,
              minHeight: 43,
              borderRadius: "10px",
              borderColor: "#E2E8F0",
              color: "#475569",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <SaveRounded />
              )
            }
            disabled={saving || uploading || categories.length === 0}
            sx={{
              px: 2.5,
              minHeight: 43,
              borderRadius: "10px",
              bgcolor: "#6C4CF1",
              fontWeight: 750,
              textTransform: "none",
              "&:hover": { bgcolor: "#5033CC" },
            }}
          >
            {saving ? "Saving changes..." : "Save changes"}
          </Button>
        </Stack>
      </MotionPaper>
    </Container>
  );
}
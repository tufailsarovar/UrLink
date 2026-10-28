
import { useEffect, useRef, useState } from "react";
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
  ImageRounded,
  LinkRounded,
  SaveRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api.js";
import { validateUrl } from "../utils/validateUrl.js";

const INITIAL_FORM = {
  title: "",
  url: "",
  logoUrl: "",
  description: "",
  category: "",
  companyName: "",
  location: "",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getCategories(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    error?.message ||
    "Unable to save this resource."
  );
}

function isValidHttpUrl(value) {
  if (!value?.trim()) return true;

  try {
    const parsed = new URL(value.trim());
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      Boolean(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export default function AddLink() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setCategoriesLoading(true);

      try {
        const response = await api.get("/categories");

        if (active) {
          setCategories(
            getCategories(response).filter(
              (item) => item && item.isActive !== false
            )
          );
        }
      } catch {
        if (active) setCategories([]);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");

    if (name === "logoUrl") setLogoLoadError(false);
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
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
          cloudName
        )}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.secure_url) {
        throw new Error(
          result?.error?.message || "Cloudinary image upload failed."
        );
      }

      setForm((previous) => ({
        ...previous,
        logoUrl: result.secure_url,
      }));

      setFieldErrors((previous) => ({ ...previous, logoUrl: "" }));
      setLogoLoadError(false);
      toast.success("Logo uploaded successfully.");
    } catch (uploadError) {
      toast.error(
        uploadError?.message || "Unable to upload the logo. Try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Enter a resource title.";
    } else if (form.title.trim().length > 160) {
      errors.title = "Title must not exceed 160 characters.";
    }

    if (!form.url.trim()) {
      errors.url = "Enter the resource URL.";
    } else {
      const result = validateUrl(form.url.trim());
      const valid =
        typeof result === "boolean" ? result : Boolean(result?.valid);

      if (!valid) {
        errors.url = "Enter a valid public HTTP or HTTPS URL.";
      }
    }

    if (form.logoUrl.trim() && !isValidHttpUrl(form.logoUrl)) {
      errors.logoUrl = "The uploaded logo URL is invalid.";
    }

    if (!form.category) {
      errors.category = "Select a category.";
    }

    if (form.description.length > 2000) {
      errors.description = "Description must not exceed 2000 characters.";
    }

    if (form.companyName.length > 160) {
      errors.companyName = "Name must not exceed 160 characters.";
    }

    if (form.location.length > 160) {
      errors.location = "Location must not exceed 160 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (uploading) {
      toast.error("Please wait for the logo upload to finish.");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);

    try {
      const selectedCategory = categories.find(
        (item) =>
          String(item.slug || item._id || item.id || item.name) ===
          String(form.category)
      );

      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        logoUrl: form.logoUrl.trim(),
        description: form.description.trim(),
        category:
          selectedCategory?._id || selectedCategory?.id || form.category,
        companyName: form.companyName.trim(),
        location: form.location.trim(),
      };

      await api.post("/links", payload);

      toast.success("Resource created successfully.");
      navigate("/admin/links", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const previewLogo =
    form.logoUrl.trim() &&
    isValidHttpUrl(form.logoUrl) &&
    !logoLoadError;

  return (
    <Container maxWidth="md" disableGutters>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/admin/links")}
          sx={{
            color: "#64748B",
            textTransform: "none",
            fontWeight: 650,
          }}
        >
          Resources
        </Button>
      </Stack>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "grid",
              placeItems: "center",
              borderRadius: "14px",
              bgcolor: "#F1EDFF",
              color: "#6C4CF1",
              flexShrink: 0,
            }}
          >
            <LinkRounded sx={{ fontSize: 25 }} />
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
              Add resource
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 12, color: "#78839A" }}>
              Publish a useful link to the urlink resource library.
            </Typography>
          </Box>
        </Stack>

        <Paper
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
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "11px" }}>
              {error}
            </Alert>
          )}

          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#172033" }}>
            Resource details
          </Typography>

          <Typography sx={{ mt: 0.5, fontSize: 12, color: "#78839A" }}>
            Fields marked with * are required.
          </Typography>

          <Divider sx={{ my: 2.5 }} />

          <Stack spacing={2.3}>
            <TextField
              name="title"
              label="Resource title *"
              placeholder="e.g. Open-source AI tools"
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
              helperText={fieldErrors.url || "The website users will visit."}
              InputProps={{
                startAdornment: (
                  <LinkRounded sx={{ mr: 1, color: "#94A3B8" }} />
                ),
              }}
            />

            <Box>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: 14,
                  fontWeight: 750,
                  color: "#172033",
                }}
              >
                Resource logo
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
                    src={previewLogo ? form.logoUrl : undefined}
                    alt={`${form.title || "Resource"} logo`}
                    imgProps={{ referrerPolicy: "no-referrer" }}
                    onError={() => setLogoLoadError(true)}
                    sx={{
                      width: 76,
                      height: 76,
                      borderRadius: "16px",
                      bgcolor: "#EEE9FF",
                      color: "#6C4CF1",
                      border: "1px solid #E7E4F2",
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
                      {previewLogo
                        ? "Logo ready"
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
                      PNG, JPG, WEBP or other supported image formats. Maximum
                      size: 5 MB.
                      {logoLoadError && " Preview unavailable; try another image."}
                    </Typography>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      alignItems="center"
                    >
                      <Button
                        variant="contained"
                        component="label"
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
                          ref={fileInputRef}
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
                          Remove
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            <FormControl
              fullWidth
              required
              disabled={saving || uploading || categoriesLoading}
              error={Boolean(fieldErrors.category)}
            >
              <InputLabel id="add-resource-category-label">
                Category *
              </InputLabel>

              <Select
                labelId="add-resource-category-label"
                name="category"
                value={form.category}
                label="Category *"
                onChange={handleChange}
              >
                {categories.map((item) => {
                  const value = String(
                    item.slug || item._id || item.id || item.name
                  );

                  return (
                    <MenuItem key={value} value={value}>
                      {item.name || item.title}
                    </MenuItem>
                  );
                })}
              </Select>

              <FormHelperText>
                {fieldErrors.category ||
                  (categoriesLoading
                    ? "Loading categories..."
                    : categories.length === 0
                      ? "No categories available. Create a category first."
                      : "Choose an administrator-managed category.")}
              </FormHelperText>
            </FormControl>

            <TextField
              name="description"
              label="Description"
              placeholder="Explain what makes this resource useful..."
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
                placeholder="Optional"
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
                placeholder="Optional"
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
              disabled={
                saving ||
                uploading ||
                categoriesLoading ||
                categories.length === 0
              }
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
              {saving ? "Publishing..." : "Publish resource"}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}


import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBackRounded,
  ContentCopyRounded,
  LanguageRounded,
  OpenInNewRounded,
  ShareRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";

import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";

const MotionBox = motion(Box);

function getCategoryName(category) {
  if (typeof category === "string") return category;
  return category?.name || category?.title || "Resource";
}

function getResourceId(resource) {
  return resource?._id || resource?.id;
}

function getResourceLogo(resource) {
  return resource?.logoUrl || resource?.imageUrl || "";
}

function Description({ text }) {
  if (!text) {
    return (
      <Typography color="text.secondary" lineHeight={1.9}>
        No description available for this resource.
      </Typography>
    );
  }

  return (
    <Typography
      component="div"
      color="text.secondary"
      sx={{
        fontSize: { xs: 14, sm: 15 },
        lineHeight: 1.95,
        overflowWrap: "anywhere",
        whiteSpace: "pre-line",
      }}
    >
      {String(text)
        .split(/(\*\*.*?\*\*)/)
        .map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <Box
                component="strong"
                key={index}
                sx={{ color: "text.primary", fontWeight: 700 }}
              >
                {part.slice(2, -2)}
              </Box>
            );
          }

          return <span key={index}>{part}</span>;
        })}
    </Typography>
  );
}

function ResourceLogo({ resource, size = 54 }) {
  return (
    <Avatar
      src={getResourceLogo(resource)}
      alt={`${resource?.title || "Resource"} logo`}
      variant="rounded"
      imgProps={{ referrerPolicy: "no-referrer" }}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 2.5,
        bgcolor: "action.hover",
        color: "text.secondary",
        "& img": { objectFit: "contain", p: 0.5 },
      }}
    >
      <LanguageRounded />
    </Avatar>
  );
}

function LatestResourceCard({ resource, index }) {
  const resourceId = getResourceId(resource);
  const categoryName = getCategoryName(resource.category);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      sx={{ height: "100%" }}
    >
      <Paper
        component={RouterLink}
        to={`/resource/${resourceId}`}
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          p: { xs: 1.7, sm: 2.2 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          textDecoration: "none",
          color: "inherit",
          bgcolor: "background.paper",
          transition: "border-color .2s, transform .2s, box-shadow .2s",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-3px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ minWidth: 0, mb: 1.7 }}
        >
          <ResourceLogo resource={resource} size={46} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Chip
              label={categoryName}
              size="small"
              sx={{
                maxWidth: "100%",
                height: 23,
                fontSize: 10.5,
                mb: 0.5,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ fontSize: 11.5 }}
            >
              {resource.companyName || "Featured resource"}
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 750,
            fontSize: { xs: 14, sm: 15.5 },
            lineHeight: 1.5,
            mb: 0.8,
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {resource.title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            fontSize: 12.5,
            lineHeight: 1.75,
            mb: 2,
            overflowWrap: "anywhere",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          {resource.description || "Explore this useful online resource."}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            pt: 1.4,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            color="primary.main"
            sx={{ fontWeight: 700, fontSize: 12.5 }}
          >
            View resource
          </Typography>
          <OpenInNewRounded
            sx={{ fontSize: 17, color: "primary.main" }}
          />
        </Stack>
      </Paper>
    </MotionBox>
  );
}

export default function ResourceDetails() {
  const { id } = useParams();

  const [link, setLink] = useState(null);
  const [latestLinks, setLatestLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResource() {
      setLoading(true);
      setError("");
      setLink(null);

      try {
        const response = await api.get(`/links/${id}`);
        const data = response.data;
        const resource = data?.link || data?.data?.link || data?.data;

        if (!resource || (!resource._id && !resource.id)) {
          throw new Error("Resource not found.");
        }

        if (!cancelled) {
          setLink(resource);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load this resource."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResource();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadLatestResources() {
      try {
        const response = await api.get("/links", {
          params: {
            page: 1,
            limit: 8,
            sort: "latest",
          },
        });

        const data = response.data;
        const items = Array.isArray(data?.links)
          ? data.links
          : Array.isArray(data?.data?.links)
            ? data.data.links
            : Array.isArray(data?.data)
              ? data.data
              : Array.isArray(data)
                ? data
                : [];

        const filtered = items.filter(
          (item) => String(getResourceId(item)) !== String(id)
        );

        if (!cancelled) setLatestLinks(filtered.slice(0, 4));
      } catch {
        if (!cancelled) setLatestLinks([]);
      }
    }

    loadLatestResources();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/resource/${id}`
      : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Resource link copied!");
    } catch {
      toast.error("Unable to copy the link. Please copy it from the address bar.");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: link?.title || "Useful Resource",
          text: link?.description || "Check out this resource.",
          url: shareUrl,
        });
      } else {
        await handleCopyLink();
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        toast.error("Unable to share this resource.");
      }
    }
  };

  const handleVisit = async () => {
    if (!link?.url) {
      toast.error("Resource URL is not available.");
      return;
    }

    const destination = String(link.url).trim();

    if (!/^https?:\/\//i.test(destination)) {
      toast.error("This resource has an invalid URL.");
      return;
    }

    window.open(destination, "_blank", "noopener,noreferrer");

    try {
      await api.post(`/links/${id}/click`);
    } catch {
      // The resource can still be opened if click tracking fails.
    }
  };

  const categoryName = link ? getCategoryName(link.category) : "Resource";

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress size={32} />
        <Typography color="text.secondary" sx={{ mt: 2, fontSize: 14 }}>
          Loading resource...
        </Typography>
      </Container>
    );
  }

  if (error || !link) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 5, sm: 8 } }}>
        <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
          {error || "Resource not found."}
        </Alert>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackRounded />}
          variant="outlined"
        >
          Back to resources
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, sm: 5, md: 7 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackRounded />}
        sx={{
          mb: { xs: 2.5, sm: 3.5 },
          textTransform: "none",
          fontWeight: 650,
          fontSize: 13,
        }}
      >
        All resources
      </Button>

      <MotionBox
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 3, sm: 4 },
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              height: 5,
              background:
                "linear-gradient(90deg, #6750e8 0%, #36a6dc 55%, #62c7a5 100%)",
            }}
          />

          <Box sx={{ p: { xs: 2.3, sm: 4, md: 5 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 3 }}
            >
              <ResourceLogo resource={link} size={76} />

              <Box sx={{ minWidth: 0, flex: 1, width: "100%" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1 }}
                >
                  <Chip
                    label={categoryName}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: 11.5 }}
                  />

                  <Chip
                    icon={<AutoAwesomeRounded sx={{ fontSize: 15 }} />}
                    label="Resource"
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 11.5 }}
                  />
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontSize: {
                      xs: 23,
                      sm: 30,
                      md: 36,
                    },
                    fontWeight: 800,
                    lineHeight: 1.25,
                    letterSpacing: "-0.7px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {link.title}
                </Typography>

                {link.companyName && (
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: 13.5 }}
                  >
                    {link.companyName}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Box
              sx={{
                height: "1px",
                bgcolor: "divider",
                mb: { xs: 2.5, sm: 3.5 },
              }}
            />

            <Typography
              variant="h6"
              sx={{ fontWeight: 750, fontSize: 17, mb: 1.5 }}
            >
              About this resource
            </Typography>

            <Description text={link.description} />

            {Array.isArray(link.tags) && link.tags.length > 0 && (
              <Box sx={{ mt: 3.5 }}>
                <Typography
                  sx={{ fontWeight: 750, fontSize: 14, mb: 1.3 }}
                >
                  Topics and tags
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {link.tags.map((tag, index) => {
                    const label =
                      typeof tag === "string"
                        ? tag
                        : tag?.name || tag?.label || "";

                    if (!label) return null;

                    return (
                      <Chip
                        key={`${label}-${index}`}
                        label={label}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          fontSize: 11.5,
                          maxWidth: "100%",
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              sx={{ mt: 4 }}
            >
              <Button
                onClick={handleVisit}
                variant="contained"
                endIcon={<OpenInNewRounded />}
                fullWidth
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 750,
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Visit website
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="outlined"
                startIcon={<ContentCopyRounded />}
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 650,
                }}
              >
                Copy link
              </Button>

              <Button
                onClick={handleShare}
                variant="outlined"
                startIcon={<ShareRounded />}
                sx={{
                  minHeight: 46,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 650,
                }}
              >
                Share
              </Button>
            </Stack>
          </Box>
        </Paper>
      </MotionBox>

      {latestLinks.length > 0 && (
        <Box sx={{ mt: { xs: 5, sm: 7 } }}>
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: 20, sm: 25 },
                  fontWeight: 800,
                  letterSpacing: "-0.4px",
                }}
              >
                Latest resources
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.6, fontSize: 13 }}
              >
                Discover more useful links.
              </Typography>
            </Box>

            <Button
              component={RouterLink}
              to="/"
              endIcon={<ArrowBackRounded sx={{ transform: "rotate(180deg)" }} />}
              sx={{
                flexShrink: 0,
                textTransform: "none",
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              View all
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.3, sm: 2 },
            }}
          >
            {latestLinks.map((resource, index) => (
              <LatestResourceCard
                key={getResourceId(resource)}
                resource={resource}
                index={index}
              />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}

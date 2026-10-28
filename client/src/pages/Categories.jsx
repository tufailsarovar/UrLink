import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  CategoryRounded,
  RefreshRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

const MotionBox = motion.create(Box);

const extractCategories = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

const getCategoryName = (category) =>
  category?.name || category?.title || "Untitled Category";

const getCategorySlug = (category) =>
  category?.slug ||
  category?.name ||
  category?.title ||
  category?._id ||
  category?.id;

const gradients = [
  "linear-gradient(135deg, #F1E8FF 0%, #E4D5FF 100%)",
  "linear-gradient(135deg, #E3F5FF 0%, #D2E9FF 100%)",
  "linear-gradient(135deg, #FFEBDD 0%, #FFDDC8 100%)",
  "linear-gradient(135deg, #E1F8EE 0%, #C9F0DF 100%)",
  "linear-gradient(135deg, #FFF4CC 0%, #FFE8A3 100%)",
  "linear-gradient(135deg, #FFE5F0 0%, #FFD3E5 100%)",
  "linear-gradient(135deg, #E9EBFF 0%, #D8DCFF 100%)",
  "linear-gradient(135deg, #E0F7F7 0%, #C8EEEE 100%)",
];

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/categories");
      const result = extractCategories(response);

      setCategories(result.filter((category) => category?.isActive !== false));
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
    fetchCategories();
  }, [fetchCategories]);

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        getCategoryName(a).localeCompare(getCategoryName(b)),
      ),
    [categories],
  );

  const openCategory = (category) => {
    const slug = getCategorySlug(category);
    if (!slug) return;

    navigate(`/?category=${encodeURIComponent(slug)}`);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FCFCFF",
        pb: { xs: 5, md: 9 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 12% 20%, rgba(196,166,255,.25), transparent 34%), radial-gradient(circle at 90% 0%, rgba(168,213,255,.24), transparent 30%), linear-gradient(180deg, #F8F5FF 0%, #FCFCFF 100%)",
          borderBottom: "1px solid #F0EBFA",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              py: { xs: 5, sm: 6, md: 8 },
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <MotionBox
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <Chip
                icon={<CategoryRounded sx={{ fontSize: 17 }} />}
                label="Explore urlink"
                sx={{
                  mb: 2,
                  height: 32,
                  bgcolor: "#EEE6FF",
                  color: "#7045C5",
                  fontWeight: 700,
                  fontSize: 12,
                  border: "1px solid #E1D3FF",
                  "& .MuiChip-icon": { color: "#7045C5" },
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 29, sm: 39, md: 48 },
                  fontWeight: 850,
                  letterSpacing: { xs: -1, sm: -1.7 },
                  lineHeight: 1.12,
                  color: "#211638",
                }}
              >
                Explore All
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    background:
                      "linear-gradient(90deg, #8052D6 0%, #B36BEA 55%, #5C83E8 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Categories
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  mx: "auto",
                  maxWidth: 520,
                  color: "#777187",
                  fontSize: { xs: 13, sm: 15 },
                  lineHeight: 1.8,
                  px: 1,
                }}
              >
                Discover useful resources, tools, and collections organized into
                categories to help you find what you need.
              </Typography>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #EEE8F7",
                  boxShadow: "0 8px 30px rgba(65, 42, 103, 0.06)",
                  borderRadius: 50,
                  px: 2,
                  py: 1,
                }}
              >
                <CategoryRounded sx={{ color: "#885AD5", fontSize: 18 }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#625772",
                  }}
                >
                  {loading
                    ? "Loading categories..."
                    : `${sortedCategories.length} ${
                        sortedCategories.length === 1
                          ? "category"
                          : "categories"
                      } available`}
                </Typography>
              </Stack>
            </MotionBox>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 18, sm: 23 },
                fontWeight: 800,
                color: "#241A38",
                letterSpacing: "-0.5px",
              }}
            >
              Browse categories
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: { xs: 11, sm: 13 },
                color: "#898397",
              }}
            >
              Choose a category to explore its resources
            </Typography>
          </Box>

          {!loading && (
            <Button
              onClick={fetchCategories}
              startIcon={<RefreshRounded />}
              size="small"
              sx={{
                minWidth: 0,
                px: { xs: 1, sm: 1.5 },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: { xs: 11, sm: 12 },
                color: "#7751C4",
                bgcolor: "#F1EBFF",
                "&:hover": { bgcolor: "#E8DEFF" },
              }}
            >
              Refresh
            </Button>
          )}
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
              alignItems: "center",
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchCategories}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "#FFFFFF",
                  border: "1px solid #F0ECF6",
                  borderRadius: { xs: 3, sm: 4 },
                }}
              >
                <Skeleton
                  variant="rounded"
                  height={90}
                  sx={{ borderRadius: 3, mb: 1.5 }}
                />
                <Skeleton width="75%" height={22} />
                <Skeleton width="45%" height={16} />
              </Box>
            ))}
          </Box>
        ) : sortedCategories.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2, md: 2.5 },
            }}
          >
            {sortedCategories.map((category, index) => {
              const name = getCategoryName(category);
              const count =
                category?.resourceCount ??
                category?.linksCount ??
                category?.count;

              return (
                <MotionBox
                  key={
                    category?._id ||
                    category?.id ||
                    category?.slug ||
                    `${name}-${index}`
                  }
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.045, 0.35),
                  }}
                  onClick={() => openCategory(category)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openCategory(category);
                    }
                  }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    position: "relative",
                    minWidth: 0,
                    overflow: "hidden",
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: { xs: 3, sm: 4 },
                    bgcolor: "#FFFFFF",
                    border: "1px solid #EEEAF5",
                    boxShadow: "0 5px 20px rgba(46, 30, 76, 0.035)",
                    cursor: "pointer",
                    transition: "border-color .25s ease, box-shadow .25s ease",
                    "&:hover": {
                      borderColor: "#D9C8FF",
                      boxShadow: "0 14px 32px rgba(103, 69, 163, 0.11)",
                    },
                    "&:focus-visible": {
                      outline: "3px solid #C7B0FF",
                      outlineOffset: 3,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 84, sm: 108 },
                      borderRadius: { xs: 2.5, sm: 3 },
                      background: gradients[index % gradients.length],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: { xs: 1.5, sm: 2 },
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,.65)",
                        top: -48,
                        right: -20,
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,.28)",
                        bottom: -30,
                        left: -15,
                      }}
                    />

                    <Box
                      sx={{
                        position: "relative",
                        width: { xs: 52, sm: 64 },
                        height: { xs: 52, sm: 64 },
                        borderRadius: "20px",
                        bgcolor: "rgba(255,255,255,0.85)",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 8px 22px rgba(67,45,100,0.10)",
                        border: "1px solid rgba(255,255,255,0.9)",
                        overflow: "hidden",
                        transition: "transform 220ms ease",
                        ".MuiBox-root:hover &": {
                          transform: "scale(1.06) rotate(-2deg)",
                        },
                      }}
                    >
                      <CategoryRounded
                        sx={{
                          fontSize: { xs: 27, sm: 32 },
                          color: "#7552B5",
                        }}
                      />

                      {(category.imageUrl ||
                        category.logoUrl ||
                        category.iconUrl) && (
                        <Box
                          component="img"
                          src={
                            category.imageUrl ||
                            category.logoUrl ||
                            category.iconUrl
                          }
                          alt={`${name} logo`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          sx={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: "inherit",
                            bgcolor: "#FFFFFF",
                            p: 0.5,
                          }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      color: "#292039",
                      fontWeight: 800,
                      fontSize: { xs: 12, sm: 14 },
                      lineHeight: 1.45,
                      overflowWrap: "anywhere",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: { xs: 35, sm: 41 },
                    }}
                  >
                    {name}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={0.5}
                    sx={{ mt: 1 }}
                  >
                    <Typography
                      sx={{
                        color: "#91899F",
                        fontSize: { xs: 10, sm: 11 },
                        fontWeight: 600,
                      }}
                    >
                      {count != null
                        ? `${count} resources`
                        : "Explore resources"}
                    </Typography>

                    <ArrowForwardRounded
                      sx={{
                        fontSize: { xs: 17, sm: 19 },
                        color: "#8B65D4",
                        flexShrink: 0,
                        transition: "transform .2s ease",
                        ".MuiBox-root:hover &": {
                          transform: "translateX(3px)",
                        },
                      }}
                    />
                  </Stack>
                </MotionBox>
              );
            })}
          </Box>
        ) : (
          !error && (
            <Box
              sx={{
                textAlign: "center",
                py: { xs: 7, md: 10 },
                px: 2,
                bgcolor: "#FFFFFF",
                border: "1px dashed #DED5EE",
                borderRadius: 4,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 4,
                  bgcolor: "#F1E9FF",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <CategoryRounded sx={{ color: "#8255CF", fontSize: 30 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#2A203B",
                }}
              >
                No categories available
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#898397",
                  fontSize: 13,
                }}
              >
                Categories will appear here when they become available.
              </Typography>

              <Button
                onClick={fetchCategories}
                variant="contained"
                sx={{
                  mt: 2.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#8052D6",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#6C41BD",
                    boxShadow: "none",
                  },
                }}
              >
                Try again
              </Button>
            </Box>
          )
        )}
      </Container>
    </Box>
  );
}

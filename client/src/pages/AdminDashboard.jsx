import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AddLinkRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
  CategoryRounded,
  CloudDownloadRounded,
  LinkRounded,
  PeopleAltRounded,
  RefreshRounded,
  TrendingUpRounded,
  VerifiedUserRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const COLORS = {
  purple: "#6C4CF1",
  ink: "#172033",
  muted: "#718096",
  border: "#E9EAF2",
  background: "#F8FAFC",
};

const STAT_CONFIG = [
  {
    key: "links",
    title: "Total resources",
    description: "Links managed on urlink",
    icon: LinkRounded,
    color: "#6C4CF1",
    background: "#F1EDFF",
  },
  {
    key: "categories",
    title: "Active categories",
    description: "Categories visible to visitors",
    icon: CategoryRounded,
    color: "#0F9F88",
    background: "#E7F8F4",
  },
];

const ACTIONS = [
  {
    title: "Manage resources",
    description: "Review, edit, and organize your published links.",
    icon: LinkRounded,
    color: "#6C4CF1",
    background: "#F1EDFF",
    path: "/admin/links",
    label: "Open resources",
  },
  {
    title: "Manage users",
    description: "View users and manage their access.",
    icon: PeopleAltRounded,
    color: "#DB2777",
    background: "#FCE7F3",
    path: "/admin/users",
    label: "Open users",
  },
  {
    title: "Add a resource",
    description: "Publish a useful link, tool, or opportunity.",
    icon: AddLinkRounded,
    color: "#0F9F88",
    background: "#E7F8F4",
    path: "/admin/links/new",
    label: "Create resource",
  },
  {
    title: "Manage categories",
    description: "Create categories and control their visibility.",
    icon: CategoryRounded,
    color: "#D97706",
    background: "#FFF4DF",
    path: "/admin/categories",
    label: "Open categories",
  },
  {
    title: "Export resources",
    description: "Access resource exports for reporting.",
    icon: CloudDownloadRounded,
    color: "#2563EB",
    background: "#EAF2FF",
    path: "/admin/export",
    label: "View exports",
  },
];

function readPayload(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function safeCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function getResourceTotal(payload) {
  return safeCount(
    payload?.pagination?.totalItems ??
      payload?.pagination?.total ??
      payload?.meta?.total ??
      payload?.totalItems ??
      payload?.total ??
      payload?.links?.length ??
      (Array.isArray(payload) ? payload.length : 0),
  );
}

function getCategoryList(payload) {
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function StatCard({ stat, value, loading, index, reducedMotion }) {
  const Icon = stat.icon;

  return (
    <Grid size={{ xs: 6, md: 6 }}>
      <MotionCard
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.35,
          delay: reducedMotion ? 0 : index * 0.08,
        }}
        whileHover={reducedMotion ? undefined : { y: -3 }}
        elevation={0}
        sx={{
          height: "100%",
          border: `1px solid ${COLORS.border}`,
          borderRadius: { xs: "13px", sm: "18px" },
          bgcolor: "#FFFFFF",
          minWidth: 0,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.4, sm: 2.4 },
            "&:last-child": { pb: { xs: 1.4, sm: 2.4 } },
          }}
        >
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Box sx={{ minWidth: 0, width: "100%" }}>
              <Typography
                sx={{
                  fontSize: { xs: 10, sm: 12 },
                  lineHeight: 1.5,
                  color: COLORS.muted,
                  fontWeight: 650,
                  overflowWrap: "anywhere",
                }}
              >
                {stat.title}
              </Typography>

              {loading ? (
                <Skeleton width={65} height={38} />
              ) : (
                <Typography
                  sx={{
                    mt: 0.4,
                    fontSize: { xs: 25, sm: 34 },
                    lineHeight: 1.15,
                    fontWeight: 850,
                    letterSpacing: "-1px",
                    color: COLORS.ink,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value.toLocaleString()}
                </Typography>
              )}

              <Typography
                sx={{
                  mt: 0.7,
                  fontSize: { xs: 9, sm: 11 },
                  lineHeight: 1.6,
                  color: "#94A3B8",
                  overflowWrap: "anywhere",
                }}
              >
                {stat.description}
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: 34, sm: 48 },
                height: { xs: 34, sm: 48 },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: { xs: "10px", sm: "14px" },
                bgcolor: stat.background,
                color: stat.color,
              }}
            >
              <Icon sx={{ fontSize: { xs: 19, sm: 25 } }} />
            </Box>
          </Stack>
        </CardContent>
      </MotionCard>
    </Grid>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const reducedMotion = useReducedMotion();

  const [stats, setStats] = useState({
    links: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [linksResult, categoriesResult] = await Promise.allSettled([
        api.get("/links", { params: { page: 1, limit: 1 } }),
        api.get("/categories", {
          params: { includeInactive: "true" },
        }),
      ]);

      const nextStats = { links: 0, categories: 0 };
      const failures = [];

      if (linksResult.status === "fulfilled") {
        nextStats.links = getResourceTotal(readPayload(linksResult.value));
      } else {
        failures.push("resource");
      }

      if (categoriesResult.status === "fulfilled") {
        const categories = getCategoryList(readPayload(categoriesResult.value));

        nextStats.categories = categories.filter(
          (category) => category?.isActive !== false,
        ).length;
      } else {
        failures.push("category");
      }

      setStats(nextStats);

      if (failures.length) {
        setError(
          `Unable to load ${failures.join(" and ")} statistics. Refresh to try again.`,
        );
      }
    } catch {
      setError("Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const displayName =
    user?.displayName?.trim() || user?.email?.split("@")[0] || "Administrator";

  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Container maxWidth={false} disableGutters>
        {/* Header */}
        <MotionBox
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          sx={{ mb: { xs: 2.5, sm: 3.5 } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                gap={0.8}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: 21, sm: 29 },
                    lineHeight: 1.3,
                    fontWeight: 850,
                    letterSpacing: "-0.8px",
                    color: COLORS.ink,
                  }}
                >
                  Dashboard
                </Typography>

                <Chip
                  icon={<VerifiedUserRounded />}
                  label={isAdmin ? "Admin" : "Workspace"}
                  size="small"
                  sx={{
                    height: 23,
                    bgcolor: "#F1EDFF",
                    color: "#6040D5",
                    fontSize: 9,
                    fontWeight: 800,
                    "& .MuiChip-icon": {
                      color: "inherit",
                      fontSize: 13,
                    },
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: { xs: 11, sm: 13 },
                  lineHeight: 1.7,
                  color: COLORS.muted,
                  overflowWrap: "anywhere",
                }}
              >
                Welcome back, {displayName}. Here is your urlink overview.
              </Typography>
            </Box>

            <Button
              onClick={loadDashboard}
              disabled={loading}
              aria-label="Refresh dashboard statistics"
              variant="outlined"
              sx={{
                minWidth: { xs: 38, sm: 94 },
                width: { xs: 38, sm: "auto" },
                height: 38,
                px: { xs: 0, sm: 1.5 },
                flexShrink: 0,
                borderColor: "#E2E8F0",
                color: "#475569",
                borderRadius: "11px",
                textTransform: "none",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <>
                  <RefreshRounded
                    sx={{
                      fontSize: 18,
                      mr: { xs: 0, sm: 0.7 },
                    }}
                  />
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    Refresh
                  </Box>
                </>
              )}
            </Button>
          </Stack>
        </MotionBox>

        {/* Welcome banner */}
        <MotionBox
          initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.35 }}
          sx={{
            position: "relative",
            overflow: "hidden",
            isolation: "isolate",
            mb: { xs: 2.5, sm: 3.5 },
            p: { xs: 2, sm: 3.5 },
            borderRadius: { xs: "16px", sm: "23px" },
            color: "#FFFFFF",
            background:
              "linear-gradient(125deg, #35218E 0%, #6246E8 55%, #8B78FF 100%)",
            boxShadow: "0 12px 35px rgba(86,63,200,0.14)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              zIndex: -1,
              right: { xs: -45, sm: 20 },
              top: -85,
              width: { xs: 150, sm: 230 },
              height: { xs: 150, sm: 230 },
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "50%",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              zIndex: -1,
              right: { xs: 10, sm: 95 },
              bottom: -110,
              width: 180,
              height: 180,
              bgcolor: "rgba(255,255,255,0.07)",
              borderRadius: "50%",
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2.5}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeRounded sx={{ fontSize: 19 }} />
                <Typography
                  sx={{
                    fontSize: { xs: 9, sm: 11 },
                    letterSpacing: "1.3px",
                    fontWeight: 800,
                  }}
                >
                  urlink CONTROL CENTER
                </Typography>
              </Stack>

              <Typography
                component="h2"
                sx={{
                  mt: 1.4,
                  fontSize: { xs: 21, sm: 30 },
                  lineHeight: 1.25,
                  letterSpacing: "-0.8px",
                  fontWeight: 850,
                }}
              >
                Everything in one place.
              </Typography>

              <Typography
                sx={{
                  mt: 0.9,
                  maxWidth: 480,
                  fontSize: { xs: 11, sm: 13 },
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.83)",
                }}
              >
                Manage resources, organize categories, and keep your discovery
                platform up to date.
              </Typography>
            </Box>

            <Button
              fullWidth={false}
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              onClick={() => navigate("/admin/links/new")}
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                minHeight: 39,
                px: { xs: 1.5, sm: 2 },
                borderRadius: "11px",
                bgcolor: "#FFFFFF",
                color: "#5035C4",
                fontSize: 11,
                fontWeight: 800,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "#F3F0FF" },
              }}
            >
              Add resource
            </Button>
          </Stack>
        </MotionBox>

        {/* Statistics */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            component="h2"
            sx={{
              mb: 1.5,
              fontSize: { xs: 15, sm: 18 },
              fontWeight: 850,
              color: COLORS.ink,
            }}
          >
            Platform overview
          </Typography>

          {error && (
            <Alert
              severity="warning"
              sx={{ mb: 2, borderRadius: 2, fontSize: 12 }}
              action={
                <Button color="inherit" size="small" onClick={loadDashboard}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 1.2, sm: 2 }}>
            {STAT_CONFIG.map((stat, index) => (
              <StatCard
                key={stat.key}
                stat={stat}
                value={stats[stat.key]}
                loading={loading}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </Grid>
        </Box>

        {/* Quick actions */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: 15, sm: 19 },
              fontWeight: 850,
              color: COLORS.ink,
            }}
          >
            Quick actions
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              mb: 1.8,
              fontSize: { xs: 10, sm: 12 },
              color: COLORS.muted,
            }}
          >
            Choose a section to manage.
          </Typography>

          <Grid container spacing={{ xs: 1.2, sm: 2 }}>
            {ACTIONS.map((action, index) => {
              const Icon = action.icon;

              return (
                <Grid key={action.title} size={{ xs: 6, sm: 6, lg: 3 }}>
                  <MotionCard
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reducedMotion ? 0 : 0.3,
                      delay: reducedMotion ? 0 : index * 0.055,
                    }}
                    whileHover={reducedMotion ? undefined : { y: -4 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                    onClick={() => navigate(action.path)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(action.path);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    elevation={0}
                    sx={{
                      height: "100%",
                      minWidth: 0,
                      cursor: "pointer",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: { xs: "13px", sm: "17px" },
                      bgcolor: "#FFFFFF",
                      transition:
                        "border-color 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        borderColor: "#C4B5FD",
                        boxShadow: "0 9px 26px rgba(37,28,80,0.07)",
                      },
                      "&:focus-visible": {
                        outline: "3px solid #C4B5FD",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 1.3, sm: 2 },
                        "&:last-child": {
                          pb: { xs: 1.3, sm: 2 },
                        },
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        minHeight: { xs: 137, sm: 174 },
                        boxSizing: "border-box",
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 34, sm: 44 },
                          height: { xs: 34, sm: 44 },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: { xs: "10px", sm: "13px" },
                          bgcolor: action.background,
                          color: action.color,
                        }}
                      >
                        <Icon sx={{ fontSize: { xs: 19, sm: 24 } }} />
                      </Box>

                      <Typography
                        sx={{
                          mt: { xs: 1.2, sm: 1.7 },
                          fontSize: { xs: 11, sm: 14 },
                          lineHeight: 1.45,
                          fontWeight: 800,
                          color: COLORS.ink,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {action.title}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.6,
                          mb: 1.4,
                          fontSize: { xs: 9, sm: 11.5 },
                          lineHeight: 1.7,
                          color: COLORS.muted,
                          flex: 1,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {action.description}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.4}
                        sx={{ color: action.color, mt: "auto" }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: 9, sm: 11 },
                            fontWeight: 800,
                          }}
                        >
                          {action.label}
                        </Typography>
                        <ArrowForwardRounded
                          sx={{ fontSize: { xs: 13, sm: 16 } }}
                        />
                      </Stack>
                    </CardContent>
                  </MotionCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Account card */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: { xs: "13px", sm: "18px" },
            bgcolor: "#FFFFFF",
          }}
        >
          <CardContent sx={{ p: { xs: 1.6, sm: 2.4 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 1.2, sm: 1.8 }}
            >
              <Avatar
                src={user?.photoURL || undefined}
                alt={displayName}
                sx={{
                  width: { xs: 39, sm: 49 },
                  height: { xs: 39, sm: 49 },
                  bgcolor: "#EDE9FE",
                  color: "#6040D5",
                  fontWeight: 800,
                }}
              >
                {initials || <PeopleAltRounded />}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 12, sm: 14 },
                    fontWeight: 800,
                    color: COLORS.ink,
                    overflowWrap: "anywhere",
                  }}
                >
                  Signed in as {displayName}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: { xs: 10, sm: 12 },
                    color: COLORS.muted,
                    overflowWrap: "anywhere",
                  }}
                >
                  {user?.email || "No email available"}
                </Typography>
              </Box>

              <Chip
                label={isAdmin ? "Administrator" : "Signed in"}
                size="small"
                sx={{
                  maxWidth: { xs: 88, sm: "none" },
                  bgcolor: "#ECFDF5",
                  color: "#047857",
                  fontSize: { xs: 8, sm: 10 },
                  fontWeight: 800,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction="row"
          alignItems="flex-start"
          spacing={1.2}
          sx={{
            mt: 2,
            p: { xs: 1.4, sm: 2 },
            border: "1px solid #DCEFE8",
            borderRadius: "13px",
            bgcolor: "#F2FBF7",
          }}
        >
          <TrendingUpRounded
            sx={{ color: "#0F9F88", mt: 0.1, fontSize: 20, flexShrink: 0 }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 11, sm: 13 },
                fontWeight: 800,
                color: "#166653",
              }}
            >
              Keep your platform up to date
            </Typography>
            <Typography
              sx={{
                mt: 0.4,
                fontSize: { xs: 10, sm: 11.5 },
                lineHeight: 1.8,
                color: "#497C70",
              }}
            >
              Review links regularly, maintain categories, and remove outdated
              resources so visitors can discover useful information.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  AddCircleOutlineRounded,
  ArrowBackRounded,
  DashboardRounded,
  HomeRounded,
  LinkRounded,
  LogoutRounded,
  MenuRounded,
  CloseRounded,
  AutoAwesomeRounded,
  CategoryRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { PeopleAltRounded } from "@mui/icons-material";

const DRAWER_WIDTH = 252;

const navigationItems = [
  {
    label: "Overview",
    path: "/admin",
    icon: <DashboardRounded />,
    end: true,
  },
  {
    label: "Manage users",
    path: "/admin/users",
    icon: <PeopleAltRounded />,
  },
  {
    label: "Manage categories",
    path: "/admin/categories",
    icon: <CategoryRounded />,
  },
  {
    label: "Manage links",
    path: "/admin/links",
    icon: <LinkRounded />,
  },
  {
    label: "Add new link",
    path: "/admin/links/new",
    icon: <AddCircleOutlineRounded />,
  },
];

const MotionBox = motion.create(Box);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMobileDrawer = () => setMobileOpen(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      toast.success("Signed out successfully.");
      navigate("/", { replace: true });
    } catch {
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          component={Link}
          to="/"
          onClick={closeMobileDrawer}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.1,
            color: "#172033",
            textDecoration: "none",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              display: "grid",
              placeItems: "center",
              borderRadius: "12px",
              color: "#FFFFFF",
              background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            }}
          >
            <AutoAwesomeRounded />
          </Box>

          <Typography
            sx={{
              fontSize: 23,
              fontWeight: 800,
              letterSpacing: "-1px",
            }}
          >
            urlink
            <Box component="span" sx={{ color: "#6C4CF1" }}>
              .
            </Box>
          </Typography>
        </Box>

        <IconButton
          onClick={closeMobileDrawer}
          aria-label="Close admin navigation"
          sx={{ display: { xs: "inline-flex", md: "none" } }}
        >
          <CloseRounded />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#E9EDF5" }} />

      <Box sx={{ px: 2.2, pt: 3, pb: 1.2 }}>
        <Typography
          sx={{
            color: "#94A3B8",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
          }}
        >
          Workspace
        </Typography>
      </Box>

      <List sx={{ px: 1.5, py: 0.5 }}>
        {navigationItems.map((item) => {
          const active = isActive(item);

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.end}
              onClick={closeMobileDrawer}
              sx={{
                minHeight: 46,
                mb: 0.7,
                px: 1.5,
                borderRadius: "11px",
                color: active ? "#6C4CF1" : "#64748B",
                bgcolor: active ? "#F1EEFF" : "transparent",
                transition: "all 160ms ease",
                "&:hover": {
                  bgcolor: active ? "#F1EEFF" : "#F8FAFC",
                  color: "#6C4CF1",
                },
                "&::before": active
                  ? {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 10,
                      bottom: 10,
                      width: 3,
                      borderRadius: "0 4px 4px 0",
                      bgcolor: "#6C4CF1",
                    }
                  : {},
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: "inherit",
                  "& .MuiSvgIcon-root": { fontSize: 20 },
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: active ? 700 : 600,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            bgcolor: "#F8FAFC",
            border: "1px solid #E9EDF5",
            borderRadius: "13px",
            minWidth: 0,
          }}
        >
          <Avatar
            src={user?.photoURL || undefined}
            alt={user?.displayName || "User"}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#6C4CF1",
              fontSize: 13,
            }}
          >
            {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: "#172033" }}
              noWrap
            >
              {user?.displayName || "urlink user"}
            </Typography>

            <Typography sx={{ fontSize: 10.5, color: "#64748B" }} noWrap>
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          to="/"
          fullWidth
          startIcon={<HomeRounded />}
          onClick={closeMobileDrawer}
          sx={{
            justifyContent: "flex-start",
            px: 1.5,
            mb: 0.5,
            color: "#64748B",
            fontSize: 12.5,
          }}
        >
          View website
        </Button>

        <Button
          fullWidth
          startIcon={<LogoutRounded />}
          disabled={loggingOut}
          onClick={handleLogout}
          sx={{
            justifyContent: "flex-start",
            px: 1.5,
            color: "#DC2626",
            fontSize: 12.5,
            "&:hover": { bgcolor: "#FEF2F2" },
          }}
        >
          {loggingOut ? "Signing out..." : "Sign out"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#F8FAFC",
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: DRAWER_WIDTH,
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            borderRight: "1px solid #E9EDF5",
            zIndex: 1100,
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={closeMobileDrawer}
        slotProps={{
          paper: {
            sx: {
              width: DRAWER_WIDTH,
              maxWidth: "88vw",
              borderRight: "1px solid #E9EDF5",
              backgroundImage: "none",
            },
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
        }}
      >
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid #E9EDF5",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{
                minHeight: { xs: 62, md: 70 },
                gap: 1.5,
              }}
            >
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="Open admin navigation"
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  border: "1px solid #E9EDF5",
                  borderRadius: "10px",
                }}
              >
                <MenuRounded />
              </IconButton>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 15, sm: 17 },
                    fontWeight: 750,
                    color: "#172033",
                  }}
                >
                  Admin workspace
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11.5,
                    color: "#94A3B8",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Manage your urlink resources
                </Typography>
              </Box>

              <Button
                component={Link}
                to="/"
                startIcon={<ArrowBackRounded />}
                sx={{
                  border: "1px solid #E9EDF5",
                  color: "#475569",
                  bgcolor: "#FFFFFF",
                  px: { xs: 1, sm: 1.8 },
                  fontSize: 12,
                  "&:hover": {
                    borderColor: "#C4B5FD",
                    bgcolor: "#F5F3FF",
                    color: "#6C4CF1",
                  },
                }}
              >
                <Box
                  component="span"
                  sx={{ display: { xs: "none", sm: "inline" } }}
                >
                  Back to website
                </Box>
                <Box
                  component="span"
                  sx={{ display: { xs: "inline", sm: "none" } }}
                >
                  Website
                </Box>
              </Button>
            </Toolbar>
          </Container>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            maxWidth: "none",
            mx: 0,
            p: { xs: 1.5, sm: 2.5, lg: 3 },
            overflowX: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={location.pathname}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Outlet />
            </MotionBox>
          </AnimatePresence>
        </Box>

        <Box
          component="footer"
          sx={{
            px: { xs: 2, sm: 3, lg: 4 },
            py: 2,
            borderTop: "1px solid #E9EDF5",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography
            sx={{
              textAlign: { xs: "center", sm: "left" },
              color: "#94A3B8",
              fontSize: 11,
            }}
          >
            urlink Admin · Manage resources responsibly.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

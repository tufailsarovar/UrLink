
import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  AutoAwesomeRounded,
  DashboardRounded,
  ExpandMoreRounded,
  ExploreRounded,
  GavelRounded,
  HomeRounded,
  InfoOutlined,
  ContactSupportOutlined,
  LogoutRounded,
  MenuRounded,
  CloseRounded,
  LinkRounded,
} from "@mui/icons-material";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const MotionBox = motion.create(Box);

const sections = [
  {
    title: "Explore",
    icon: <ExploreRounded />,
    links: [
      { label: "Home", to: "/" },
      { label: "Latest Resources", to: "/latest" },
      { label: "Categories", to: "/categories" },
    ],
  },
  {
    title: "Company",
    icon: <InfoOutlined />,
    links: [
      { label: "About URLINK", to: "/about" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    icon: <GavelRounded />,
    links: [
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Disclaimer", to: "/disclaimer" },
      { label: "Cookie Policy", to: "/cookies" },
    ],
  },
  {
    title: "Support",
    icon: <ContactSupportOutlined />,
    links: [
      { label: "Help & Support", to: "/contact" },
      { label: "Report a Resource", to: "/report-resource" },
    ],
  },
];

const MUTED = "#71717A";
const borderColor = "rgba(24,24,27,0.09)";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState("Explore");

  const closeDrawer = () => {
    setDrawerOpen(false);
    setExpandedSection("Explore");
  };

  const closeMenu = () => setMenuAnchor(null);

  const handleLogout = async () => {
    closeMenu();
    closeDrawer();

    try {
      await logout();
      toast.success("Signed out successfully.");
      navigate("/", { replace: true });
    } catch {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  const openMenu = (event, section) => {
    setMenuAnchor({
      currentTarget: event.currentTarget,
      section,
    });
  };

  const navLinkSx = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 1.45,
    py: 1.05,
    borderRadius: "12px",
    color: active ? "#111111" : "#52525B",
    bgcolor: active ? "#F4F4F5" : "transparent",
    textDecoration: "none",
    fontSize: 12.5,
    fontWeight: active ? 800 : 650,
    transition: "all 180ms ease",
    "&:hover": {
      bgcolor: "#F4F4F5",
      color: "#09090B",
      transform: "translateY(-1px)",
    },
  });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          bgcolor: "rgba(255,255,255,0.88)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: `1px solid ${borderColor}`,
          color: "#18181B",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, sm: 72 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, md: 2 },
            }}
          >
            {/* URLINK logo */}
            <Box
              component={Link}
              to="/"
              aria-label="URLINK home"
              onClick={closeDrawer}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.15,
                flex: "0 0 auto",
                minWidth: 0,
                mr: { xs: "auto", md: 2 },
                textDecoration: "none",
                color: "inherit",
              }}
            >

              <Box
                component="img"
                src="/urlink_name.png"
                alt="URLINK"
                sx={{
                  display: "block",
                  width: { xs: 112, sm: 132, md: 145 },
                  height: { xs: 34, sm: 38 },
                  objectFit: "contain",
                  objectPosition: "left center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </Box>

            {/* Desktop navigation */}
            <Box
              component="nav"
              aria-label="Main navigation"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.4,
                ml: "auto",
              }}
            >
              {sections.map((section) => {
                const activeSection = section.links.some((item) =>
                  isActive(item.to)
                );

                const opened =
                  menuAnchor?.section === section.title;

                return (
                  <Box key={section.title}>
                    <Button
                      onClick={(event) =>
                        openMenu(event, section.title)
                      }
                      endIcon={
                        <ExpandMoreRounded
                          sx={{
                            fontSize: 17,
                            transform: opened
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 180ms ease",
                          }}
                        />
                      }
                      startIcon={section.icon}
                      sx={{
                        minWidth: 0,
                        px: 1.3,
                        py: 1.05,
                        borderRadius: "12px",
                        color:
                          opened || activeSection
                            ? "#111111"
                            : "#52525B",
                        bgcolor: opened
                          ? "#F4F4F5"
                          : "transparent",
                        fontSize: 12.5,
                        fontWeight: 750,
                        textTransform: "none",
                        "& .MuiButton-startIcon": {
                          mr: 0.65,
                          "& svg": { fontSize: 18 },
                        },
                        "& .MuiButton-endIcon": {
                          ml: 0.35,
                          mr: -0.2,
                        },
                        "&:hover": {
                          bgcolor: "#F4F4F5",
                          transform: "translateY(-1px)",
                        },
                        transition: "all 180ms ease",
                      }}
                    >
                      {section.title}
                    </Button>

                    <Menu
                      anchorEl={
                        opened
                          ? menuAnchor.currentTarget
                          : null
                      }
                      open={opened}
                      onClose={closeMenu}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1,
                            minWidth: 220,
                            p: 0.8,
                            border: `1px solid ${borderColor}`,
                            borderRadius: "16px",
                            boxShadow:
                              "0 18px 50px rgba(0,0,0,0.12)",
                            animation:
                              "urlinkMenuIn 160ms ease-out",
                            "@keyframes urlinkMenuIn": {
                              from: {
                                opacity: 0,
                                transform:
                                  "translateY(-5px) scale(.98)",
                              },
                              to: {
                                opacity: 1,
                                transform:
                                  "translateY(0) scale(1)",
                              },
                            },
                          },
                        },
                      }}
                    >
                      {section.links.map((item) => (
                        <MenuItem
                          key={item.label}
                          component={Link}
                          to={item.to}
                          onClick={closeMenu}
                          selected={isActive(item.to)}
                          sx={{
                            py: 1.2,
                            px: 1.4,
                            mb: 0.25,
                            borderRadius: "10px",
                            fontSize: 12.5,
                            fontWeight: isActive(item.to)
                              ? 750
                              : 550,
                            "&.Mui-selected": {
                              bgcolor: "#F4F4F5",
                              color: "#111111",
                            },
                            "&:hover": {
                              bgcolor: "#F4F4F5",
                            },
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                );
              })}
            </Box>

            {/* Login button */}
            {!loading && !user && (
              <Button
                component={Link}
                to="/login"
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  display: {
                    xs: "none",
                    md: "inline-flex",
                  },
                  ml: 1.5,
                  px: 2.2,
                  py: 1.05,
                  borderRadius: "12px",
                  bgcolor: "#111111",
                  color: "#FFFFFF",
                  fontSize: 12.5,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 5px 14px rgba(0,0,0,0.13)",
                  "&:hover": {
                    bgcolor: "#303030",
                    boxShadow:
                      "0 9px 22px rgba(0,0,0,0.18)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "scale(.97)",
                  },
                  transition: "all 200ms ease",
                }}
              >
                Get started
              </Button>
            )}

            {/* Logged-in account menu */}
            {!loading && user && (
              <>
                <Tooltip title="Account menu">
                  <IconButton
                    onClick={(event) =>
                      openMenu(event, "account")
                    }
                    aria-label="Open account menu"
                    sx={{
                      ml: { xs: 0, md: 1.5 },
                      p: "3px",
                      border: "1px solid #D4D4D8",
                      borderRadius: "50%",
                      transition:
                        "transform 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        transform: "scale(1.06)",
                        boxShadow: "0 0 0 4px #F4F4F5",
                      },
                    }}
                  >
                    <Avatar
                      src={user.photoURL || undefined}
                      alt={user.displayName || "User"}
                      sx={{
                        width: { xs: 34, sm: 38 },
                        height: { xs: 34, sm: 38 },
                        bgcolor: "#18181B",
                        color: "#FFFFFF",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {user.displayName
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={
                    menuAnchor?.section === "account"
                      ? menuAnchor.currentTarget
                      : null
                  }
                  open={menuAnchor?.section === "account"}
                  onClose={closeMenu}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.2,
                        width: 265,
                        maxWidth: "calc(100vw - 24px)",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "16px",
                        boxShadow:
                          "0 18px 50px rgba(0,0,0,0.12)",
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.7, minWidth: 0 }}>
                    <Typography
                      fontWeight={800}
                      fontSize={14}
                      noWrap
                    >
                      {user.displayName || "URLINK User"}
                    </Typography>

                    <Typography
                      fontSize={12}
                      color={MUTED}
                      mt={0.4}
                      noWrap
                    >
                      {user.email}
                    </Typography>
                  </Box>

                  <Divider />

                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={closeMenu}
                    sx={{ py: 1.2 }}
                  >
                    <DashboardRounded
                      sx={{ mr: 1.2, fontSize: 19 }}
                    />
                    Dashboard
                  </MenuItem>

                  <MenuItem
                    onClick={handleLogout}
                    sx={{ py: 1.2, color: "#DC2626" }}
                  >
                    <LogoutRounded
                      sx={{ mr: 1.2, fontSize: 19 }}
                    />
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Mobile menu button */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                flexShrink: 0,
                width: 40,
                height: 40,
                ml: { xs: 0, md: 1 },
                color: "#18181B",
                border: `1px solid ${borderColor}`,
                borderRadius: "12px",
                bgcolor: "#FFFFFF",
                "&:hover": { bgcolor: "#F4F4F5" },
              }}
            >
              <MenuRounded />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Animated mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: {
              width: "min(360px, 91vw)",
              p: 2,
              bgcolor: "#FFFFFF",
              backgroundImage: "none",
              borderLeft: `1px solid ${borderColor}`,
            },
          },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          {/* Mobile drawer header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box
              component={Link}
              to="/"
              onClick={closeDrawer}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "#111111",
                  color: "#FFFFFF",
                  borderRadius: "10px",
                }}
              >
                <LinkRounded
                  sx={{
                    fontSize: 20,
                    transform: "rotate(-35deg)",
                  }}
                />
              </Box>

              <Box
                component="img"
                src="/urlink_name.png"
                alt="URLINK"
                sx={{
                  width: 120,
                  height: 34,
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </Box>

            <IconButton
              onClick={closeDrawer}
              aria-label="Close navigation menu"
            >
              <CloseRounded />
            </IconButton>
          </Box>

          {/* Intro panel */}
          <Box
            sx={{
              p: 1.6,
              mb: 2,
              borderRadius: "16px",
              bgcolor: "#F4F4F5",
              border: `1px solid ${borderColor}`,
            }}
          >
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 850,
                color: "#18181B",
              }}
            >
              Find something useful.
            </Typography>

            <Typography
              sx={{
                mt: 0.45,
                fontSize: 12,
                lineHeight: 1.6,
                color: MUTED,
              }}
            >
              Explore resources, topics and helpful links on URLINK.
            </Typography>

            <AutoAwesomeRounded
              sx={{ mt: 1, fontSize: 18, color: "#52525B" }}
            />
          </Box>

          <Divider sx={{ mb: 1.8 }} />

          {/* Expandable navigation sections */}
          <List disablePadding sx={{ flex: 1 }}>
            {sections.map((section, sectionIndex) => {
              const expanded =
                expandedSection === section.title;

              const sectionActive = section.links.some((item) =>
                isActive(item.to)
              );

              return (
                <MotionBox
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: sectionIndex * 0.045,
                    duration: 0.2,
                  }}
                  sx={{
                    mb: 1,
                    border: `1px solid ${
                      expanded ? "#D4D4D8" : borderColor
                    }`,
                    borderRadius: "14px",
                    bgcolor: expanded ? "#FAFAFA" : "#FFFFFF",
                    overflow: "hidden",
                    transition:
                      "border-color 180ms ease, background 180ms ease",
                  }}
                >
                  <ListItemButton
                    onClick={() =>
                      setExpandedSection(
                        expanded ? null : section.title
                      )
                    }
                    aria-expanded={expanded}
                    sx={{
                      minHeight: 52,
                      px: 1.5,
                      gap: 1.2,
                      color:
                        expanded || sectionActive
                          ? "#18181B"
                          : "#3F3F46",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        color: "#27272A",
                      }}
                    >
                      {section.icon}
                    </Box>

                    <Typography
                      sx={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {section.title}
                    </Typography>

                    <ExpandMoreRounded
                      sx={{
                        color: MUTED,
                        transform: expanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 200ms ease",
                      }}
                    />
                  </ListItemButton>

                  <Collapse
                    in={expanded}
                    timeout={220}
                    unmountOnExit
                  >
                    <Box sx={{ px: 1.1, pb: 1.1 }}>
                      <Divider
                        sx={{ mb: 0.7, borderColor }}
                      />

                      <AnimatePresence initial={false}>
                        {section.links.map((item, index) => (
                          <MotionBox
                            key={item.label}
                            initial={{ opacity: 0, x: -7 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{
                              duration: 0.16,
                              delay: index * 0.025,
                            }}
                          >
                            <Box
                              component={NavLink}
                              to={item.to}
                              onClick={closeDrawer}
                              sx={navLinkSx(isActive(item.to))}
                            >
                              {item.label}
                            </Box>
                          </MotionBox>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </Collapse>
                </MotionBox>
              );
            })}
          </List>

          {/* Mobile account actions */}
          {!loading && user ? (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  mb: 1.5,
                  minWidth: 0,
                }}
              >
                <Avatar
                  src={user.photoURL || undefined}
                  alt={user.displayName || "User"}
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: "#18181B",
                    fontWeight: 800,
                  }}
                >
                  {user.displayName
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    fontSize={13}
                    fontWeight={800}
                    noWrap
                  >
                    {user.displayName || "URLINK User"}
                  </Typography>

                  <Typography
                    fontSize={11}
                    color={MUTED}
                    noWrap
                  >
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Button
                component={Link}
                to="/admin"
                onClick={closeDrawer}
                fullWidth
                startIcon={<DashboardRounded />}
                sx={{
                  mb: 1,
                  py: 1.15,
                  borderRadius: "12px",
                  bgcolor: "#F4F4F5",
                  color: "#18181B",
                  fontSize: 12.5,
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#E4E4E7" },
                }}
              >
                Dashboard
              </Button>

              <Button
                onClick={handleLogout}
                fullWidth
                startIcon={<LogoutRounded />}
                sx={{
                  py: 1.15,
                  borderRadius: "12px",
                  color: "#DC2626",
                  fontSize: 12.5,
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#FEF2F2" },
                }}
              >
                Sign out
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: "auto", pt: 2 }}>
              <Divider sx={{ mb: 1.8 }} />

              {!loading && !user && (
                <Button
                  component={Link}
                  to="/login"
                  fullWidth
                  variant="contained"
                  onClick={closeDrawer}
                  endIcon={<ArrowForwardRounded />}
                  sx={{
                    mb: 1.8,
                    py: 1.3,
                    borderRadius: "12px",
                    bgcolor: "#111111",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow:
                      "0 5px 15px rgba(0,0,0,0.13)",
                    "&:hover": {
                      bgcolor: "#303030",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 180ms ease",
                  }}
                >
                  Get started
                </Button>
              )}

              <Typography
                sx={{
                  textAlign: "center",
                  color: "#A1A1AA",
                  fontSize: 11,
                }}
              >
                <HomeRounded
                  sx={{
                    fontSize: 13,
                    verticalAlign: "middle",
                    mr: 0.5,
                  }}
                />
                Useful links, one place.
              </Typography>
            </Box>
          )}
        </MotionBox>
      </Drawer>
    </>
  );
}

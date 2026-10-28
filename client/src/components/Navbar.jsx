import { useState } from "react";
import {
  Button,
  AppBar,
  Avatar,
  Box,
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
  Collapse,
} from "@mui/material";
import {
  DashboardRounded,
  LogoutRounded,
  ExploreRounded,
  InfoOutlined,
  GavelRounded,
  ContactSupportOutlined,
  ExpandMoreRounded,
  MenuRounded,
  CloseRounded,
  HomeRounded,
  ArrowForwardRounded,
  AutoAwesomeRounded,
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

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setExpandedSection(null);
  };

  const handleLogout = async () => {
    setMenuAnchor(null);

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
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderSectionLinks = (section, mobile = false) =>
    section.links.map((item) => {
      const active = isActive(item.to);

      return (
        <Box
          key={`${section.title}-${item.label}`}
          component={NavLink}
          to={item.to}
          onClick={mobile ? closeDrawer : () => {}}
          sx={{
            display: "block",
            px: mobile ? 1.5 : 1.6,
            py: mobile ? 1.25 : 1.1,
            mb: 0.3,
            borderRadius: "10px",
            color: active ? "#8052D6" : "#716980",
            bgcolor: active ? "#F4EEFF" : "transparent",
            textDecoration: "none",
            fontSize: 12.5,
            fontWeight: active ? 800 : 600,
            transition: "background 180ms ease, color 180ms ease",
            "&:hover": {
              bgcolor: "#F5F0FF",
              color: "#8052D6",
            },
          }}
        >
          {item.label}
        </Box>
      );
    });

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          bgcolor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid #EEEAF5",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, sm: 72, md: 78 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                display: "flex",
                alignItems: "center",
                flex: { xs: "1 1 auto", md: "0 0 auto" },
                minWidth: 0,
                ml: { xs: 1.5, sm: 2.5, md: 4 },
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src="/urlink.png"
                alt="URLINK"
                sx={{
                  display: "block",
                  width: { xs: 140, sm: 175, md: 205 },
                  height: { xs: 42, sm: 48, md: 54 },
                  maxWidth: "100%",
                  objectFit: "contain",
                  objectPosition: "left center",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            </Box>

            {/* Desktop navigation aligned to the right */}
            <Box
              component="nav"
              aria-label="Main navigation"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "flex-end",
                gap: 0.5,
                ml: "auto",
                mr: 2,
              }}
            >
              {sections.map((section) => (
                <Box key={section.title} sx={{ position: "relative" }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={(event) => {
                      const button = event.currentTarget;
                      const rect = button.getBoundingClientRect();
                      setMenuAnchor({
                        currentTarget: button,
                        section: section.title,
                        rect,
                      });
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.7,
                      px: 1.2,
                      py: 1.1,
                      border: 0,
                      borderRadius: "10px",
                      bgcolor:
                        menuAnchor?.section === section.title
                          ? "#F4EEFF"
                          : "transparent",
                      color: "#655C76",
                      cursor: "pointer",
                      font: "inherit",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "#F6F2FF",
                        color: "#8052D6",
                      },
                    }}
                  >
                    <Box sx={{ display: "grid", placeItems: "center" }}>
                      {section.icon}
                    </Box>

                    <Typography
                      component="span"
                      sx={{ fontSize: 12.5, fontWeight: 750 }}
                    >
                      {section.title}
                    </Typography>

                    <ExpandMoreRounded
                      sx={{
                        fontSize: 17,
                        transform:
                          menuAnchor?.section === section.title
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform 180ms ease",
                      }}
                    />
                  </Box>

                  <Menu
                    anchorEl={
                      menuAnchor?.section === section.title
                        ? menuAnchor.currentTarget
                        : null
                    }
                    open={menuAnchor?.section === section.title}
                    onClose={() => setMenuAnchor(null)}
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
                          minWidth: 210,
                          p: 0.8,
                          border: "1px solid #EEE8F7",
                          borderRadius: "14px",
                          boxShadow: "0 12px 35px rgba(45,30,70,0.12)",
                        },
                      },
                    }}
                  >
                    {section.links.map((item) => (
                      <MenuItem
                        key={item.label}
                        component={Link}
                        to={item.to}
                        onClick={() => setMenuAnchor(null)}
                        sx={{
                          py: 1.2,
                          borderRadius: "9px",
                          fontSize: 12.5,
                          color: isActive(item.to) ? "#8052D6" : "#625A72",
                          "&:hover": { bgcolor: "#F5F0FF" },
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              ))}
            </Box>

            {!loading && !user && (
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  position: "relative",
                  overflow: "hidden",
                  px: 2.6,
                  py: 1.05,
                  borderRadius: "12px",
                  bgcolor: "#8052D6",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "0 5px 15px rgba(128,82,214,0.2)",
                  transition: "all 220ms ease",
                  "&:hover": {
                    bgcolor: "#6E43C1",
                    boxShadow: "0 8px 22px rgba(128,82,214,0.3)",
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "scale(0.97)",
                  },
                }}
              >
                Login
              </Button>
            )}
            {/* Account menu on the right, when logged in */}
            {!loading && user && (
              <>
                <Tooltip title="Account menu">
                  <IconButton
                    onClick={(event) =>
                      setMenuAnchor({
                        currentTarget: event.currentTarget,
                        section: "account",
                      })
                    }
                    aria-label="Open account menu"
                    sx={{
                      p: "3px",
                      flexShrink: 0,
                      border: "2px solid #E5D9FC",
                      borderRadius: "50%",
                      mr: { xs: 0.5, md: 0 },
                    }}
                  >
                    <Avatar
                      src={user.photoURL || undefined}
                      alt={user.displayName || "User"}
                      sx={{
                        width: { xs: 34, sm: 39 },
                        height: { xs: 34, sm: 39 },
                        bgcolor: "#8052D6",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {user.displayName?.charAt(0)?.toUpperCase() || "U"}
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
                  onClose={() => setMenuAnchor(null)}
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
                        width: 270,
                        maxWidth: "calc(100vw - 24px)",
                        border: "1px solid #EEE8F7",
                        borderRadius: "15px",
                        boxShadow: "0 12px 35px rgba(45,30,70,0.14)",
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.7 }}>
                    <Typography fontWeight={800} fontSize={14} noWrap>
                      {user.displayName || "URLINK User"}
                    </Typography>
                    <Typography fontSize={12} color="#898397" mt={0.4} noWrap>
                      {user.email}
                    </Typography>
                  </Box>

                  <Divider />

                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={() => setMenuAnchor(null)}
                  >
                    <DashboardRounded sx={{ mr: 1.3, fontSize: 19 }} />
                    Dashboard
                  </MenuItem>

                  <MenuItem onClick={handleLogout} sx={{ color: "#DC2626" }}>
                    <LogoutRounded sx={{ mr: 1.3, fontSize: 19 }} />
                    Sign out
                  </MenuItem>
                </Menu>
              </>
            )}

            {/* Hamburger menu on phones */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                flexShrink: 0,
                width: 39,
                height: 39,
                mr: { xs: 0.5, sm: 1 },
                color: "#5F526F",
                border: "1px solid #EEE8F7",
                borderRadius: "11px",
                "&:hover": { bgcolor: "#F5F0FF" },
              }}
            >
              <MenuRounded />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: {
              width: "min(330px, 88vw)",
              p: 2,
              bgcolor: "#FFFFFF",
              backgroundImage: "none",
            },
          },
        }}
      >
        <MotionBox
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <Box
              component={Link}
              to="/"
              onClick={closeDrawer}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box
                component="img"
                src="/urlink.png"
                alt="URLINK"
                sx={{
                  width: 155,
                  height: 43,
                  objectFit: "contain",
                  objectPosition: "left center",
                  pointerEvents: "none",
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

          <Divider sx={{ mb: 2 }} />

          <List disablePadding sx={{ flex: 1 }}>
            {sections.map((section) => {
              const isExpanded = expandedSection === section.title;

              return (
                <Box
                  key={section.title}
                  sx={{
                    mb: 1,
                    border: "1px solid",
                    borderColor: isExpanded ? "#DCCCF8" : "#F0ECF6",
                    borderRadius: "14px",
                    bgcolor: isExpanded ? "#FCFAFF" : "#FFFFFF",
                    overflow: "hidden",
                  }}
                >
                  <ListItemButton
                    onClick={() =>
                      setExpandedSection(isExpanded ? null : section.title)
                    }
                    aria-expanded={isExpanded}
                    sx={{
                      minHeight: 53,
                      px: 1.5,
                      gap: 1.3,
                      color: isExpanded ? "#8052D6" : "#302543",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        color: "#8052D6",
                        "& svg": { fontSize: 20 },
                      }}
                    >
                      {section.icon}
                    </Box>

                    <Typography
                      sx={{ flex: 1, fontSize: 13.5, fontWeight: 800 }}
                    >
                      {section.title}
                    </Typography>

                    <ExpandMoreRounded
                      sx={{
                        color: "#898397",
                        transform: isExpanded ? "rotate(180deg)" : "none",
                        transition: "transform 200ms ease",
                      }}
                    />
                  </ListItemButton>

                  <Collapse in={isExpanded} timeout={230} unmountOnExit>
                    <Box sx={{ px: 1.2, pb: 1.2 }}>
                      <Divider sx={{ mb: 0.7, borderColor: "#EEE8F7" }} />
                      <AnimatePresence initial={false}>
                        {section.links.map((item, index) => (
                          <MotionBox
                            key={item.label}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.18,
                              delay: index * 0.03,
                            }}
                          >
                            <Box
                              component={NavLink}
                              to={item.to}
                              onClick={closeDrawer}
                              sx={{
                                display: "block",
                                px: 1.5,
                                py: 1.1,
                                borderRadius: "9px",
                                color: isActive(item.to)
                                  ? "#8052D6"
                                  : "#716980",
                                bgcolor: isActive(item.to)
                                  ? "#F4EEFF"
                                  : "transparent",
                                textDecoration: "none",
                                fontSize: 12.5,
                                fontWeight: isActive(item.to) ? 800 : 550,
                                "&:hover": {
                                  bgcolor: "#F5F0FF",
                                  color: "#8052D6",
                                },
                              }}
                            >
                              {item.label}
                            </Box>
                          </MotionBox>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </List>

          {!loading && user && (
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
                  sx={{ width: 38, height: 38, bgcolor: "#8052D6" }}
                >
                  {user.displayName?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography fontSize={13} fontWeight={800} noWrap>
                    {user.displayName || "URLINK User"}
                  </Typography>
                  <Typography fontSize={11} color="#898397" noWrap>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Box
                component={Link}
                to="/admin"
                onClick={closeDrawer}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.3,
                  mb: 0.8,
                  borderRadius: "11px",
                  color: "#8052D6",
                  bgcolor: "#F5F0FF",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 750,
                }}
              >
                <DashboardRounded fontSize="small" />
                Dashboard
              </Box>

              <Box
                component="button"
                type="button"
                onClick={handleLogout}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.3,
                  border: 0,
                  borderRadius: "11px",
                  color: "#DC2626",
                  bgcolor: "transparent",
                  font: "inherit",
                  fontSize: 13,
                  fontWeight: 750,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#FFF1F2" },
                }}
              >
                <LogoutRounded fontSize="small" />
                Sign out
              </Box>
            </Box>
          )}

          {(!user || loading) && (
            <Box sx={{ mt: "auto", pt: 2 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#A09AAF",
                  fontSize: 11,
                }}
              >
                <HomeRounded
                  sx={{ fontSize: 13, verticalAlign: "middle", mr: 0.5 }}
                />
                {!loading && !user && (
                  <Button
                    component={Link}
                    to="/login"
                    fullWidth
                    variant="contained"
                    onClick={closeDrawer}
                    endIcon={<ArrowForwardRounded />}
                    sx={{
                      mb: 2,
                      py: 1.3,
                      borderRadius: "12px",
                      bgcolor: "#8052D6",
                      color: "#FFFFFF",
                      fontSize: 13,
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "0 5px 15px rgba(128,82,214,0.2)",
                      "&:hover": {
                        bgcolor: "#6E43C1",
                        boxShadow: "0 8px 20px rgba(128,82,214,0.25)",
                      },
                      "&:active": {
                        transform: "scale(0.98)",
                      },
                    }}
                  >
                    Login
                  </Button>
                )}
                Discover what&apos;s useful.
              </Typography>
            </Box>
          )}
        </MotionBox>
      </Drawer>
    </>
  );
}

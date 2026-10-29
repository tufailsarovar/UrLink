
import { useState } from "react";
import {
  Box, Container, Divider, IconButton, Link as MuiLink,
  Stack, Typography, Collapse,
} from "@mui/material";
import {
  ExpandMoreRounded, HomeRounded, ExploreRounded,
  InfoOutlined, GavelRounded, ContactSupportOutlined,
  KeyboardArrowUpRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, useLocation } from "react-router-dom";

const MotionBox = motion.create(Box);
const BORDER = "rgba(24,24,27,0.10)";
const MUTED = "#71717A";

const footerSections = [
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

export default function Footer() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(null);
  const currentYear = new Date().getFullYear();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  const toggleSection = (title) =>
    setExpanded((previous) => previous === title ? null : title);

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "#FFFFFF",
        color: "#18181B",
        borderTop: `1px solid ${BORDER}`,
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          display: "block",
          height: "2px",
          background:
            "linear-gradient(90deg,transparent,#18181B,#A1A1AA,#18181B,transparent)",
          backgroundSize: "200% 100%",
          animation: "footerShimmer 7s linear infinite",
        },
        "@keyframes footerShimmer": {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.08 }}
          transition={{ duration: 0.45 }}
          sx={{
            py: { xs: 2.5, sm: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0,1fr)",
              md: "minmax(0,1.05fr) minmax(0,1.95fr)",
            },
            gap: { xs: 2.5, sm: 3.5, md: 6 },
          }}
        >
          {/* Brand: round logo + name logo */}
          <Box sx={{ minWidth: 0, maxWidth: 370 }}>
            <Box
              component={RouterLink}
              to="/"
              aria-label="URLINK home"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.25 },
                textDecoration: "none",
                borderRadius: 2,
              }}
            >

              <Box
                component="img"
                src="/urlink_name.png"
                alt="URLINK"
                sx={{
                  display: "block",
                  width: { xs: 108, sm: 138, md: 148 },
                  height: { xs: 31, sm: 38 },
                  maxWidth: "calc(100% - 45px)",
                  objectFit: "contain",
                  objectPosition: "left center",
                }}
              />
            </Box>

            <Typography
              sx={{
                mt: 1.4,
                maxWidth: 350,
                color: MUTED,
                fontSize: { xs: 11.5, sm: 12.5, md: 13 },
                lineHeight: 1.85,
                overflowWrap: "anywhere",
              }}
            >
              Discover useful tools, AI resources, open-source
              projects, websites, and career opportunities — all
              in one place.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.8}
              sx={{ mt: 1.5, color: "#27272A" }}
            >
              <HomeRounded sx={{ fontSize: 16, flexShrink: 0 }} />
              <Typography sx={{ fontSize: { xs: 10.5, sm: 11.5 }, fontWeight: 700 }}>
                Your directory for discovering more
              </Typography>
            </Stack>
          </Box>

          {/* Expandable navigation */}
          <Box
            sx={{
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0,1fr)",
                sm: "repeat(2,minmax(0,1fr))",
              },
              columnGap: { sm: 2, md: 3 },
              rowGap: { xs: 0, sm: 1.2 },
              alignContent: "start",
            }}
          >
            {footerSections.map((section, sectionIndex) => {
              const open = expanded === section.title;
              const active = section.links.some((item) =>
                isActive(item.to)
              );

              return (
                <MotionBox
                  key={section.title}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{
                    duration: 0.3,
                    delay: sectionIndex * 0.05,
                  }}
                  sx={{
                    minWidth: 0,
                    alignSelf: "start",
                    overflow: "hidden",
                    borderBottom: {
                      xs: `1px solid ${BORDER}`,
                      sm: "none",
                    },
                    borderRadius: { sm: "12px" },
                    bgcolor: { sm: "#FAFAFA" },
                    "&:hover": { bgcolor: { sm: "#F4F4F5" } },
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    aria-expanded={open}
                    aria-controls={`footer-${section.title.toLowerCase()}`}
                    onClick={() => toggleSection(section.title)}
                    sx={{
                      width: "100%",
                      minHeight: { xs: 46, sm: 49 },
                      border: 0,
                      px: { xs: 0.2, sm: 1.2 },
                      py: 1.1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      textAlign: "left",
                      cursor: "pointer",
                      bgcolor: "transparent",
                      color: active || open ? "#18181B" : "#3F3F46",
                      font: "inherit",
                      "&:hover": { color: "#000000" },
                      "&:focus-visible": {
                        outline: "2px solid #18181B",
                        outlineOffset: -2,
                        borderRadius: 2,
                      },
                    }}
                  >
                    <Box sx={{ display: "grid", placeItems: "center", "& svg": { fontSize: 19 } }}>
                      {section.icon}
                    </Box>

                    <Typography sx={{ flex: 1, fontSize: { xs: 12, sm: 12.5 }, fontWeight: 800 }}>
                      {section.title}
                    </Typography>

                    <ExpandMoreRounded
                      sx={{
                        fontSize: 19,
                        color: MUTED,
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 220ms ease",
                      }}
                    />
                  </Box>

                  <Collapse in={open} timeout={220} unmountOnExit>
                    <Box
                      id={`footer-${section.title.toLowerCase()}`}
                      sx={{ pb: 1.1, pl: { xs: 3.3, sm: 3.6 }, pr: 1 }}
                    >
                      <AnimatePresence initial={false}>
                        {section.links.map((item, index) => (
                          <MotionBox
                            key={`${item.to}-${item.label}`}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.17, delay: index * 0.025 }}
                          >
                            <MuiLink
                              component={RouterLink}
                              to={item.to}
                              underline="none"
                              onClick={() => setExpanded(null)}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 1,
                                py: 0.85,
                                color: isActive(item.to) ? "#111111" : MUTED,
                                fontSize: { xs: 11.5, sm: 12 },
                                fontWeight: isActive(item.to) ? 800 : 500,
                                lineHeight: 1.5,
                                transition: "color 160ms ease, transform 160ms ease",
                                "&:hover": {
                                  color: "#000000",
                                  transform: "translateX(3px)",
                                },
                              }}
                            >
                              {item.label}
                              {isActive(item.to) && (
                                <Box
                                  component="span"
                                  sx={{
                                    width: 5,
                                    height: 5,
                                    flexShrink: 0,
                                    borderRadius: "50%",
                                    bgcolor: "#18181B",
                                  }}
                                />
                              )}
                            </MuiLink>
                          </MotionBox>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </Collapse>
                </MotionBox>
              );
            })}
          </Box>
        </MotionBox>

        <Divider sx={{ borderColor: BORDER }} />

        {/* Copyright and bottom links */}
        <Box
          sx={{
            py: { xs: 1.6, sm: 2 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.2,
          }}
        >
          <Typography sx={{ fontSize: { xs: 10.5, sm: 11.5 }, color: MUTED }}>
            © {currentYear} URLINK. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={{ xs: 1, sm: 1.4 }}
            sx={{ minWidth: 0, maxWidth: "100%", width: { xs: "100%", sm: "auto" } }}
          >
            <MuiLink
              component={RouterLink}
              to="/terms"
              underline="none"
              sx={{ fontSize: { xs: 10.5, sm: 11.5 }, color: MUTED, "&:hover": { color: "#000" } }}
            >
              Terms
            </MuiLink>

            <Box sx={{ color: "#D4D4D8", fontSize: 10 }}>•</Box>

            <MuiLink
              component={RouterLink}
              to="/privacy"
              underline="none"
              sx={{ fontSize: { xs: 10.5, sm: 11.5 }, color: MUTED, "&:hover": { color: "#000" } }}
            >
              Privacy
            </MuiLink>

            <Box sx={{ color: "#D4D4D8", fontSize: 10 }}>•</Box>

            <Typography sx={{ fontSize: { xs: 10.5, sm: 11.5 }, color: MUTED }}>
              Made for curious minds.
            </Typography>

            <IconButton
              size="small"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{
                ml: { xs: "auto", sm: 0.5 },
                width: 31,
                height: 31,
                color: "#FFFFFF",
                bgcolor: "#18181B",
                "&:hover": {
                  bgcolor: "#3F3F46",
                  transform: "translateY(-2px)",
                },
                transition: "all 180ms ease",
              }}
            >
              <KeyboardArrowUpRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

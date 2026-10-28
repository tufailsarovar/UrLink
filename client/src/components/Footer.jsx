
import { useState } from "react";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
  Collapse,
} from "@mui/material";
import {
  ExpandMoreRounded,
  HomeRounded,
  ExploreRounded,
  InfoOutlined,
  GavelRounded,
  PrivacyTipOutlined,
  ContactSupportOutlined,
  ReportProblemOutlined,
  KeyboardArrowUpRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, useLocation } from "react-router-dom";

const MotionBox = motion(Box);

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
      { label: "About urlink", to: "/about" },
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
  const currentYear = new Date().getFullYear();
  const [expanded, setExpanded] = useState(null);

  const toggleSection = (title) => {
    setExpanded((previous) => (previous === title ? null : title));
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: "#FFFFFF",
        color: "#241A38",
        borderTop: "1px solid #EEEAF5",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.25fr 2fr" },
            gap: { xs: 3, md: 6 },
          }}
        >
          {/* Brand */}
          <Box sx={{ maxWidth: 390 }}>
            <MuiLink
              component={RouterLink}
              to="/"
              underline="none"
              aria-label="urlink home"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                color: "#241A38",
                fontSize: 29,
                fontWeight: 900,
                letterSpacing: "-1.5px",
                transition: "transform .2s ease",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              urlink
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg,#8052D6,#B36BEA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                .
              </Box>
            </MuiLink>

            <Typography
              sx={{
                mt: 1.2,
                maxWidth: 350,
                color: "#898397",
                fontSize: { xs: 12.5, sm: 13 },
                lineHeight: 1.9,
              }}
            >
              Discover useful tools, AI resources, open-source projects,
              websites, and career opportunities — all in one place.
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                mt: 2.3,
                color: "#8052D6",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <HomeRounded sx={{ fontSize: 17 }} />
              <Typography sx={{ color: "inherit", fontSize: "inherit" }}>
                Your directory for discovering more
              </Typography>
            </Stack>
          </Box>

          {/* Animated navigation sections */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              alignContent: "start",
              gap: { xs: 0, sm: 2 },
            }}
          >
            {footerSections.map((section) => {
              const isExpanded = expanded === section.title;

              return (
                <Box
                  key={section.title}
                  sx={{
                    minWidth: 0,
                    borderBottom: { xs: "1px solid #F0ECF6", sm: "none" },
                    borderRadius: { sm: 2 },
                    bgcolor: { sm: "#FCFBFE" },
                    mb: { sm: 1 },
                    px: { xs: 0, sm: 1.2 },
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`footer-${section.title.toLowerCase()}`}
                    onClick={() => toggleSection(section.title)}
                    sx={{
                      width: "100%",
                      border: 0,
                      p: { xs: "15px 2px", sm: "13px 5px" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      textAlign: "left",
                      cursor: "pointer",
                      bgcolor: "transparent",
                      color: "#302543",
                      font: "inherit",
                      "&:hover": { color: "#8052D6" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        color: "#8052D6",
                        "& svg": { fontSize: 19 },
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
                        color: "#898397",
                        fontSize: 20,
                        transform: isExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform .25s ease",
                      }}
                    />
                  </Box>

                  <Collapse
                    in={isExpanded}
                    timeout={250}
                    unmountOnExit
                  >
                    <Box
                      id={`footer-${section.title.toLowerCase()}`}
                      sx={{ pb: 1.5, pl: { xs: 3.8, sm: 3.5 } }}
                    >
                      <AnimatePresence initial={false}>
                        {section.links.map((item, index) => (
                          <MotionBox
                            key={item.to + item.label}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.18,
                              delay: index * 0.035,
                            }}
                          >
                            <MuiLink
                              component={RouterLink}
                              to={item.to}
                              underline="none"
                              onClick={() => setExpanded(null)}
                              sx={{
                                display: "block",
                                py: 0.9,
                                color:
                                  location.pathname === item.to
                                    ? "#8052D6"
                                    : "#777187",
                                fontSize: 12.5,
                                fontWeight:
                                  location.pathname === item.to ? 750 : 500,
                                transition:
                                  "color .18s ease, transform .18s ease",
                                "&:hover": {
                                  color: "#8052D6",
                                  transform: "translateX(3px)",
                                },
                              }}
                            >
                              {item.label}
                            </MuiLink>
                          </MotionBox>
                        ))}
                      </AnimatePresence>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ borderColor: "#F0ECF6" }} />

        {/* Bottom bar */}
        <Box
          sx={{
            py: 2.2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 11.5, color: "#A09AAF" }}>
            © {currentYear} urlink. All rights reserved.
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            gap={1.5}
          >
            <MuiLink
              component={RouterLink}
              to="/terms"
              underline="none"
              sx={{
                fontSize: 11.5,
                color: "#898397",
                "&:hover": { color: "#8052D6" },
              }}
            >
              Terms
            </MuiLink>

            <Box sx={{ color: "#D6D0E1" }}>•</Box>

            <MuiLink
              component={RouterLink}
              to="/privacy"
              underline="none"
              sx={{
                fontSize: 11.5,
                color: "#898397",
                "&:hover": { color: "#8052D6" },
              }}
            >
              Privacy
            </MuiLink>

            <Box sx={{ color: "#D6D0E1" }}>•</Box>

            <Typography sx={{ fontSize: 11.5, color: "#A09AAF" }}>
              Made for curious minds.
            </Typography>

            <IconButton
              size="small"
              aria-label="Back to top"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              sx={{
                ml: { sm: 0.5 },
                color: "#8052D6",
                bgcolor: "#F5F0FC",
                "&:hover": { bgcolor: "#EDE4FB" },
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

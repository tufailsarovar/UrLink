import { Box, Button, Container, Stack, Typography } from "@mui/material";
import {
  ArrowBackRounded,
  HomeRounded,
  SearchOffRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FAFAFE",
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Stack alignItems="center" textAlign="center" spacing={2}>
            <Box
              sx={{
                width: 100,
                height: 100,
                display: "grid",
                placeItems: "center",
                borderRadius: "28px",
                bgcolor: "#F0ECFF",
                color: "#6C4CF1",
              }}
            >
              <SearchOffRounded sx={{ fontSize: 53 }} />
            </Box>

            <Typography
              sx={{
                fontSize: { xs: 76, sm: 100 },
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -5,
                color: "#6C4CF1",
              }}
            >
              404
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 22, sm: 27 },
                fontWeight: 850,
                color: "#17152B",
              }}
            >
              Page not found
            </Typography>

            <Typography
              sx={{
                maxWidth: 380,
                fontSize: 13,
                lineHeight: 1.9,
                color: "#78839A",
              }}
            >
              The page you're looking for may have moved, been removed, or
              doesn't exist. Let's get you back to urlink.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.2}
              sx={{ width: { xs: "100%", sm: "auto" }, pt: 1 }}
            >
              <Button
                variant="contained"
                startIcon={<HomeRounded />}
                onClick={() => navigate("/")}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: "11px",
                  bgcolor: "#6C4CF1",
                  textTransform: "none",
                  fontWeight: 750,
                  "&:hover": { bgcolor: "#5033CC" },
                }}
              >
                Go to homepage
              </Button>

              <Button
                variant="outlined"
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate(-1)}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: "11px",
                  borderColor: "#E2E8F0",
                  color: "#475569",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#C4B5FD",
                    bgcolor: "#F5F3FF",
                  },
                }}
              >
                Go back
              </Button>
            </Stack>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
}

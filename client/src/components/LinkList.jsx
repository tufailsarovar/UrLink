import { memo } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  SearchOffRounded,
  RefreshRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";
import { AnimatePresence, motion } from "framer-motion";
import LinkRow from "./LinkRow.jsx";
import Loader from "./Loader.jsx";

const MotionBox = motion.create(Box);

function LinkList({
  links = [],
  loading = false,
  error = "",
  onRetry,
  onClearFilters,
  emptyTitle = "No resources found",
  emptyDescription = "Try another search term or change your filters.",
  showCompany = true,
  showDate = true,
  showDescription = true,
  compact = false,
  skeletonCount = 8,
}) {
  const safeLinks = Array.isArray(links) ? links : [];

  if (loading && safeLinks.length === 0) {
    return <Loader variant="row" count={skeletonCount} />;
  }

  if (error && safeLinks.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          px: 2,
          py: { xs: 4, sm: 5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          bgcolor: "#FFFFFF",
          border: "1px solid #FEE2E2",
          borderRadius: "18px",
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            mb: 1.5,
            display: "grid",
            placeItems: "center",
            borderRadius: "16px",
            bgcolor: "#FEF2F2",
            color: "#DC2626",
          }}
        >
          <RefreshRounded sx={{ fontSize: 27 }} />
        </Box>

        <Typography
          component="h3"
          sx={{ fontSize: 16, fontWeight: 800, color: "#211D37" }}
        >
          Unable to load resources
        </Typography>

        <Typography
          sx={{
            mt: 0.7,
            maxWidth: 400,
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "#64748B",
            overflowWrap: "anywhere",
          }}
        >
          {error}
        </Typography>

        {onRetry && (
          <Button
            variant="contained"
            startIcon={<RefreshRounded />}
            onClick={onRetry}
            sx={{
              mt: 2,
              px: 2.5,
              borderRadius: "10px",
              bgcolor: "#7554F4",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#5D3BDD" },
            }}
          >
            Try again
          </Button>
        )}
      </MotionBox>
    );
  }

  if (safeLinks.length === 0) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          py: { xs: 4, sm: 6 },
          px: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          bgcolor: "#FFFFFF",
          border: "1px dashed #DCD5F8",
          borderRadius: "18px",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            display: "grid",
            placeItems: "center",
            borderRadius: "17px",
            bgcolor: "#F2EEFF",
            color: "#7554F4",
            mb: 1.5,
          }}
        >
          <SearchOffRounded sx={{ fontSize: 29 }} />
        </Box>

        <Typography
          component="h3"
          sx={{
            fontSize: { xs: 16, sm: 18 },
            fontWeight: 850,
            color: "#211D37",
          }}
        >
          {emptyTitle}
        </Typography>

        <Typography
          sx={{
            mt: 0.7,
            maxWidth: 390,
            fontSize: 12.5,
            lineHeight: 1.7,
            color: "#78839A",
          }}
        >
          {emptyDescription}
        </Typography>

        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outlined"
            sx={{
              mt: 1.75,
              borderRadius: "10px",
              borderColor: "#DCD2FF",
              color: "#7554F4",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#A78BFA",
                bgcolor: "#F7F4FF",
              },
            }}
          >
            Clear filters
          </Button>
        )}
      </MotionBox>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {loading && (
        <Box
          sx={{
            height: 3,
            width: "100%",
            mb: 1.25,
            borderRadius: 99,
            bgcolor: "#EDE9FE",
            overflow: "hidden",
          }}
          role="status"
          aria-label="Refreshing resources"
        >
          <Box
            component={motion.div}
            animate={{ x: ["-100%", "250%"] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            sx={{
              width: "40%",
              height: "100%",
              borderRadius: 99,
              bgcolor: "#7554F4",
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1, sm: 1.5, md: 1.75 },
          alignItems: "stretch",
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {safeLinks.map((link, index) => {
            const id = link?._id || link?.id || link?.url;
            if (!id) return null;

            return (
              <MotionBox
                key={String(id)}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index * 0.025, 0.18),
                  layout: { duration: 0.22 },
                }}
                sx={{
                  minWidth: 0,
                  display: "flex",
                  alignSelf: "stretch",
                }}
              >
                <LinkRow
                  link={link}
                  index={index}
                  showCompany={showCompany}
                  showDate={showDate}
                  showDescription={showDescription}
                  compact={compact}
                />
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.65,
        }}
      >
        <AutoAwesomeRounded sx={{ fontSize: 13, color: "#A78BFA" }} />
        <Typography
          sx={{
            fontSize: 10.5,
            color: "#959BB0",
            textAlign: "center",
          }}
        >
          Showing {safeLinks.length} resource
          {safeLinks.length === 1 ? "" : "s"}
        </Typography>
      </Box>
    </Box>
  );
}

export default memo(LinkList);

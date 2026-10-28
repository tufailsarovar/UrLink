import { memo } from "react";
import {
  Box,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

function Loader({
  variant = "page",
  count = 5,
  message = "Loading resources...",
  minHeight = 180,
}) {
  const safeCount = Math.min(20, Math.max(1, Math.floor(Number(count) || 5)));

  if (variant === "row") {
    return (
      <Stack spacing={1.5} sx={{ width: "100%" }}>
        {Array.from({ length: safeCount }, (_, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: { xs: 1.5, sm: 2 },
              border: "1px solid #EEF0F6",
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
            }}
          >
            <Skeleton
              variant="rounded"
              width={42}
              height={42}
              sx={{ flexShrink: 0, borderRadius: "12px" }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="58%" height={22} />
              <Skeleton variant="text" width="88%" height={18} />
              <Skeleton variant="text" width="32%" height={16} />
            </Box>
            <Skeleton
              variant="rounded"
              width={64}
              height={30}
              sx={{ display: { xs: "none", sm: "block" }, borderRadius: 2 }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

  if (variant === "card") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          width: "100%",
        }}
      >
        {Array.from({ length: safeCount }, (_, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              border: "1px solid #EEF0F6",
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
            }}
          >
            <Skeleton
              variant="rounded"
              width={48}
              height={48}
              sx={{ mb: 1.5, borderRadius: "13px" }}
            />
            <Skeleton variant="text" width="68%" height={25} />
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="82%" height={18} />
            <Skeleton
              variant="rounded"
              width={92}
              height={30}
              sx={{ mt: 1.5, borderRadius: 2 }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === "inline") {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={1.2}
        sx={{ minHeight: 48, width: "100%" }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={19} thickness={4} />
        <Typography sx={{ fontSize: 13, color: "#64748B" }}>
          {message}
        </Typography>
      </Stack>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      sx={{
        width: "100%",
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        py: 4,
      }}
      role="status"
      aria-live="polite"
    >
      <Box
        sx={{
          width: 54,
          height: 54,
          display: "grid",
          placeItems: "center",
          borderRadius: "17px",
          bgcolor: "#F5F3FF",
        }}
      >
        <CircularProgress size={27} thickness={4} sx={{ color: "#6C4CF1" }} />
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 650,
          color: "#64748B",
          textAlign: "center",
        }}
      >
        {message}
      </Typography>
    </MotionBox>
  );
}

export default memo(Loader);

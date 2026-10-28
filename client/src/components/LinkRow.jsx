import { memo } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArticleOutlined,
  BusinessRounded,
  LocationOnOutlined,
  CalendarTodayRounded,
  LaunchRounded,
  ArrowOutwardRounded,
  AutoAwesomeRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatRelativeDate } from "../utils/formatDate.js";
import CopyButton from "./CopyButton.jsx";
import ShareButton from "./ShareButton.jsx";

const MotionBox = motion.create(Box);

function getSafeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function getInitials(value = "") {
  return (
    String(value)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "R"
  );
}

function renderDescription(text) {
  return String(text)
    .split(/(\*\*[\s\S]+?\*\*)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <Box
          component="strong"
          key={index}
          sx={{ color: "#30204D", fontWeight: 800 }}
        >
          {part.slice(2, -2)}
        </Box>
      ) : (
        part
      ),
    );
}

function LinkRowComponent({
  link,
  index = 0,
  showCompany = true,
  showDate = true,
  showDescription = true,
  compact = false,
}) {
  const navigate = useNavigate();

  const safeUrl = getSafeExternalUrl(link?.url);
  const title = link?.title || "Untitled resource";
  const description = link?.description || "";

  const category =
    typeof link?.category === "object" ? link.category?.name : link?.category;

  const companyName = link?.companyName || link?.company || "";
  const location = link?.address || link?.location || "";
  const publishedDate = link?.publishedAt || link?.createdAt;
  const resourceId = link?._id || link?.id;

  const hostname = safeUrl
    ? new URL(safeUrl).hostname.replace(/^www\./i, "")
    : "";

  const shareUrl = resourceId
    ? `${window.location.origin}/resource/${encodeURIComponent(resourceId)}`
    : "";

  const handleOpen = () => {
    if (safeUrl) {
      window.open(safeUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleOpenDetails = () => {
    if (resourceId) {
      navigate(`/resource/${encodeURIComponent(resourceId)}`);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.035, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        p: { xs: 1.25, sm: 1.75 },
        overflow: "hidden",
        border: "1px solid #E5DDF5",
        borderRadius: { xs: "14px", sm: "18px" },
        bgcolor: "#FFFFFF",
        boxShadow: "0 3px 12px rgba(45,30,75,0.035)",
        transition:
          "border-color 220ms ease, box-shadow 220ms ease, background 220ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "12%",
          width: "76%",
          height: "2px",
          borderRadius: 99,
          bgcolor: "#8B5CF6",
          opacity: 0,
          transform: "scaleX(0.5)",
          transition: "opacity 220ms ease, transform 220ms ease",
        },
        "&:hover": {
          borderColor: "#BBA4F5",
          boxShadow: "0 12px 28px rgba(91,60,160,0.11)",
          "&::before": {
            opacity: 1,
            transform: "scaleX(1)",
          },
          "& .resource-icon": {
            transform: "scale(1.05) rotate(-2deg)",
          },
          "& .resource-title": {
            color: "#7042D8",
          },
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": {
            transform: "none",
          },
        },
      }}
    >
      {/* Logo and category */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ minWidth: 0 }}
      >
        <Avatar
          src={link?.logoUrl || undefined}
          alt={`${title} logo`}
          variant="rounded"
          className="resource-icon"
          imgProps={{ loading: "lazy" }}
          sx={{
            width: { xs: 38, sm: 44 },
            height: { xs: 38, sm: 44 },
            flexShrink: 0,
            borderRadius: "12px",
            bgcolor: "#F0E9FF",
            color: "#7552C5",
            border: "1px solid #E3D8FA",
            fontSize: 13,
            fontWeight: 800,
            transition: "transform 220ms ease",
          }}
        >
          {getInitials(companyName || title)}
        </Avatar>

        {category && (
          <Chip
            label={category}
            size="small"
            sx={{
              maxWidth: "68%",
              height: 25,
              borderRadius: "8px",
              bgcolor: "#F5F0FF",
              border: "1px solid #E5D9FF",
              color: "#7042C5",
              fontSize: { xs: 9, sm: 10 },
              fontWeight: 750,
              "& .MuiChip-label": {
                px: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />
        )}
      </Stack>

      {/* Resource title */}
      <Typography
        component="h3"
        className="resource-title"
        sx={{
          mt: 0.5,
          mb: 0,
          fontSize: { xs: 13, sm: 15 },
          fontWeight: 850,
          lineHeight: 1.4,
          letterSpacing: "-0.25px",
          color: "#261D39",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          transition: "color 180ms ease",
        }}
      >
        {title}
      </Typography>

      {/* Description: 1 line on mobile, 2 lines on larger screens */}
      {showDescription && description && !compact && (
        <Typography
          component="div"
          sx={{
            mt: 0.2,
            color: "#746D84",
            fontSize: { xs: 11, sm: 12 },
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: { xs: 1, sm: 2 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            overflowWrap: "anywhere",
            minHeight: 0,
            "& strong": {
              color: "#30204D",
              fontWeight: 800,
            },
          }}
        >
          {renderDescription(description)}
        </Typography>
      )}

      {/* Resource details */}
      <Stack spacing={0.65} sx={{ mt: 1, minWidth: 0 }}>
        {showCompany && companyName && (
          <Stack direction="row" alignItems="center" spacing={0.7}>
            <BusinessRounded
              sx={{ fontSize: 14, color: "#9387AD", flexShrink: 0 }}
            />
            <Typography
              sx={{
                minWidth: 0,
                fontSize: 10.5,
                color: "#6F687F",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {companyName}
            </Typography>
          </Stack>
        )}

        {location && (
          <Stack direction="row" alignItems="center" spacing={0.7}>
            <LocationOnOutlined
              sx={{ fontSize: 14, color: "#9387AD", flexShrink: 0 }}
            />
            <Typography
              sx={{
                minWidth: 0,
                fontSize: 10.5,
                color: "#6F687F",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {location}
            </Typography>
          </Stack>
        )}

        {showDate && publishedDate && (
          <Stack direction="row" alignItems="center" spacing={0.7}>
            <CalendarTodayRounded
              sx={{ fontSize: 14, color: "#9387AD", flexShrink: 0 }}
            />
            <Typography sx={{ fontSize: 10.5, color: "#837B96" }}>
              {formatRelativeDate(publishedDate)}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Website address */}
      {safeUrl && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.65}
          sx={{
            minWidth: 0,
            mt: 1,
            mb: 0.5,
            px: 0.9,
            py: 0.75,
            borderRadius: "10px",
            bgcolor: "#FAF8FF",
            border: "1px solid #E8DFF8",
            transition: "background 180ms ease, border-color 180ms ease",
            "&:hover": {
              bgcolor: "#F4EFFF",
              borderColor: "#D5C4FA",
            },
          }}
        >
          <AutoAwesomeRounded
            sx={{ fontSize: 14, color: "#9079C8", flexShrink: 0 }}
          />

          <Typography
            component="a"
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              flex: 1,
              minWidth: 0,
              color: "#7460B0",
              fontSize: 11,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {hostname}
          </Typography>

          <ArrowOutwardRounded
            sx={{ fontSize: 15, color: "#A69ACF", flexShrink: 0 }}
          />
        </Stack>
      )}

      {/* Actions */}
      <Box sx={{ flexGrow: 1, minHeight: 8 }} />

      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 0.5, sm: 0.7 }}
        sx={{
          minWidth: 0,
          pt: 1,
          mt: 1,
          borderTop: "1px solid #EEE8F7",
          "& > *": { minWidth: 0 },
        }}
      >
        {safeUrl ? (
          <Button
            fullWidth
            onClick={handleOpen}
            variant="contained"
            endIcon={<LaunchRounded />}
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              minHeight: { xs: 35, sm: 38 },
              px: { xs: 0.5, sm: 1 },
              borderRadius: "10px",
              bgcolor: "#8052D6",
              boxShadow: "none",
              textTransform: "none",
              fontSize: { xs: 10, sm: 11.5 },
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              transition: "background 180ms ease, transform 180ms ease",
              "& .MuiButton-endIcon": {
                ml: { xs: 0.3, sm: 0.7 },
                mr: 0,
                flexShrink: 0,
                "& svg": {
                  fontSize: { xs: 13, sm: 15 },
                },
              },
              "&:hover": {
                bgcolor: "#6D43C1",
                boxShadow: "0 5px 12px rgba(108,76,241,0.2)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Box
              component="span"
              sx={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Visit resource
            </Box>
          </Button>
        ) : (
          <Typography sx={{ flex: 1, color: "#DC2626", fontSize: 11 }}>
            Invalid URL
          </Typography>
        )}

        <Box sx={{ flexShrink: 0, display: "flex" }}>
          <CopyButton url={shareUrl} />
        </Box>

        <Box sx={{ flexShrink: 0, display: "flex" }}>
          <ShareButton
            url={shareUrl}
            title={title}
            description={description}
            disabled={!shareUrl}
          />
        </Box>

        {/* Rightmost button opens internal resource details */}
        <Box sx={{ flexShrink: 0, display: "flex" }}>
          <IconButton
            onClick={handleOpenDetails}
            disabled={!resourceId}
            aria-label={`Open details: ${title}`}
            title="Open resource details"
            sx={{
              width: { xs: 34, sm: 36 },
              height: { xs: 34, sm: 36 },
              p: 0,
              border: "1px solid #CDBAF8",
              borderRadius: "10px",
              color: "#7552C5",
              bgcolor: "#F5F0FF",
              transition: "background 180ms ease, transform 180ms ease",
              "&:hover": {
                bgcolor: "#EDE4FF",
                borderColor: "#BCA5EB",
                transform: "translateY(-1px)",
              },
              "&.Mui-disabled": {
                opacity: 0.45,
              },
            }}
          >
            <ArticleOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Stack>
    </MotionBox>
  );
}

export default memo(LinkRowComponent);

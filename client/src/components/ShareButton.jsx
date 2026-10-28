import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  ShareRounded,
  ContentCopyRounded,
  WhatsApp,
  EmailRounded,
  OpenInNewRounded,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const MotionIconButton = motion.create(IconButton);

export default function ShareButton({
  url,
  title = "Share link",
  description = "",
  size = "small",
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const getShareUrl = () => {
    if (!url || typeof url !== "string") return "";

    try {
      const parsed = new URL(url, window.location.origin);

      if (!["http:", "https:"].includes(parsed.protocol)) return "";

      return parsed.href;
    } catch {
      return "";
    }
  };

  const getShareText = () => [title, description].filter(Boolean).join(" — ");

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();

    if (!shareUrl) {
      toast.error("No valid share link available.");
      return;
    }

    setAnchorEl(null);

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: getShareText(),
          url: shareUrl,
        });
      } catch (error) {
        if (error?.name !== "AbortError") {
          toast.error("Unable to share this link.");
        }
      }
      return;
    }

    await handleCopy(shareUrl);
  };

  const handleCopy = async (providedUrl) => {
    const shareUrl = providedUrl || getShareUrl();

    if (!shareUrl) {
      toast.error("No valid link available to copy.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");
        textarea.remove();

        if (!copied) throw new Error("Copy failed");
      }

      toast.success("urlink share link copied.");
    } catch {
      toast.error("Unable to copy the link.");
    }

    setAnchorEl(null);
  };

  const handleWhatsApp = () => {
    const shareUrl = getShareUrl();

    if (!shareUrl) {
      toast.error("No valid share link available.");
      return;
    }

    const message = `${getShareText()}\n${shareUrl}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );

    setAnchorEl(null);
  };

  const handleEmail = () => {
    const shareUrl = getShareUrl();

    if (!shareUrl) {
      toast.error("No valid share link available.");
      return;
    }

    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${getShareText()}\n\n${shareUrl}`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setAnchorEl(null);
  };

  const handleOpen = () => {
    const shareUrl = getShareUrl();

    if (!shareUrl) {
      toast.error("No valid link available.");
      return;
    }

    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Share urlink resource">
        <span>
          <MotionIconButton
            type="button"
            size={size}
            aria-label="Share urlink resource"
            aria-haspopup="menu"
            aria-expanded={isOpen ? "true" : undefined}
            disabled={disabled}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            whileTap={{ scale: 0.92 }}
            sx={{
              width: 36,
              height: 36,
              p: 0,
              border: "1px solid #DCD3EF",
              borderRadius: "10px",
              bgcolor: "#FFFFFF",
              color: "#7554C8",
              "&:hover": {
                bgcolor: "#F4EEFF",
                borderColor: "#BCA6EC",
                color: "#6842BD",
              },
              "&.Mui-disabled": {
                borderColor: "#EAE6F1",
                color: "#C8C1D4",
              },
            }}
          >
            <ShareRounded fontSize="small" />
          </MotionIconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.8,
              minWidth: 220,
              p: 0.6,
              border: "1px solid #DED5EF",
              borderRadius: "13px",
              boxShadow: "0 12px 30px rgba(48, 31, 78, 0.12)",
              "& .MuiMenuItem-root": {
                minHeight: 40,
                px: 1.3,
                borderRadius: "8px",
                fontSize: 12.5,
                gap: 0.5,
              },
              "& .MuiListItemIcon-root": {
                minWidth: 32,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleNativeShare}>
          <ListItemIcon>
            <ShareRounded fontSize="small" sx={{ color: "#8052D6" }} />
          </ListItemIcon>
          <ListItemText primary="Share urlink page" />
        </MenuItem>

        <MenuItem onClick={() => handleCopy()}>
          <ListItemIcon>
            <ContentCopyRounded fontSize="small" sx={{ color: "#6B6480" }} />
          </ListItemIcon>
          <ListItemText primary="Copy urlink link" />
        </MenuItem>

        <MenuItem onClick={handleWhatsApp}>
          <ListItemIcon>
            <WhatsApp fontSize="small" sx={{ color: "#16A34A" }} />
          </ListItemIcon>
          <ListItemText primary="Share on WhatsApp" />
        </MenuItem>

        <MenuItem onClick={handleEmail}>
          <ListItemIcon>
            <EmailRounded fontSize="small" sx={{ color: "#6B6480" }} />
          </ListItemIcon>
          <ListItemText primary="Share by email" />
        </MenuItem>

        <MenuItem onClick={handleOpen}>
          <ListItemIcon>
            <OpenInNewRounded fontSize="small" sx={{ color: "#6B6480" }} />
          </ListItemIcon>
          <ListItemText primary="Open shared page" />
        </MenuItem>
      </Menu>
    </>
  );
}

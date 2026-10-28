import { useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { ContentCopyRounded, CheckRounded } from "@mui/icons-material";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const MotionIconButton = motion.create(IconButton);

export default function CopyButton({
  url,
  title = "Copy link",
  size = "small",
  disabled = false,
  showLabel = false,
  onCopied,
}) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    if (!url || disabled || copying) {
      if (!url) toast.error("No link available to copy.");
      return;
    }

    setCopying(true);

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand("copy");
        textarea.remove();

        if (!success) {
          throw new Error("Clipboard copy failed.");
        }
      }

      setCopied(true);
      toast.success("Link copied to clipboard.");
      onCopied?.(url);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      toast.error("Unable to copy the link. Please copy it manually.");
    } finally {
      setCopying(false);
    }
  };

  return (
    <Tooltip title={copied ? "Copied!" : title}>
      <span>
        <MotionIconButton
          type="button"
          size={size}
          aria-label={copied ? "Link copied" : title}
          disabled={disabled || copying || !url}
          onClick={handleCopy}
          whileTap={{ scale: 0.9 }}
          sx={{
            minWidth: showLabel ? "auto" : 34,
            minHeight: 34,
            px: showLabel ? 1.2 : 0.8,
            gap: 0.6,
            border: "1px solid",
            borderColor: copied ? "#BBF7D0" : "#E9EDF5",
            borderRadius: "9px",
            bgcolor: copied ? "#F0FDF4" : "#FFFFFF",
            color: copied ? "#16A34A" : "#64748B",
            transition: "all 160ms ease",
            "&:hover": {
              bgcolor: copied ? "#F0FDF4" : "#F5F3FF",
              borderColor: copied ? "#86EFAC" : "#C4B5FD",
              color: copied ? "#16A34A" : "#6C4CF1",
            },
            "&.Mui-disabled": {
              color: "#CBD5E1",
              borderColor: "#E9EDF5",
              bgcolor: "#F8FAFC",
            },
          }}
        >
          {copied ? (
            <CheckRounded fontSize="small" />
          ) : (
            <ContentCopyRounded fontSize="small" />
          )}

          {showLabel && (
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {copied ? "Copied" : "Copy"}
            </span>
          )}
        </MotionIconButton>
      </span>
    </Tooltip>
  );
}

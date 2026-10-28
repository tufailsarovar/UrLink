import { useState } from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import { CloseRounded, SearchRounded } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search repositories, AI tools, jobs, websites...",
  fullWidth = true,
  autoFocus = false,
  disabled = false,
}) {
  const [internalValue, setInternalValue] = useState("");

  const isControlled = value !== undefined;
  const searchValue = isControlled ? value : internalValue;

  const handleChange = (event) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue("");
    }

    onChange?.("");

    if (!isControlled) {
      setInternalValue("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(searchValue.trim());
  };

  return (
    <MotionBox
      component="form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      sx={{
        width: fullWidth ? "100%" : "auto",
        minWidth: 0,
      }}
    >
      <TextField
        fullWidth={fullWidth}
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        size="medium"
        inputProps={{
          "aria-label": "Search urlink resources",
          maxLength: 200,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded
                sx={{
                  color: searchValue ? "#6C4CF1" : "#94A3B8",
                  fontSize: 23,
                  transition: "color 160ms ease",
                }}
              />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <Tooltip title="Clear search">
                <IconButton
                  type="button"
                  onClick={handleClear}
                  edge="end"
                  size="small"
                  aria-label="Clear search"
                  disabled={disabled}
                  sx={{
                    color: "#94A3B8",
                    "&:hover": {
                      color: "#DC2626",
                      bgcolor: "#FEF2F2",
                    },
                  }}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: 52,
            borderRadius: "14px",
            bgcolor: "#FFFFFF",
            fontSize: { xs: 12.5, sm: 13.5 },
            boxShadow: "0 3px 12px rgba(15,23,42,0.025)",
            transition: "box-shadow 180ms ease, border-color 180ms ease",
            "& fieldset": {
              borderColor: "#E9EDF5",
            },
            "&:hover fieldset": {
              borderColor: "#C4B5FD",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(108,76,241,0.08)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#8B75F7",
              borderWidth: "1px",
            },
          },
          "& input": {
            py: 1.5,
            minWidth: 0,
          },
          "& input::placeholder": {
            color: "#94A3B8",
            opacity: 1,
          },
        }}
      />
      <Box
        component="span"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        aria-live="polite"
      >
        {searchValue ? `Search query: ${searchValue}` : ""}
      </Box>
    </MotionBox>
  );
}

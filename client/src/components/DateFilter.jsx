import { useMemo } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { CalendarMonthRounded, RestartAltRounded } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const PRESET_OPTIONS = [
  { label: "All dates", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Custom range", value: "custom" },
];

export default function DateFilter({
  preset = "all",
  startDate = "",
  endDate = "",
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
  disabled = false,
  compact = false,
}) {
  const today = useMemo(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const handlePresetChange = (event) => {
    const nextPreset = event.target.value;
    onPresetChange?.(nextPreset);

    if (nextPreset !== "custom") {
      onStartDateChange?.("");
      onEndDateChange?.("");
    }
  };

  const handleReset = () => {
    onPresetChange?.("all");
    onStartDateChange?.("");
    onEndDateChange?.("");
    onReset?.();
  };

  const inputSx = {
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      bgcolor: "#FFFFFF",
      borderRadius: "10px",
      fontSize: 12.5,
      "& fieldset": { borderColor: "#E9EDF5" },
      "&:hover fieldset": { borderColor: "#C4B5FD" },
      "&.Mui-focused fieldset": { borderColor: "#6C4CF1" },
    },
    "& .MuiInputLabel-root": { fontSize: 12.5 },
  };

  const customRange = preset === "custom";

  return (
    <MotionBox
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
        <CalendarMonthRounded sx={{ fontSize: 18, color: "#6C4CF1" }} />
        <Typography sx={{ fontSize: 12, fontWeight: 750, color: "#475569" }}>
          Filter by date
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.2,
        }}
      >
        <FormControl
          size="small"
          disabled={disabled}
          sx={{ ...inputSx, width: compact ? 150 : 190 }}
        >
          <InputLabel id="urlink-date-preset-label">Date range</InputLabel>
          <Select
            labelId="urlink-date-preset-label"
            value={preset}
            label="Date range"
            onChange={handlePresetChange}
          >
            {PRESET_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontSize: 12.5 }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {customRange && (
          <MotionBox
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 0.2 }}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              flex: compact ? "1 1 100%" : "0 1 auto",
            }}
          >
            <TextField
              size="small"
              label="From"
              type="date"
              value={startDate}
              disabled={disabled}
              onChange={(event) => onStartDateChange?.(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  max: endDate || today,
                  "aria-label": "Start date",
                },
              }}
              sx={{ ...inputSx, width: compact ? 145 : 165 }}
            />

            <TextField
              size="small"
              label="To"
              type="date"
              value={endDate}
              disabled={disabled}
              onChange={(event) => onEndDateChange?.(event.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  min: startDate || undefined,
                  max: today,
                  "aria-label": "End date",
                },
              }}
              sx={{ ...inputSx, width: compact ? 145 : 165 }}
            />
          </MotionBox>
        )}

        <Tooltip title="Reset date filters">
          <span>
            <Button
              type="button"
              variant="outlined"
              startIcon={<RestartAltRounded />}
              disabled={
                disabled || (preset === "all" && !startDate && !endDate)
              }
              onClick={handleReset}
              sx={{
                minHeight: 40,
                borderRadius: "10px",
                borderColor: "#E9EDF5",
                color: "#64748B",
                fontSize: 12,
                whiteSpace: "nowrap",
                "&:hover": {
                  borderColor: "#C4B5FD",
                  bgcolor: "#F5F3FF",
                  color: "#6C4CF1",
                },
              }}
            >
              Reset
            </Button>
          </span>
        </Tooltip>
      </Box>
    </MotionBox>
  );
}

import { useMemo } from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { CategoryRounded } from "@mui/icons-material";

const MotionBox = motion.create(Box);

const DEFAULT_CATEGORIES = [
  {
    _id: "github-repositories",
    name: "GitHub Repositories",
    slug: "github-repositories",
  },
  { _id: "ai-tools", name: "AI Tools", slug: "ai-tools" },
  { _id: "ai-automation", name: "AI Automation", slug: "ai-automation" },
  { _id: "hiring-jobs", name: "Hiring & Jobs", slug: "hiring-jobs" },
  { _id: "internships", name: "Internships", slug: "internships" },
  { _id: "websites-apps", name: "Websites & Apps", slug: "websites-apps" },
  { _id: "developer-tools", name: "Developer Tools", slug: "developer-tools" },
  {
    _id: "business-startups",
    name: "Business & Startups",
    slug: "business-startups",
  },
  { _id: "other-resources", name: "Other Resources", slug: "other-resources" },
];

const MotionChip = motion.create(Chip);

export default function CategoryFilter({
  categories,
  value = "all",
  onChange,
  variant = "chips",
  label = "Category",
  disabled = false,
  showCount = false,
  counts = {},
  includeAll = true,
}) {
  const normalizedCategories = useMemo(() => {
    const source =
      Array.isArray(categories) && categories.length > 0
        ? categories
        : DEFAULT_CATEGORIES;

    return source
      .filter((category) => category && category.name)
      .map((category) => ({
        id: String(
          category._id || category.id || category.slug || category.name,
        ),
        name: category.name,
        slug: category.slug || category._id || category.name,
      }));
  }, [categories]);

  const options = useMemo(
    () =>
      includeAll
        ? [
            { id: "all", name: "All categories", slug: "all" },
            ...normalizedCategories,
          ]
        : normalizedCategories,
    [includeAll, normalizedCategories],
  );

  const handleChange = (nextValue) => {
    if (!disabled) {
      onChange?.(nextValue);
    }
  };

  if (variant === "select") {
    return (
      <FormControl
        fullWidth
        size="small"
        disabled={disabled}
        sx={{
          minWidth: 170,
          "& .MuiOutlinedInput-root": {
            bgcolor: "#FFFFFF",
            borderRadius: "11px",
            fontSize: 13,
            "& fieldset": { borderColor: "#E9EDF5" },
            "&:hover fieldset": { borderColor: "#C4B5FD" },
            "&.Mui-focused fieldset": { borderColor: "#6C4CF1" },
          },
          "& .MuiInputLabel-root": { fontSize: 13 },
        }}
      >
        <InputLabel id="urlink-category-label">{label}</InputLabel>
        <Select
          labelId="urlink-category-label"
          label={label}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          renderValue={(selected) =>
            options.find((option) => option.slug === selected)?.name ||
            options.find((option) => option.id === selected)?.name ||
            "All categories"
          }
        >
          {options.map((category) => (
            <MenuItem
              key={category.id}
              value={category.slug}
              sx={{ fontSize: 13, py: 1.1 }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography sx={{ fontSize: 13 }}>{category.name}</Typography>
                {showCount && (
                  <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>
                    {counts[category.slug] ?? 0}
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          mb: 1.4,
        }}
      >
        <CategoryRounded sx={{ fontSize: 18, color: "#6C4CF1" }} />
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 750,
            color: "#475569",
          }}
        >
          {label}
        </Typography>
      </Box>

      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          scrollbarWidth: "thin",
          scrollbarColor: "#D8D2FA transparent",
          "&::-webkit-scrollbar": { height: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#D8D2FA",
            borderRadius: 10,
          },
        }}
      >
        {options.map((category, index) => {
          const selected =
            value === category.slug ||
            (value === "all" && category.slug === "all");

          return (
            <MotionChip
              key={category.id}
              label={
                showCount
                  ? `${category.name} (${counts[category.slug] ?? 0})`
                  : category.name
              }
              clickable={!disabled}
              disabled={disabled}
              onClick={() => handleChange(category.slug)}
              variant={selected ? "filled" : "outlined"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.18,
                delay: Math.min(index * 0.025, 0.2),
              }}
              sx={{
                flexShrink: 0,
                height: 35,
                borderRadius: "10px",
                fontSize: 12,
                fontWeight: selected ? 700 : 550,
                bgcolor: selected ? "#6C4CF1" : "#FFFFFF",
                color: selected ? "#FFFFFF" : "#64748B",
                borderColor: selected ? "#6C4CF1" : "#E9EDF5",
                "& .MuiChip-label": { px: 1.4 },
                "&:hover": {
                  bgcolor: selected ? "#5033CC" : "#F5F3FF",
                  borderColor: "#C4B5FD",
                  color: selected ? "#FFFFFF" : "#6C4CF1",
                },
                transition: "all 160ms ease",
              }}
            />
          );
        })}
      </MotionBox>
    </Box>
  );
}

import { memo, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Pagination as MuiPagination,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBackRounded, ArrowForwardRounded } from "@mui/icons-material";

function Pagination({
  page = 1,
  totalPages = 1,
  totalItems,
  limit,
  onChange,
  disabled = false,
  showSummary = true,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const safeTotalPages = Math.max(1, Math.floor(Number(totalPages) || 1));
  const safePage = Math.min(
    safeTotalPages,
    Math.max(1, Math.floor(Number(page) || 1)),
  );

  const summary = useMemo(() => {
    if (!Number.isFinite(Number(totalItems))) return null;

    const count = Math.max(0, Number(totalItems));
    const pageSize = Math.max(1, Math.floor(Number(limit) || 10));
    const start = count === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, count);

    return { start, end, count };
  }, [totalItems, limit, safePage]);

  if (safeTotalPages <= 1 && (!summary || summary.count === 0)) {
    return null;
  }

  const changePage = (nextPage) => {
    if (
      disabled ||
      !Number.isFinite(nextPage) ||
      nextPage < 1 ||
      nextPage > safeTotalPages ||
      nextPage === safePage
    ) {
      return;
    }

    onChange?.(nextPage);
  };

  return (
    <Box
      component="nav"
      aria-label="Resource pagination"
      sx={{
        width: "100%",
        mt: 3,
        py: 2,
        px: { xs: 0, sm: 1 },
        borderTop: "1px solid #EEF0F6",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        spacing={1.8}
      >
        {showSummary && summary ? (
          <Typography
            sx={{
              fontSize: 12,
              color: "#64748B",
              textAlign: { xs: "center", sm: "left" },
              order: { xs: 2, sm: 1 },
            }}
          >
            Showing{" "}
            <Box component="span" sx={{ color: "#172033", fontWeight: 750 }}>
              {summary.start}–{summary.end}
            </Box>{" "}
            of{" "}
            <Box component="span" sx={{ color: "#172033", fontWeight: 750 }}>
              {summary.count}
            </Box>{" "}
            resources
          </Typography>
        ) : (
          <Box sx={{ display: { xs: "none", sm: "block" } }} />
        )}

        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ order: { xs: 1, sm: 2 } }}
        >
          {isMobile ? (
            <>
              <IconButton
                aria-label="Previous page"
                disabled={disabled || safePage <= 1}
                onClick={() => changePage(safePage - 1)}
                sx={{
                  width: 38,
                  height: 38,
                  border: "1px solid #E2E8F0",
                  borderRadius: "11px",
                  color: "#6C4CF1",
                  "&:hover": { bgcolor: "#F5F3FF" },
                  "&.Mui-disabled": { color: "#CBD5E1" },
                }}
              >
                <ArrowBackRounded fontSize="small" />
              </IconButton>

              <Typography
                aria-live="polite"
                sx={{
                  minWidth: 82,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                Page {safePage} of {safeTotalPages}
              </Typography>

              <IconButton
                aria-label="Next page"
                disabled={disabled || safePage >= safeTotalPages}
                onClick={() => changePage(safePage + 1)}
                sx={{
                  width: 38,
                  height: 38,
                  border: "1px solid #E2E8F0",
                  borderRadius: "11px",
                  color: "#6C4CF1",
                  "&:hover": { bgcolor: "#F5F3FF" },
                  "&.Mui-disabled": { color: "#CBD5E1" },
                }}
              >
                <ArrowForwardRounded fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                size="small"
                startIcon={<ArrowBackRounded />}
                disabled={disabled || safePage <= 1}
                onClick={() => changePage(safePage - 1)}
                sx={{
                  px: 1.5,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 12,
                  color: "#475569",
                  "&:hover": { bgcolor: "#F5F3FF" },
                }}
              >
                Previous
              </Button>

              <MuiPagination
                count={safeTotalPages}
                page={safePage}
                disabled={disabled}
                onChange={(_, nextPage) => changePage(nextPage)}
                siblingCount={1}
                boundaryCount={1}
                size="small"
                shape="rounded"
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    minWidth: 34,
                    height: 34,
                    borderRadius: "10px",
                    color: "#475569",
                    fontSize: 12,
                    fontWeight: 650,
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    bgcolor: "#6C4CF1",
                    color: "#FFFFFF",
                    "&:hover": { bgcolor: "#5033CC" },
                  },
                }}
              />

              <Button
                size="small"
                endIcon={<ArrowForwardRounded />}
                disabled={disabled || safePage >= safeTotalPages}
                onClick={() => changePage(safePage + 1)}
                sx={{
                  px: 1.5,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 12,
                  color: "#475569",
                  "&:hover": { bgcolor: "#F5F3FF" },
                }}
              >
                Next
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

export default memo(Pagination);

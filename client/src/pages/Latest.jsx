import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Chip, Container, Stack, Typography } from "@mui/material";
import { AccessTimeRounded, FiberNewRounded } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../services/api.js";
import LinkList from "../components/LinkList.jsx";
import Pagination from "../components/Pagination.jsx";

const PAGE_SIZE = 10;

function getArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.links)) return data.links;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function getPagination(response, count, page) {
  const data = response?.data;
  const meta = data?.pagination || data?.meta || {};

  const totalItems = Number(
    meta.totalItems ?? meta.total ?? data?.total ?? count,
  );
  const limit = Number(meta.limit ?? meta.pageSize ?? PAGE_SIZE);
  const totalPages = Number(
    meta.totalPages ??
      meta.pages ??
      data?.totalPages ??
      Math.max(1, Math.ceil(totalItems / Math.max(1, limit))),
  );

  return {
    totalItems: Number.isFinite(totalItems) ? totalItems : count,
    limit: Number.isFinite(limit) && limit > 0 ? limit : PAGE_SIZE,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    page: Number(meta.page ?? page) || page,
  };
}

export default function Latest() {
  const [links, setLinks] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    limit: PAGE_SIZE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLatest = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/links", {
        params: {
          page,
          limit: PAGE_SIZE,
          sort: "latest",
        },
      });

      const items = getArray(response);
      setLinks(items);
      setPagination(getPagination(response, items.length, page));
    } catch (err) {
      setLinks([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        limit: PAGE_SIZE,
      });
      setError(
        err?.response?.data?.message ||
          "Unable to load the latest resources. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  return (
    <Box sx={{ minHeight: "70vh", bgcolor: "#FAFAFE", pb: 7 }}>
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 70%, #EEF2FF 100%)",
          borderBottom: "1px solid #EDE9FE",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "13px",
                  bgcolor: "#EDE9FE",
                  color: "#6C4CF1",
                }}
              >
                <FiberNewRounded sx={{ fontSize: 25 }} />
              </Box>

              <Chip
                label="Fresh discoveries"
                size="small"
                sx={{
                  bgcolor: "#EDE9FE",
                  color: "#5B3DC4",
                  fontWeight: 750,
                  fontSize: 11,
                }}
              />
            </Stack>

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 32, sm: 44, md: 50 },
                lineHeight: 1.12,
                letterSpacing: { xs: -1.2, sm: -1.8 },
                fontWeight: 850,
                color: "#17152B",
              }}
            >
              Latest resources
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                maxWidth: 600,
                fontSize: { xs: 13, sm: 15 },
                lineHeight: 1.9,
                color: "#64708A",
              }}
            >
              Explore the newest projects, AI tools, useful websites, and
              opportunities published on urlink.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 3, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeRounded sx={{ color: "#6C4CF1", fontSize: 20 }} />
              <Typography
                component="h2"
                sx={{ fontSize: 20, fontWeight: 800, color: "#17152B" }}
              >
                Recently published
              </Typography>
            </Stack>

            <Typography sx={{ mt: 0.6, fontSize: 12, color: "#78839A" }}>
              Sorted by newest first
            </Typography>
          </Box>

          <Chip
            variant="outlined"
            label={`${pagination.totalItems} resources`}
            sx={{
              fontSize: 11,
              fontWeight: 700,
              borderColor: "#DDD6FE",
              color: "#6C4CF1",
              bgcolor: "#FFFFFF",
            }}
          />
        </Stack>

        {error && links.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <LinkList
          links={links}
          loading={loading}
          error={error}
          onRetry={loadLatest}
          emptyTitle="Nothing new just yet"
          emptyDescription="New resources published by the administrator will appear here."
        />

        {!loading && links.length > 0 && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            limit={pagination.limit}
            onChange={setPage}
          />
        )}
      </Container>
    </Box>
  );
}

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettingsRounded,
  BlockRounded,
  CheckCircleRounded,
  ManageSearchRounded,
  PeopleAltRounded,
  RefreshRounded,
  SearchRounded,
  ShieldRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api.js";

const MotionCard = motion.create(Card);

const emptyStats = {
  totalUsers: 0,
  activeUsers: 0,
  disabledUsers: 0,
  adminUsers: 0,
};

function formatDate(value) {
  if (!value) return "Never";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ManageUsers() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/users", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: filter,
        },
      });

      const data = response.data;

      setUsers(data.users || []);
      setStats(data.stats || emptyStats);
      setTotal(data.pagination?.total || 0);
      setPages(Math.max(1, data.pagination?.pages || 1));
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to load user accounts.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (user, changes) => {
    const action = changes.isActive === false
      ? "disable"
      : changes.isActive === true
        ? "enable"
        : changes.role === "admin"
          ? "promote"
          : "change this user's role";

    if (!window.confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }

    setUpdatingId(user.id);

    try {
      await api.patch(`/users/${user.id}`, changes);
      toast.success("Account updated successfully.");
      await fetchUsers();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update this account."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const statCards = [
    {
      label: "Total users",
      value: stats.totalUsers,
      icon: <PeopleAltRounded />,
      color: "#6C4CF1",
      background: "#F1EEFF",
    },
    {
      label: "Active users",
      value: stats.activeUsers,
      icon: <CheckCircleRounded />,
      color: "#059669",
      background: "#DDFBF0",
    },
    {
      label: "Disabled users",
      value: stats.disabledUsers,
      icon: <BlockRounded />,
      color: "#DC2626",
      background: "#FEE2E2",
    },
    {
      label: "Administrators",
      value: stats.adminUsers,
      icon: <AdminPanelSettingsRounded />,
      color: "#2563EB",
      background: "#DBEAFE",
    },
  ];

  return (
    <Container maxWidth={false} disableGutters>
      <Stack spacing={{ xs: 2.5, md: 3 }}>
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontSize: { xs: 23, sm: 30 },
                    fontWeight: 800,
                    color: "#172033",
                    letterSpacing: "-0.8px",
                  }}
                >
                  Manage users
                </Typography>
                <ShieldRounded sx={{ color: "#6C4CF1" }} />
              </Stack>
              <Typography sx={{ mt: 0.5, color: "#64748B", fontSize: 13 }}>
                View registered accounts and manage access to urlink.
              </Typography>
            </Box>

            <Button
              onClick={fetchUsers}
              startIcon={<RefreshRounded />}
              variant="outlined"
              disabled={loading}
              sx={{
                alignSelf: { xs: "flex-start", sm: "center" },
                borderColor: "#E2E8F0",
                color: "#475569",
                borderRadius: 2.5,
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {statCards.map((item, index) => (
            <Grid item xs={6} md={3} key={item.label}>
              <MotionCard
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid #E7ECF4",
                  borderRadius: 3,
                  background: "#FFFFFF",
                }}
              >
                <CardContent sx={{ p: { xs: 1.6, sm: 2.5 } }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      sx={{
                        color: "#64748B",
                        fontSize: { xs: 11, sm: 13 },
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        borderRadius: 2.5,
                        color: item.color,
                        bgcolor: item.background,
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Stack>

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: { xs: 26, sm: 32 },
                      lineHeight: 1.1,
                      fontWeight: 800,
                      color: "#172033",
                    }}
                  >
                    {loading ? "—" : item.value.toLocaleString("en-IN")}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        <Card
          elevation={0}
          sx={{
            border: "1px solid #E7ECF4",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
                  User accounts
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: 12, mt: 0.4 }}>
                  {total.toLocaleString("en-IN")} matching accounts
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                sx={{ width: { xs: "100%", md: "auto" } }}
              >
                <TextField
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name or email"
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { sm: 240 } }}
                />

                <FormControl size="small" sx={{ minWidth: 145 }}>
                  <Select
                    value={filter}
                    onChange={(event) => {
                      setFilter(event.target.value);
                      setPage(1);
                    }}
                    aria-label="Filter user accounts"
                  >
                    <MenuItem value="all">All accounts</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                    <MenuItem value="admin">Administrators</MenuItem>
                    <MenuItem value="user">Regular users</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </CardContent>

          {loading ? (
            <Box sx={{ py: 7, display: "grid", placeItems: "center" }}>
              <CircularProgress size={30} sx={{ color: "#6C4CF1" }} />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
              <ManageSearchRounded
                sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }}
              />
              <Typography sx={{ fontWeight: 700 }}>
                No user accounts found
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: "#64748B" }}>
                Try changing your search or filter.
              </Typography>
            </Box>
          ) : isMobile ? (
            <Stack spacing={0} divider={<Box sx={{ borderTop: "1px solid #E7ECF4" }} />}>
              {users.map((user) => (
                <Box key={user.id} sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1.3} alignItems="flex-start">
                    <Avatar
                      src={user.photoURL || undefined}
                      alt={user.displayName || user.email}
                      sx={{
                        bgcolor: "#EDE9FE",
                        color: "#6C4CF1",
                        width: 42,
                        height: 42,
                      }}
                    >
                      {(user.displayName || user.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 750 }}>
                        {user.displayName || "Unnamed user"}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#64748B",
                          overflowWrap: "anywhere",
                          mt: 0.3,
                        }}
                      >
                        {user.email}
                      </Typography>

                      <Stack direction="row" flexWrap="wrap" gap={0.7} sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          label={user.role === "admin" ? "Admin" : "User"}
                          color={user.role === "admin" ? "primary" : "default"}
                        />
                        <Chip
                          size="small"
                          label={user.isActive ? "Active" : "Disabled"}
                          color={user.isActive ? "success" : "error"}
                          variant="outlined"
                        />
                      </Stack>

                      <Typography sx={{ mt: 1.2, fontSize: 11, color: "#64748B" }}>
                        Registered: {formatDate(user.createdAt)}
                      </Typography>
                      <Typography sx={{ mt: 0.3, fontSize: 11, color: "#64748B" }}>
                        Last login: {formatDate(user.lastLoginAt)}
                      </Typography>

                      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={updatingId === user.id}
                          onClick={() =>
                            updateUser(user, { isActive: !user.isActive })
                          }
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={updatingId === user.id}
                          onClick={() =>
                            updateUser(user, {
                              role: user.role === "admin" ? "user" : "admin",
                            })
                          }
                        >
                          {user.role === "admin" ? "Remove admin" : "Make admin"}
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Last login</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.3}>
                          <Avatar
                            src={user.photoURL || undefined}
                            sx={{ width: 36, height: 36 }}
                          >
                            {(user.displayName || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                              {user.displayName || "Unnamed user"}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={user.role}
                          color={user.role === "admin" ? "primary" : "default"}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={user.isActive ? "Active" : "Disabled"}
                          color={user.isActive ? "success" : "error"}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell sx={{ fontSize: 12 }}>
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>
                        {formatDate(user.lastLoginAt)}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={1}
                        >
                          <Button
                            size="small"
                            disabled={updatingId === user.id}
                            onClick={() =>
                              updateUser(user, { isActive: !user.isActive })
                            }
                          >
                            {user.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="small"
                            disabled={updatingId === user.id}
                            onClick={() =>
                              updateUser(user, {
                                role: user.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            {user.role === "admin" ? "Demote" : "Make admin"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ p: 2, borderTop: "1px solid #E7ECF4" }}
          >
            <Typography sx={{ fontSize: 12, color: "#64748B" }}>
              Page {page} of {pages}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={page >= pages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
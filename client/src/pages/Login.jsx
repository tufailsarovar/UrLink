import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForwardRounded,
  EmailOutlined,
  Google,
  SecurityRounded,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

const policyLinkSx = {
  color: "#6554F0",
  fontWeight: 700,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    loading: authLoading,
    loginWithGoogle,
    loginWithEmailOtp,
    verifyEmailOtp,
    refreshAdminStatus,
  } = useAuth();

  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const requirePolicies = () => {
    if (acceptedPolicies) return true;
    setError(
      "Please accept the Terms and Conditions and Privacy Policy before continuing.",
    );
    return false;
  };

  const redirectAfterLogin = async (loginResult) => {
    const result = await refreshAdminStatus();
    const admin = loginResult?.isAdmin || result?.isAdmin;

    const requestedPath = location.state?.from?.pathname;

    navigate(
      admin
        ? "/admin"
        : requestedPath && requestedPath !== "/login"
          ? requestedPath
          : "/",
      { replace: true },
    );
  };

  const handleGoogleLogin = async () => {
    if (!requirePolicies()) return;
    setBusy(true);
    setError("");
    try {
      if (typeof loginWithGoogle !== "function")
        throw new Error("Google login is not configured yet.");
      const loginResult = await loginWithGoogle();
      await redirectAfterLogin(loginResult);
      await loginWithGoogle();
      await redirectAfterLogin();
      toast.success("Signed in successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Google sign-in failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!requirePolicies()) return;
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      if (typeof loginWithEmailOtp !== "function") {
        throw new Error(
          "Email OTP is not configured. The authentication service must support sending an email code.",
        );
      }
      await loginWithEmailOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtpSent(true);
      toast.success(
        "If the email is eligible, a verification code has been sent.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send the verification code.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!requirePolicies()) return;
    setError("");
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    try {
      if (typeof verifyEmailOtp !== "function")
        throw new Error("Email OTP verification is not configured yet.");
      await verifyEmailOtp(email.trim().toLowerCase(), otp.trim());
      await redirectAfterLogin();
      toast.success("Email verified. Signed in successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "The code is invalid or expired.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: "65vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#6554F0" }} />
      </Box>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          minHeight: "65vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          py: 4,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 390,
            p: { xs: 3, sm: 4 },
            textAlign: "center",
            border: "1px solid #E8EAF2",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
            You're already signed in
          </Typography>
          <Typography sx={{ mt: 1, mb: 3, color: "#7B8498", fontSize: 13 }}>
            Continue to your urlink account.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/", { replace: true })}
            sx={{
              minHeight: 46,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#6554F0",
            }}
          >
            Continue to urlink
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 90px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2.5, sm: 6 },
        background:
          "radial-gradient(circle at 15% 10%, rgba(110,91,255,.10), transparent 35%), radial-gradient(circle at 90% 85%, rgba(56,189,248,.10), transparent 32%), #F8F9FD",
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
          border: "1px solid #E8EAF2",
          borderRadius: { xs: "17px", sm: "23px" },
          boxShadow: "0 18px 55px rgba(31,41,80,.09)",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg,#6554F0,#4388F4,#38C7DB)",
          }}
        />
        <Box sx={{ p: { xs: 2.25, sm: 4 } }}>
          <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="URLINK Logo"
              sx={{
                width: 70,
                height: 70,
                objectFit: "contain",
              }}
            />

            <Box
              component="img"
              src="/urlink_name.png"
              alt="URLINK"
              sx={{
                width: 180,
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Stack>

          <Box sx={{ mb: 2, p: 0.4, borderRadius: 2, bgcolor: "#F3F4F9" }}>
            <Tabs
              value={tab}
              onChange={(_, value) => {
                setTab(value);
                setError("");
              }}
              variant="fullWidth"
              sx={{
                minHeight: 40,
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  minHeight: 40,
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12,
                  color: "#7B8498",
                  px: 0.5,
                },
                "& .Mui-selected": {
                  bgcolor: "#fff",
                  color: "#6554F0 !important",
                  boxShadow: "0 2px 8px rgba(30,40,80,.07)",
                },
              }}
            >
              <Tab
                icon={<Google sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label="Google"
              />
              <Tab
                icon={<EmailOutlined sx={{ fontSize: 16 }} />}
                iconPosition="start"
                label="Email OTP"
              />
            </Tabs>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 1.5, borderRadius: 2, fontSize: 12 }}
            >
              {error}
            </Alert>
          )}

          <FormControlLabel
            sx={{
              alignItems: "flex-start",
              mx: 0,
              mb: 1.5,
              width: "100%",
              "& .MuiFormControlLabel-label": {
                fontSize: 11.5,
                lineHeight: 1.7,
                color: "#657087",
              },
            }}
            control={
              <Checkbox
                checked={acceptedPolicies}
                onChange={(event) => {
                  setAcceptedPolicies(event.target.checked);
                  setError("");
                }}
                disabled={busy}
                required
                size="small"
                sx={{
                  p: 0.5,
                  mr: 0.7,
                  color: "#6554F0",
                  "&.Mui-checked": { color: "#6554F0" },
                }}
              />
            }
            label={
              <>
                I agree to the{" "}
                <Box
                  component="a"
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  sx={policyLinkSx}
                >
                  Terms and Conditions
                </Box>{" "}
                and{" "}
                <Box
                  component="a"
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  sx={policyLinkSx}
                >
                  Privacy Policy
                </Box>
                .
              </>
            }
          />

          {tab === 0 ? (
            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGoogleLogin}
                disabled={busy}
                startIcon={
                  busy ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Google />
                  )
                }
                sx={{
                  minHeight: 46,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 750,
                  fontSize: 13,
                  background: "linear-gradient(100deg,#6554F0,#4777EF)",
                  boxShadow: "0 7px 16px rgba(101,84,240,.18)",
                  "&:hover": {
                    background: "linear-gradient(100deg,#5542E0,#3565DF)",
                  },
                }}
              >
                {busy ? "Signing in..." : "Continue with Google"}
              </Button>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#8991A4",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                Your account permissions are determined securely by urlink.
              </Typography>
            </Stack>
          ) : (
            <Box
              component="form"
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            >
              {!otpSent ? (
                <Stack spacing={1.5}>
                  <TextField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    fullWidth
                    disabled={busy}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <EmailOutlined
                          sx={{ mr: 1, color: "#929AAF", fontSize: 19 }}
                        />
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={busy}
                    endIcon={
                      busy ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <ArrowForwardRounded />
                      )
                    }
                    sx={{
                      minHeight: 46,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 750,
                      fontSize: 13,
                      background: "linear-gradient(100deg,#6554F0,#4777EF)",
                    }}
                  >
                    {busy ? "Sending code..." : "Send verification code"}
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={1.5}>
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: 12 }}>
                    Enter the 6-digit code sent to {email}.
                  </Alert>
                  <TextField
                    label="6-digit verification code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputProps={{
                      inputMode: "numeric",
                      maxLength: 6,
                      autoComplete: "one-time-code",
                    }}
                    required
                    fullWidth
                    disabled={busy}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& input": {
                        textAlign: "center",
                        letterSpacing: ".4em",
                        fontSize: 19,
                        fontWeight: 750,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={busy || otp.length !== 6}
                    endIcon={
                      busy ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <ArrowForwardRounded />
                      )
                    }
                    sx={{
                      minHeight: 46,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 750,
                      background: "linear-gradient(100deg,#6554F0,#4777EF)",
                    }}
                  >
                    {busy ? "Verifying..." : "Verify and sign in"}
                  </Button>
                  <Button
                    disabled={busy}
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setError("");
                    }}
                    sx={{
                      textTransform: "none",
                      color: "#6554F0",
                      fontSize: 12,
                    }}
                  >
                    Change email or resend code
                  </Button>
                </Stack>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.7}
          >
            <SecurityRounded sx={{ color: "#16A36A", fontSize: 16 }} />
            <Typography
              sx={{ fontSize: 10.5, fontWeight: 650, color: "#657087" }}
            >
              Secure authentication · Protected access
            </Typography>
          </Stack>
        </Box>
      </MotionPaper>
    </Box>
  );
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/global.css";
import "./styles/responsive.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6C4CF1",
      light: "#8B75F7",
      dark: "#5033CC",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0F172A",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#172033",
      secondary: "#64748B",
    },
    divider: "#E9EDF5",
    success: {
      main: "#16A34A",
    },
    error: {
      main: "#DC2626",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: "-0.045em",
    },
    h2: {
      fontWeight: 800,
      letterSpacing: "-0.035em",
    },
    h3: {
      fontWeight: 750,
      letterSpacing: "-0.03em",
    },
    h4: {
      fontWeight: 750,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minWidth: 320,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "*": {
          boxSizing: "border-box",
        },
        "::selection": {
          backgroundColor: "#DDD6FE",
          color: "#312E81",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
          minHeight: 40,
          transition: "all 180ms ease",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E9EDF5",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.025)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                background: "#172033",
                color: "#FFFFFF",
                fontSize: "14px",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);

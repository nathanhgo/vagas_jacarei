"use client";

import { createTheme } from "@mui/material/styles";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#4A85B6",
      light: "#8FBAE3",
      dark: "#2C5E8A",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#E0876A",
      light: "#F1A990",
      dark: "#C05C3D",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FAF6F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2A3543",
      secondary: "#6C7D93",
    },
    error: {
      main: "#FA5252",
    },
    success: {
      main: "#40C057",
    },
    warning: {
      main: "#FAB005",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 24px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(227, 207, 192, 0.4)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default theme;

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
    mode: "dark",
    primary: {
      main: "#4F8EF7",
      light: "#82AEFF",
      dark: "#1A5DC4",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#22D3A0",
      light: "#5FFFCC",
      dark: "#00A172",
      contrastText: "#000000",
    },
    background: {
      default: "#0D1117",
      paper: "#161B22",
    },
    text: {
      primary: "#E6EDF3",
      secondary: "#8B949E",
    },
    error: {
      main: "#F85149",
    },
    success: {
      main: "#3FB950",
    },
    warning: {
      main: "#D29922",
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
          border: "1px solid rgba(255,255,255,0.08)",
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

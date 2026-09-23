import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    primary: { main: "#ef6f61", contrastText: "#fffaf5" },
    secondary: { main: "#147d82" },
    background: { default: "#f7f7f8", paper: "#ffffff" },
    text: { primary: "#0d1b24", secondary: "#6b7a84" },
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
});

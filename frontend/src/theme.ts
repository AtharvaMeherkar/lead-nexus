import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0D47A1" },
    secondary: { main: "#00ACC1" },
    background: { default: "#f7f9fc" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8 } },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;

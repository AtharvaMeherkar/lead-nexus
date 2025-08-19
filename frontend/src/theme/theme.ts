import { createTheme, ThemeOptions } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

// Color palette definitions
const lightPalette = {
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#dc004e",
    light: "#ff5983",
    dark: "#9a0036",
    contrastText: "#ffffff",
  },
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
  },
  success: {
    main: "#2e7d32",
    light: "#4caf50",
    dark: "#1b5e20",
  },
  warning: {
    main: "#ed6c02",
    light: "#ff9800",
    dark: "#e65100",
  },
  error: {
    main: "#d32f2f",
    light: "#ef5350",
    dark: "#c62828",
  },
  info: {
    main: "#0288d1",
    light: "#03a9f4",
    dark: "#01579b",
  },
};

const darkPalette = {
  primary: {
    main: "#90caf9",
    light: "#e3f2fd",
    dark: "#42a5f5",
    contrastText: "#000000",
  },
  secondary: {
    main: "#f48fb1",
    light: "#f8bbd9",
    dark: "#ec407a",
    contrastText: "#000000",
  },
  background: {
    default: "#121212",
    paper: "#1e1e1e",
  },
  text: {
    primary: "#ffffff",
    secondary: "#b3b3b3",
  },
  success: {
    main: "#66bb6a",
    light: "#81c784",
    dark: "#388e3c",
  },
  warning: {
    main: "#ffa726",
    light: "#ffb74d",
    dark: "#f57c00",
  },
  error: {
    main: "#f44336",
    light: "#e57373",
    dark: "#d32f2f",
  },
  info: {
    main: "#29b6f6",
    light: "#4fc3f7",
    dark: "#0288d1",
  },
};

// Common theme configuration
const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 300,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 400,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 400,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.43,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: "0 12px 12px 0",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)",
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "scale(1.1)",
          },
        },
      },
    },
  },
};

// Create theme function
export const createAppTheme = (mode: PaletteMode) => {
  const palette = mode === "light" ? lightPalette : darkPalette;

  return createTheme({
    ...commonTheme,
    palette: {
      mode,
      ...palette,
    },
  });
};

// Default theme (light mode)
export const defaultTheme = createAppTheme("light");

// Theme context types
export interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

// Animation constants
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  },
  slideIn: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3, ease: "easeOut" },
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  bounce: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: {
      duration: 0.6,
      ease: [0.68, -0.55, 0.265, 1.55],
    },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

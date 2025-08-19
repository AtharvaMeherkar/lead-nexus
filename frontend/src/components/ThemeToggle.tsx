import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          onClick={toggleColorMode}
          color="inherit"
          sx={{
            borderRadius: "50%",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: mode === "light" ? 0 : 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
          </motion.div>
        </IconButton>
      </motion.div>
    </Tooltip>
  );
};

export default ThemeToggle;

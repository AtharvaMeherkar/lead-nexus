import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface AnimatedLoaderProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  message = "Loading...",
  size = 40,
  fullScreen = false,
}) => {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const content = (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <motion.div variants={spinnerVariants} animate="animate">
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: "primary.main",
            }}
          />
        </motion.div>

        <motion.div variants={textVariants} initial="initial" animate="animate">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {message}
          </Typography>
        </motion.div>
      </Box>
    </motion.div>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="background.default"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      width="100%"
    >
      {content}
    </Box>
  );
};

export default AnimatedLoader;

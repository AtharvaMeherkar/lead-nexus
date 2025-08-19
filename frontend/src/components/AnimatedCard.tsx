import React, { ReactNode } from "react";
import { Card, CardProps } from "@mui/material";
import { motion, MotionProps } from "framer-motion";

interface AnimatedCardProps extends Omit<CardProps, "component"> {
  children: ReactNode;
  delay?: number;
  hover?: boolean;
  motionProps?: MotionProps;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  hover = true,
  motionProps,
  ...cardProps
}) => {
  const cardVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
    hover: hover
      ? {
          y: -8,
          scale: 1.02,
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        }
      : {},
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      {...motionProps}
    >
      <Card
        {...cardProps}
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          },
          ...cardProps.sx,
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;

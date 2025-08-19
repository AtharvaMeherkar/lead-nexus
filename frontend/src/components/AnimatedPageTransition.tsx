import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface AnimatedPageTransitionProps {
  children: ReactNode;
}

const AnimatedPageTransition: React.FC<AnimatedPageTransitionProps> = ({
  children,
}) => {
  const location = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: 20,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  return (
    <motion.div
      key={location.pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPageTransition;

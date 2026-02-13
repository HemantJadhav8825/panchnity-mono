"use client";

import React from "react";
import { motion } from "framer-motion";
import { IllustrationProps } from "../types";

export const WaitingSoft: React.FC<IllustrationProps> = ({ className, size = "100%" }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="initial"
      animate="animate"
      aria-hidden="true"
    >
      <motion.circle
        cx="200"
        cy="200"
        r="20"
        fill="hsl(var(--primary))"
        variants={{
          animate: {
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="40"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        variants={{
          animate: {
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
    </motion.svg>
  );
};

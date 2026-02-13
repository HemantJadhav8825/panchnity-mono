"use client";

import React from "react";
import { motion } from "framer-motion";
import { IllustrationProps } from "../types";

export const EmptyQuiet: React.FC<IllustrationProps> = ({ className, size = "100%" }) => {
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
      {/* Large Soft Circle (The Void) */}
      <motion.circle
        cx="200"
        cy="200"
        r="120"
        fill="hsl(var(--primary))"
        fillOpacity="0.05"
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Single Gentle Element */}
      <motion.path
        d="M180 200C180 180 220 180 220 200C220 220 180 220 180 200Z"
        fill="hsl(var(--primary))"
        fillOpacity="0.2"
        variants={{
          animate: {
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
            transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      
      <circle cx="200" cy="200" r="4" fill="hsl(var(--primary))" />
    </motion.svg>
  );
};

"use client";

import React from "react";
import { motion } from "framer-motion";
import { IllustrationProps } from "../types";

export const ConnectionCards: React.FC<IllustrationProps> = ({ className, size = "100%" }) => {
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
      {/* Overlapping Circles for Togetherness */}
      <motion.circle
        cx="180"
        cy="200"
        r="60"
        fill="hsl(var(--primary))"
        fillOpacity="0.1"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          animate: {
            x: [-5, 5, -5],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      <motion.circle
        cx="220"
        cy="200"
        r="60"
        fill="hsl(var(--primary))"
        fillOpacity="0.1"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          animate: {
            x: [5, -5, 5],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      
      {/* Center connection point */}
      <motion.circle
        cx="200"
        cy="200"
        r="10"
        fill="var(--primary)"
        variants={{
          animate: {
            scale: [1, 1.2, 1],
            transition: { duration: 2, repeat: Infinity },
          },
        }}
      />
    </motion.svg>
  );
};

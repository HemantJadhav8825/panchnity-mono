"use client";

import React from "react";
import { motion } from "framer-motion";
import { IllustrationProps } from "../types";

export const AuthWelcome: React.FC<IllustrationProps> = ({ className, size = "100%" }) => {
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
      {/* Background Glow */}
      <motion.circle
        cx="200"
        cy="200"
        r="150"
        fill="url(#paint0_radial_auth)"
        variants={{
          animate: {
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />

      {/* Stacked Cards/Frames - Togetherness */}
      <motion.rect
        x="100"
        y="120"
        width="150"
        height="200"
        rx="12"
        fill="hsl(var(--illustration-secondary))"
        fillOpacity="0.8"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          initial: { y: 20, opacity: 0, rotate: -5 },
          animate: { 
            y: 0, 
            opacity: 1, 
            rotate: -2,
            transition: { delay: 0.2, duration: 1, ease: "easeOut" } 
          },
        }}
      />

      <motion.rect
        x="150"
        y="100"
        width="150"
        height="200"
        rx="12"
        fill="hsl(var(--primary))"
        fillOpacity="0.1"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        variants={{
          initial: { y: 20, opacity: 0, rotate: 5 },
          animate: { 
            y: 0, 
            opacity: 1, 
            rotate: 2,
            transition: { delay: 0.4, duration: 1, ease: "easeOut" } 
          },
        }}
      />

      {/* Abstract human presence / Soft Circle */}
      <motion.circle
        cx="250"
        cy="180"
        r="40"
        fill="hsl(var(--primary))"
        variants={{
          animate: {
            y: [-5, 5, -5],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />

      <defs>
        <radialGradient
          id="paint0_radial_auth"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(200 200) rotate(90) scale(150)"
        >
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </radialGradient>
      </defs>
    </motion.svg>
  );
};

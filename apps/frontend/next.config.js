/**
 * Import env validation module to trigger strict validation at build time.
 * This MUST be the first import to ensure validation runs before any config processing.
 */
const { env } = require("./src/config/env.ts");

/** @type {import('next').NextConfig} */
const allowedDevOrigins = env.ALLOWED_DEV_ORIGINS.split(",");

const nextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: allowedDevOrigins,
    },
  },
};

module.exports = nextConfig;

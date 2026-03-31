import { resolve } from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: resolve("."),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const config: NextConfig = {
  // Build to plain HTML, CSS and JS in out/, served from a CDN: no Node server to run or pay for.
  output: "export",
};

export default config;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails are portrait 3:4; these widths cover phone → retina desktop.
    deviceSizes: [480, 720, 960, 1280, 1600, 2048],
    imageSizes: [240, 360, 480],
  },
};

export default nextConfig;

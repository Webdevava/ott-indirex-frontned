import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "indi-test-img-processing.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "apm-captured-images.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;

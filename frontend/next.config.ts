import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from the backend during development
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

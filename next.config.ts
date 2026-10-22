import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/founders",
        destination: "/mission",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/tokyo/souzoku-houki/start",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
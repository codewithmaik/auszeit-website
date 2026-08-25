import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/galerie",
        destination: "/wohnung",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

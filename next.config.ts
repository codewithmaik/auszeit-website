import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // @react-pdf/renderer (PDF-Erzeugung der Rechnungen) nicht bundlen — läuft
  // als natives Node-Modul in der Server Action.
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
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

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
        source: "/:path*",
        has: [{ type: "host", value: "www.mosel-auszeit.de" }],
        destination: "https://mosel-auszeit.de/:path*",
        permanent: true,
      },
      {
        source: "/galerie",
        destination: "/wohnung",
        permanent: true,
      },
    ];
  },
  // Bislang keine Security-Header gesetzt. CSP bewusst mit 'unsafe-inline' für
  // script-src/style-src: Next.js' eigene Hydration-Inline-Scripts bräuchten
  // ohne Nonce-Infrastruktur (Middleware-generierter Nonce + Next darauf
  // eingerichtet) sonst 'unsafe-inline', und die App nutzt sitezweit inline
  // `style={{...}}`-Overrides (Design-Editor, Rechnungs-PDF-Vorschau) — ein
  // strengeres style-src hätte das kaputt gemacht. In dieser Sandbox war keine
  // Live-Browser-Verifikation möglich (siehe DEVNOTES.md), daher hier bewusst
  // die sichere, nicht-brechende Variante statt eines ungetesteten strict-CSP-
  // Umbaus mit Nonces. Trotzdem echter Zugewinn: object-src/frame-ancestors/
  // base-uri sowie eine feste Allowlist für img-src/frame-src/connect-src.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src https://maps.google.com https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

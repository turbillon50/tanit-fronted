/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Cache-busting: HTML, manifest, and root files must be revalidated on every
  // request so the installed PWA picks up new deploys without a manual reinstall.
  // Static assets in /_next/static/ are versioned by Next.js (immutable), so
  // those keep their long-cache; only freshly-rendered routes are forced to
  // re-validate.
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|.*\\.(?:js|css|png|jpg|jpeg|svg|webp|woff|woff2|ico)$).*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;

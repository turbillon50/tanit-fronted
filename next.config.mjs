/** @type {import('next').NextConfig} */
const BACKEND = "http://178.105.135.26";

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  async rewrites() {
    return [
      { source: "/api/:path*",       destination: `${BACKEND}/api/:path*` },
      { source: "/bot/:path*",       destination: `${BACKEND}/bot/:path*` },
      { source: "/portfolio/:path*", destination: `${BACKEND}/portfolio/:path*` },
      { source: "/admin/:path*",     destination: `${BACKEND}/admin/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|.*\\.(?:js|css|png|jpg|jpeg|svg|webp|woff|woff2|ico)$).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      { source: "/manifest.webmanifest", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;

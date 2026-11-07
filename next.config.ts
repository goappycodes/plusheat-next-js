import type { NextConfig } from "next";

/**
 * Cache Components is deliberately off: Zoho data is cached with
 * `unstable_cache`, which on Vercel lives in the shared Data Cache, so the
 * Zoho OAuth token and price book are reused across serverless instances
 * (Zoho throttles token minting). See src/lib/zoho.ts.
 */
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // Old WordPress plan-table page for the same plans.
      { source: "/get-boiler-cover", destination: "/boiler-cover", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Not the live site yet: keep every URL out of search engines.
          ...(process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true"
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
};

export default nextConfig;

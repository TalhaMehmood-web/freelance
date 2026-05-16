import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* Enable Next.js 16 Cache Components ('use cache' directive) */
  cacheComponents: true,

  images: {
    /* Supabase Storage bucket */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      /* User avatars from Google OAuth */
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    minimumCacheTTL: 3600,
  },

  /* Experimental features */
  experimental: {
    /* Server Actions */
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL?.replace("https://", "") ?? "",
      ].filter(Boolean),
    },
  },

  /* Headers applied to all routes */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ]
  },
}

export default nextConfig

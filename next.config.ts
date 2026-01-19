import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SHOPIFY_ADMIN_URL: process.env.SHOPIFY_ADMIN_URL,
    X_SHOPIFY_ACCESS_TOKEN: process.env.X_SHOPIFY_ACCESS_TOKEN,
    NUUHA_ADMIN_URL: process.env.NUUHA_ADMIN_URL,
    TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_ACCESS_TOKEN: process.env.NEXT_PUBLIC_ACCESS_TOKEN
  },
  /* config options here */
};

export default nextConfig;

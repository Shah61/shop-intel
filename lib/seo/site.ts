export const siteConfig = {
  name: "Pulse",
  legalName: "Haris AI Solutions",
  url: "https://www.pulsetech.my",
  tagline: "AI-Powered E-Commerce Intelligence",
  title: "Pulse | AI-Powered E-Commerce Intelligence",
  description:
    "Pulse unifies your sales channels, marketing, inventory, and AI intelligence into one command center. Built for e-commerce operators in Malaysia and beyond who have outgrown spreadsheets.",
  shortDescription:
    "One workspace for revenue, campaigns, inventory, and AI that turns noise into next actions.",
  keywords: [
    "Pulse",
    "PulseTech",
    "pulsetech.my",
    "AI e-commerce intelligence",
    "ecommerce analytics Malaysia",
    "ecommerce dashboard",
    "Shopee analytics",
    "TikTok Shop analytics",
    "Shopify analytics",
    "inventory management software",
    "marketing intelligence platform",
    "sales analytics",
    "AI business insights",
    "ecommerce operations platform",
  ],
  locale: "en_MY",
  twitterHandle: "@pulsetechmy",
  ogImage: {
    alt: "Pulse — AI-Powered E-Commerce Intelligence platform",
    width: 1200,
    height: 630,
  },
  links: {
    home: "/home",
    features: "/home/features",
    whyChooseUs: "/home/why-choose-us",
    signIn: "/sign-in",
  },
} as const

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString()
}

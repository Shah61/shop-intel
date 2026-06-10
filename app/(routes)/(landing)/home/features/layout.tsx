import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld"
import { siteConfig } from "@/lib/seo/site"

export const metadata: Metadata = buildPageMetadata({
  title: "Features — Sales Analytics, AI Intelligence, Marketing & Inventory",
  description:
    "Explore Pulse features: unified sales analytics across Shopee, TikTok Shop and Shopify, AI-powered intelligence, marketing campaign tools, inventory management, and physical retail tracking.",
  path: siteConfig.links.features,
  keywords: [
    "Pulse features",
    "ecommerce sales analytics",
    "AI business intelligence",
    "marketing automation",
    "inventory management",
  ],
})

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: siteConfig.links.home },
          { name: "Features", path: siteConfig.links.features },
        ])}
      />
      {children}
    </>
  )
}

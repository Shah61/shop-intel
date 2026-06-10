import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld"
import { siteConfig } from "@/lib/seo/site"

export const metadata: Metadata = buildPageMetadata({
  title: "Why Choose Pulse — Intelligence That Drives Revenue",
  description:
    "Why e-commerce teams choose Pulse: AI intelligence that drives revenue, operations that scale with your brand, and accountability that builds trust across your whole team.",
  path: siteConfig.links.whyChooseUs,
  keywords: [
    "why choose Pulse",
    "ecommerce intelligence platform",
    "scale ecommerce operations",
    "AI for online sellers",
  ],
})

export default function WhyChooseUsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: siteConfig.links.home },
          { name: "Why Choose Us", path: siteConfig.links.whyChooseUs },
        ])}
      />
      {children}
    </>
  )
}

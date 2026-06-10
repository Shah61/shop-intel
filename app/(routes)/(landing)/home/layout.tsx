import type { Metadata } from "next"
import { buildPageMetadata } from "@/lib/seo/metadata"
import { siteConfig } from "@/lib/seo/site"
import { faqJsonLd, JsonLd, softwareApplicationJsonLd } from "@/lib/seo/json-ld"

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: siteConfig.links.home,
  }),
  // Keep the homepage title exact while re-providing the template for child pages
  title: {
    absolute: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[softwareApplicationJsonLd(), faqJsonLd()]} />
      {children}
    </>
  )
}

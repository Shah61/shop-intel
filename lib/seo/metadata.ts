import type { Metadata } from "next"
import { absoluteUrl, siteConfig } from "@/lib/seo/site"

type PageMetadataInput = {
  title: string
  description: string
  /** Route path, e.g. "/home/features" */
  path: string
  keywords?: string[]
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

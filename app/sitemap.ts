import type { MetadataRoute } from "next"
import { absoluteUrl, siteConfig } from "@/lib/seo/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: absoluteUrl(siteConfig.links.home),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl(siteConfig.links.features),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl(siteConfig.links.whyChooseUs),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]
}

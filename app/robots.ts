import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/affiliates",
          "/branches",
          "/intelligence",
          "/inventory",
          "/marketing",
          "/orders",
          "/physical",
          "/sales",
          "/seasonal",
          "/setting",
          "/user-activity",
          "/sign-in",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}

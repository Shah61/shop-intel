import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/seo/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: "/home",
    display: "standalone",
    background_color: "#0a0815",
    theme_color: "#0a0815",
    icons: [
      {
        src: "/Icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  }
}

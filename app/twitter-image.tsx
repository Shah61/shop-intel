import OpenGraphImage from "./opengraph-image"
import { siteConfig } from "@/lib/seo/site"

export const runtime = "edge"
export const alt = siteConfig.ogImage.alt
export const size = {
  width: siteConfig.ogImage.width,
  height: siteConfig.ogImage.height,
}
export const contentType = "image/png"

export default OpenGraphImage

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features",
  description: "Explore Pulse features: sales analytics, AI intelligence, marketing tools, inventory management, and physical retail tracking.",
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right Pulse plan for your business. Monthly, annual, or one-time purchase options available.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

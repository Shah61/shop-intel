import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Why Choose Pulse",
  description: "Intelligence that drives revenue, operations that scale, and accountability that builds trust.",
}

export default function WhyChooseUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pulse | AI-Powered E-Commerce Intelligence",
  description: "Unify sales, marketing, inventory, and AI intelligence in one command center. Built for e-commerce operators.",
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

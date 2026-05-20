import { LandingLenisProvider } from "@/src/components/landing/landing-lenis-provider"

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <LandingLenisProvider>{children}</LandingLenisProvider>
}
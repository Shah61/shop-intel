"use client"

import { ReactLenis } from "lenis/react"
import type { ReactNode } from "react"

import "lenis/dist/lenis.css"

const landingLenisOptions = {
  autoRaf: true,
} as const

export function LandingLenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={landingLenisOptions}>
      {children}
    </ReactLenis>
  )
}

import type { CSSProperties } from "react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import PhotonBeam from "../ui/photon-beam"

import AdsFeatureSection from "./AdsFeaturesSection"

export type AdsStackSection = {
  title: string
  description: string
  image: string
  /** Legacy flat list under “What’s included?” */
  items?: string[]
  /** “What lives inside” lines: `Label — description` */
  livesInside?: string[]
  /** “What our AI does here” bullets */
  aiDoes?: string[]
  price?: string
  investmentBlurb?: string
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3
}

/** 0–1 how far slide `k` (1 … N−1) has entered its handoff zone. */
function slideEntranceRawT(
  progress: number,
  k: number,
  transitions: number,
) {
  const zoneStart = (k - 1) / transitions
  const zoneEnd = k / transitions
  return clamp((progress - zoneStart) / (zoneEnd - zoneStart), 0, 1)
}

function computeStackStyles(
  progress: number,
  N: number,
): { styles: CSSProperties[]; activeIdx: number } {
  const styles: CSSProperties[] = Array.from({ length: N }, () => ({}))
  if (N === 0) return { styles, activeIdx: 0 }
  if (N === 1) {
    styles[0] = {
      transform: "translateY(0px) scale(1)",
      filter: "brightness(1) blur(0px)",
      opacity: 1,
    }
    return { styles, activeIdx: 0 }
  }

  const TRANSITIONS = N - 1

  for (let i = 0; i < N; i++) {
    if (i === 0) {
      const scale = 1 - progress * 0.25
      const yShift = progress * -60
      const blur = progress * 3
      const brightness = 1 - progress * 0.35
      const opacity = 1 - progress * 0.4
      styles[i] = {
        transform: `translateY(${yShift}px) scale(${scale})`,
        filter: `brightness(${brightness}) blur(${blur}px)`,
        opacity,
      }
    } else {
      const zoneStart = (i - 1) / TRANSITIONS
      const zoneEnd = i / TRANSITIONS
      const rawT = clamp((progress - zoneStart) / (zoneEnd - zoneStart), 0, 1)
      const t = easeOut(rawT)
      const slideY = (1 - t) * 100
      styles[i] = {
        transform: `translateY(${slideY}vh) scale(1)`,
        opacity: rawT > 0.001 ? 1 : 0,
        filter: "brightness(1) blur(0px)",
      }

      if (t > 0) {
        for (let j = 1; j < i; j++) {
          const afterStart = j / TRANSITIONS
          const afterEnd = (j + 1) / TRANSITIONS
          const afterT = clamp(
            (progress - afterStart) / (afterEnd - afterStart),
            0,
            1,
          )
          const afterEased = easeOut(afterT)
          const jScale = 1 - afterEased * 0.2
          const jY = afterEased * -50
          const jBlur = afterEased * 2.5
          const jBright = 1 - afterEased * 0.3
          const jOpacity = 1 - afterEased * 0.35
          styles[j] = {
            transform: `translateY(${jY}px) scale(${jScale})`,
            filter: `brightness(${jBright}) blur(${jBlur}px)`,
            opacity: jOpacity,
          }
        }
      }
    }
  }

  let activeIdx = 0
  for (let i = N - 1; i >= 1; i--) {
    const mid = (i - 1) / TRANSITIONS + 0.5 / TRANSITIONS
    if (progress >= mid) {
      activeIdx = i
      break
    }
  }

  // Crossfade: each earlier slide fades out smoothly as the next one enters (same
  // scroll range as the slide-up), instead of snapping off.
  for (let j = 0; j < N - 1; j++) {
    const rawTNext = slideEntranceRawT(progress, j + 1, TRANSITIONS)
    const stayVisible = 1 - easeOut(rawTNext)
    const prev = styles[j].opacity
    const base = typeof prev === "number" ? prev : 1
    const nextOpacity = base * stayVisible
    styles[j] = {
      ...styles[j],
      opacity: nextOpacity,
      ...(nextOpacity < 0.005 ? { visibility: "hidden" as const } : {}),
    }
  }

  return { styles, activeIdx }
}

type Props = {
  sections: AdsStackSection[]
}

export default function AdsFeaturesScrollStack({ sections }: Props) {
  const containerRef = useRef<HTMLElement | null>(null)
  const [styles, setStyles] = useState<CSSProperties[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  const N = sections.length
  const spacerVh = Math.max(160, (N - 1) * 140)

  const update = useCallback(() => {
    const section = containerRef.current
    if (!section || N === 0) return
    const rect = section.getBoundingClientRect()
    const scrollable = Math.max(1, section.offsetHeight - window.innerHeight)
    const progress = clamp(-rect.top / scrollable, 0, 1)
    const { styles: next, activeIdx: nextActive } = computeStackStyles(
      progress,
      N,
    )
    setStyles(next)
    setActiveIdx(nextActive)
  }, [N])

  useLayoutEffect(() => {
    update()
  }, [update])

  useEffect(() => {
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [update])

  if (N === 0) return null

  return (
    <section
      ref={containerRef}
      className="relative z-20 bg-[#0e0e0e]"
      style={{ minHeight: `${100 + spacerVh}vh` }}
      aria-label="Advertising features"
    >
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden [perspective:1200px] relative">
        {/* One WebGL layer for the whole stack (not per slide — avoids 8× contexts). */}
        <div
          className="pointer-events-none absolute inset-0 z-[5]"
          aria-hidden
        >
          <div className="h-full min-h-[50dvh] w-full">
            <PhotonBeam
              colorBg="#030208"
              colorLine="#3b1f55"
              colorSignal="#c4b5fd"
              useColor2
              colorSignal2="#f0abfc"
              useColor3
              colorSignal3="#7dd3fc"
              bloomStrength={2.2}
              bloomRadius={0.45}
              signalCount={72}
              lineCount={64}
            />
          </div>
        </div>
        {sections.map((data, i) => {
          const layerStyle = styles[i] ?? {
            transform: i === 0 ? "translateY(0) scale(1)" : "translateY(100vh) scale(1)",
            opacity: i === 0 ? 1 : 0,
            filter: "brightness(1) blur(0px)",
          }
          const isFront = i === activeIdx

          return (
            <div
              key={data.title}
              className="absolute flex w-full justify-center px-4 md:px-8"
              style={{
                ...layerStyle,
                zIndex: 10 + i * 10,
                willChange: "transform, opacity, filter",
                pointerEvents: isFront ? "auto" : "none",
              }}
            >
              <div className="w-full max-w-7xl">
                <AdsFeatureSection
                  title={data.title}
                  description={data.description}
                  items={data.items}
                  livesInside={data.livesInside}
                  aiDoes={data.aiDoes}
                  price={data.price}
                  investmentBlurb={data.investmentBlurb}
                  image={data.image}
                  reverse={i % 2 !== 0}
                  stackItem
                />
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="pointer-events-none"
        style={{ height: `${spacerVh}vh` }}
        aria-hidden
      />
    </section>
  )
}

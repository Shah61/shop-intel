import { motion } from "framer-motion"

import PhotonBeam from "../ui/photon-beam"

function parseLivesInsideLine(line: string): { lead: string; rest?: string } {
  const m = line.match(/^(.+?)\s*[—–]\s*(.+)$/)
  if (!m) return { lead: line }
  return { lead: m[1].trim(), rest: m[2].trim() }
}

function LivesInsideRow({ line }: { line: string }) {
  const { lead, rest } = parseLivesInsideLine(line)
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
      <span className="text-[15px] leading-relaxed text-white/80">
        {rest != null ? (
          <>
            <span className="font-semibold text-white/90">{lead}</span>
            <span> — {rest}</span>
          </>
        ) : (
          lead
        )}
      </span>
    </li>
  )
}

type Props = {
  title: string
  description: string
  image: string
  items?: string[]
  livesInside?: string[]
  aiDoes?: string[]
  /** Legacy template: “Packages start at {price} per month…” */
  price?: string
  /** Full paragraph under Project Investment (overrides price template when set) */
  investmentBlurb?: string
  reverse?: boolean
  /** Sticky scroll-stack on /features: skip section/motion, fit viewport slot */
  stackItem?: boolean
}

export default function AdsFeatureSection({
  title,
  description,
  items = [],
  livesInside,
  aiDoes,
  price,
  investmentBlurb,
  image,
  reverse,
  stackItem,
}: Props) {
  const investmentText =
    investmentBlurb ??
    (price != null
      ? `Packages start at ${price} per month, covering full campaign strategy, ad creation, and optimization.`
      : "")
  const useNavDetail =
    (livesInside?.length ?? 0) > 0 || (aiDoes?.length ?? 0) > 0

  const rootClass = stackItem
    ? "relative z-10 w-full bg-transparent px-0 py-0"
    : "relative z-20 w-full overflow-hidden bg-black py-28 px-6 md:px-16"

  const Root = stackItem ? "div" : "section"

  const textCol = (
    <>
      <h2
        className={`mb-6 font-bold tracking-tight ${stackItem ? "text-[clamp(28px,4vw,44px)]" : "text-[44px]"}`}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>

      <p
        className={`leading-relaxed text-white/60 ${stackItem && useNavDetail ? "mb-8 max-w-2xl" : stackItem ? "mb-8 max-w-lg" : "mb-10 max-w-lg"}`}
      >
        {description}
      </p>

      {useNavDetail ? (
        <>
          <h3
            className={`mb-4 font-medium ${stackItem ? "text-xl md:text-2xl" : "text-2xl"}`}
          >
            What lives inside
          </h3>
          <ul
            className={`space-y-3 text-white/80 ${stackItem ? "md:space-y-3.5" : "space-y-4"}`}
          >
            {livesInside?.map((line, i) => (
              <LivesInsideRow key={i} line={line} />
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3
            className={`mb-6 font-medium ${stackItem ? "text-xl md:text-2xl" : "text-2xl"}`}
          >
            What&apos;s included?
          </h3>

          <ul
            className={`text-white/80 ${stackItem ? "space-y-3 md:space-y-4" : "space-y-4"}`}
          >
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                {item}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )

  const imageCol = (
    <div className="flex flex-col">
      <img
        src={image}
        alt={title}
        className={`w-full object-cover object-top ${stackItem ? "h-[220px] md:h-[260px]" : "h-[280px]"}`}
      />

      {useNavDetail && (aiDoes?.length ?? 0) > 0 ? (
        <div className={stackItem ? "pt-6 md:pt-8" : "pt-8"}>
          <h3
            className={`mb-4 text-left font-medium ${stackItem ? "text-xl md:text-2xl" : "text-2xl"}`}
          >
            What our AI does here
          </h3>
          <ul
            className={`space-y-3 text-left text-white/80 ${stackItem ? "md:space-y-3.5" : "space-y-4"}`}
          >
            {aiDoes!.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400/90" />
                <span className="text-[15px] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : !useNavDetail ? (
        <div
          className={`text-center ${stackItem ? "px-0 pt-6 md:pt-8" : "px-0 pt-8"}`}
        >
          <h4
            className={`font-medium ${stackItem ? "mb-3 text-xl md:text-2xl" : "mb-4 text-2xl"}`}
          >
            Project Investment
          </h4>

          <p
            className={`text-sm leading-relaxed text-white/50 ${stackItem ? "mb-5" : "mb-6"}`}
          >
            {investmentText}
          </p>

          <button
            type="button"
            className="rounded-full bg-purple-600 px-6 py-3 text-sm font-medium shadow-lg shadow-purple-500/20 transition hover:bg-purple-500"
          >
            Book a call
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <Root className={rootClass}>
      {/* PhotonBeam only on full-page sections; stack uses page BG + scroll animation */}
      {!stackItem && (
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[min(520px,70vh)] w-[min(960px,94vw)] -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        >
          <div
            className={`h-full w-full ${reverse ? "origin-center scale-x-[-1]" : ""}`}
          >
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
      )}

      <div
        className={`relative z-10 mx-auto grid items-center md:grid-cols-2 ${stackItem ? "max-w-none gap-10 md:gap-14" : "max-w-7xl gap-16"}`}
      >

        {/* TEXT — order-1 = first column (left on md); order-2 = second column (right on md) */}
        {stackItem ? (
          <div className={reverse ? "order-2" : "order-1"}>{textCol}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: reverse ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className={reverse ? "order-2" : "order-1"}
          >
            {textCol}
          </motion.div>
        )}

        {/* Image + AI block (nav detail) or legacy investment / CTA */}
        {stackItem ? (
          <div className={reverse ? "order-1" : "order-2"}>{imageCol}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: reverse ? -60 : 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
            className={reverse ? "order-1" : "order-2"}
          >
            {imageCol}
          </motion.div>
        )}

      </div>
    </Root>
  )
}
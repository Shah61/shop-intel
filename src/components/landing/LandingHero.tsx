import { letterDelayMs } from './constants/landing-motion'
import { HeroBottomLabels } from './HeroBottomLabels'
import { HeroShowcase } from './HeroShowcase'

/** White — gradient varies alpha left → right within each glyph */
const WHITE = '255, 255, 255'

type LetterGrad = { ch: string; a0: number; a1: number }

const INTELLIGENCE_LETTERS: LetterGrad[] = [
  { ch: 'I', a0: 0.16, a1: 0.4 },
  { ch: 'N', a0: 0.2, a1: 0.5 },
  { ch: 'T', a0: 0.22, a1: 0.54 },
  { ch: 'E', a0: 0.3, a1: 0.64 },
  { ch: 'L', a0: 0.34, a1: 0.7 },
  { ch: 'L', a0: 0.52, a1: 1 },
  { ch: 'I', a0: 0.58, a1: 1 },
  { ch: 'G', a0: 0.6, a1: 1 },
  { ch: 'E', a0: 0.62, a1: 1 },
  { ch: 'N', a0: 0.24, a1: 0.54 },
  { ch: 'C', a0: 0.21, a1: 0.5 },
  { ch: 'E', a0: 0.16, a1: 0.4 },
]

function GradientLetter({
  ch,
  a0,
  a1,
  index,
}: LetterGrad & { index: number }) {
  return (
    <span
      className="landing-letter-in inline-block"
      style={{ animationDelay: `${letterDelayMs(index)}ms` }}
    >
      <span
        className="inline-block bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(${WHITE}, ${a0}), rgba(${WHITE}, ${a1}))`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      >
        {ch}
      </span>
    </span>
  )
}

export function LandingHero() {
  return (
    <section className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center pt-0">
      <div
        className="font-plus-jakarta relative z-[1] mt-2 inline-flex select-none flex-wrap justify-center gap-x-1 text-center font-extrabold uppercase sm:gap-x-1.5"
        style={{
          fontSize: 'clamp(60px, 11vw, 160px)',
          lineHeight: 1.1,
          letterSpacing: '0.02em',
        }}
      >
        {INTELLIGENCE_LETTERS.map((props, i) => (
          <GradientLetter key={`${props.ch}-${i}`} {...props} index={i} />
        ))}
      </div>

      <HeroShowcase />
      <HeroBottomLabels />
    </section>
  )
}

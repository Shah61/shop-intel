import { BOTTOM_LABELS_DELAY_MS } from './constants/landing-motion'
import { HERO_FEATURE_LABELS } from './constants/landing'

export function HeroBottomLabels() {
  return (
    <div
      className="landing-bottom-fade mx-auto flex max-w-[900px] justify-center gap-20 px-10 pt-20 pb-[60px]"
      style={{ animationDelay: `${BOTTOM_LABELS_DELAY_MS}ms` }}
    >
      {HERO_FEATURE_LABELS.map((label) => (
        <div
          key={label}
          className="text-center text-sm font-medium text-white/40"
        >
          {label}
        </div>
      ))}
    </div>
  )
}

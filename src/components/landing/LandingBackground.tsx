import { BG_IMAGE_SRCSET, LANDING_IMAGES } from '../../constants/landing'

export function LandingBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <img
        src={LANDING_IMAGES.backgroundAvif}
        srcSet={BG_IMAGE_SRCSET}
        sizes="100vw"
        alt=""
        decoding="async"
        fetchPriority="high"
        className="h-full min-h-full w-full object-cover object-center opacity-70"
      />
    </div>
  )
}

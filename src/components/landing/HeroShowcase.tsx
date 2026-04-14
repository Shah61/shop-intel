import {
  DASHBOARD_DELAY_MS,
  SIDE_LEFT_DELAY_MS,
  SIDE_RIGHT_DELAY_MS,
} from '../../constants/landing-motion'
import { LANDING_IMAGES } from '../../constants/landing'

function SideImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="block w-full rounded-xl"
      sizes="(min-width: 1024px) 280px, 42vw"
      loading="lazy"
      decoding="async"
    />
  )
}

export function HeroShowcase() {
  return (
    <div className="relative z-[2] mx-auto mt-6 w-full max-w-[980px] px-4 sm:px-6 sm:mt-8">
      <div className="relative mx-auto w-full max-w-[860px]">
        <div
          className="landing-slide-up relative z-10 mx-auto w-full"
          style={{ animationDelay: `${DASHBOARD_DELAY_MS}ms` }}
        >
          <img
            src={LANDING_IMAGES.dashboard}
            alt="Pulse analytics dashboard"
            className="mx-auto block w-full rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)]"
            sizes="(min-width: 1024px) 860px, 100vw"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="absolute bottom-0 left-0 z-20 w-[min(46%,260px)] max-w-[280px] -translate-x-[52%] -translate-y-[6%] sm:w-[min(42%,280px)] sm:-translate-x-[60%] sm:-translate-y-[5%] lg:w-[min(38%,300px)] lg:-translate-x-[68%]">
          <div
            className="landing-from-left"
            style={{ animationDelay: `${SIDE_LEFT_DELAY_MS}ms` }}
          >
            <SideImage
              src={LANDING_IMAGES.leftSide}
              alt="Pulse assistant"
            />
          </div>
        </div>

        <div className="absolute top-0 right-0 z-20 w-[min(46%,260px)] max-w-[280px] translate-x-[52%] -translate-y-[6%] sm:w-[min(42%,280px)] sm:translate-x-[60%] sm:-translate-y-[5%] lg:w-[min(38%,300px)] lg:translate-x-[68%]">
          <div
            className="landing-from-right"
            style={{ animationDelay: `${SIDE_RIGHT_DELAY_MS}ms` }}
          >
            <SideImage
              src={LANDING_IMAGES.rightSide}
              alt="Branch performance"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

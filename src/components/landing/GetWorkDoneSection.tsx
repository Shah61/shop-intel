"use client"

import '@fontsource/press-start-2p'

const pixelLogoGradient = `linear-gradient(
  90deg,
  #a78bfa 0%,     /* soft purple */
  #c084fc 20%,    /* richer purple */
  #e879f9 40%,    /* pinkish purple */
  #f472b6 60%,    /* pink */
  #fb7185 75%,    /* soft red/pink */
  rgba(255,255,255,0.15) 90%,
  rgba(255,255,255,0.05) 100%
)`

export default function GetWorkDoneSection() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="flex min-h-dvh w-full flex-col items-center justify-center gap-14 bg-[#0d0d0e] px-5 py-16 sm:px-8 lg:gap-16 lg:px-10">
      <div
        className="relative w-full max-w-[min(86.4vw,1512px)] overflow-hidden rounded-2xl border border-white/10 px-8 py-[3.85rem] text-center sm:px-12 sm:py-[4.4rem]"
        style={{
          background: `
            radial-gradient(circle at 70% 20%, rgba(255, 120, 200, 0.25), transparent 40%),
            radial-gradient(circle at 30% 80%, rgba(120, 150, 255, 0.2), transparent 50%),
            linear-gradient(135deg, #0b0a14 0%, #100e1b 40%, #0a0f2c 100%)
          `,
        }}
      >
        <div className="pointer-events-none absolute inset-0 backdrop-blur-[20px]" />

        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-semibold text-white md:text-5xl">
            Move from insight to action
          </h2>

          <p className="mb-10 text-lg text-gray-400">
            Pulse gives your team one place to understand what changed and what to do next.
          </p>

          <button
            type="button"
            onClick={scrollToContact}
            className="rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-3 font-medium text-white shadow-lg transition hover:opacity-90"
          >
            Try Pulse Now
          </button>
        </div>
      </div>

      <div className="w-full overflow-hidden">
      <div className="w-full overflow-hidden">
  <div className="marquee flex w-max">
    {Array.from({ length: 10 }).map((_, i) => (
      <span
        key={i}
        className="flex items-center text-[120px] md:text-[180px] tracking-normal uppercase"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        {/* COLORED */}
        <span
          className="text-transparent bg-clip-text"
          style={{ backgroundImage: pixelLogoGradient }}
        >
          Pulse
        </span>

        {/* GREY (NO SPACE BEFORE IT) */}
        <span className="text-gray-700">Pulse</span>
      </span>
    ))}

    {/* duplicate */}
    {Array.from({ length: 10 }).map((_, i) => (
      <span
        key={`dup-${i}`}
        className="flex items-center text-[120px] md:text-[180px] tracking-normal uppercase"
        style={{ fontFamily: '"Press Start 2P", monospace' }}
      >
        <span
          className="text-transparent bg-clip-text"
          style={{ backgroundImage: pixelLogoGradient }}
        >
          Pulse
        </span>

        <span className="text-gray-700">Pulse</span>
      </span>
    ))}
  </div>
</div>
</div>
    </section>
  )
}

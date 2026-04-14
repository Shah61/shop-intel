import { useState, useEffect, useRef, type RefObject } from "react";

const STEPS = [
  { id: "01", features: ["SDK Integration", "Blockchain API"] },
  { id: "02", features: ["Real-time Sync", "Webhook Pipeline"] },
  { id: "03", features: ["Secure Enclave", "Audit Logging"] },
];

const STATS = [
  { label: "Satisfaction", value: "128K" },
  { label: "Integrations", value: "200+" },
  { label: "Transaction", value: "80.1%" },
];

const VIDEO_PLACEHOLDER_BG =
  "linear-gradient(145deg, #1e1440 0%, #4a2060 30%, #7a3d6a 55%, #9a6080 75%, #5a3070 100%)";

function useScrollReveal(
  threshold = 0.15
): [RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

export default function RealTimeIntelligenceSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  const [sectionRef, sectionVisible] = useScrollReveal(0.12);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .rti-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── LEFT SLIDE ANIMATIONS ── */
        .anim-slide-left {
          opacity: 0;
          transform: translateX(-80px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .anim-slide-left.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── RIGHT SLIDE ANIMATIONS ── */
        .anim-slide-right {
          opacity: 0;
          transform: translateX(80px);
          transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .anim-slide-right.visible {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── VIDEO "OPEN UP" / SCALE ANIMATION ── */
        .anim-video-open {
          opacity: 0;
          transform: scale(0.55) translateY(30px);
          border-radius: 28px;
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                      border-radius 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .anim-video-open.visible {
          opacity: 1;
          transform: scale(1) translateY(0);
          border-radius: 16px;
        }

        /* ── FADE UP ── */
        .anim-fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .anim-fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── FEATURE SWITCH ── */
        .feature-text {
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .feature-text-enter {
          animation: featureIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes featureIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="rti-root flex min-h-dvh w-full flex-col bg-[#0d0d0f] text-white"
      >
        <div className="flex w-full max-w-none flex-1 flex-col justify-center px-5 py-12 sm:px-8 md:px-10 lg:px-12 lg:py-14 xl:px-16 2xl:px-20">
          {/* ── HEADER ROW ── */}
          <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0">
            {/* Headline — slides from left */}
            <div
              className={`anim-slide-left ${sectionVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h2 className="text-[clamp(32px,5vw,48px)] font-bold leading-[1.15] tracking-[-1px] text-white">
                Turn Data into
                <br />
                Real Time Intelligence
              </h2>
            </div>

            {/* Description — slides from right */}
            <div
              className={`anim-slide-right lg:flex lg:justify-end lg:pt-2.5 lg:pb-10 ${sectionVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.25s" }}
            >
              <p className="max-w-[300px] text-[14.5px] leading-[1.7] text-white/[0.55] lg:text-right">
                Visualize insights, detect anomalies, and make data-driven
                decisions — all from one powerful AI dashboard.
              </p>
            </div>
          </div>

          {/* ── MAIN CONTENT ROW ── */}
          <div className="mt-2 flex min-h-0 w-full flex-col gap-10 lg:mt-4 lg:min-h-[min(52vh,560px)] lg:flex-row lg:items-stretch lg:gap-6 xl:gap-10">
            {/* Stats — slide from left, staggered */}
            <div className="flex flex-row flex-wrap justify-between gap-8 sm:gap-10 lg:flex-col lg:justify-between lg:gap-0 lg:shrink-0 lg:pr-2 lg:pt-2.5 lg:pb-2.5 xl:pr-6 min-[1400px]:min-w-[160px]">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`anim-slide-left flex flex-col gap-1.5 ${sectionVisible ? "visible" : ""}`}
                  style={{ transitionDelay: `${0.3 + i * 0.15}s` }}
                >
                  <span className="text-xs font-medium tracking-[0.5px] text-white/[0.35] capitalize">
                    {s.label}
                  </span>
                  <span className="text-[32px] font-bold tracking-[-0.5px] text-white">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Video — scale open from center */}
            <div
              className={`anim-video-open group relative min-h-[220px] w-full min-w-0 flex-1 cursor-pointer overflow-hidden lg:aspect-[4/3] lg:min-h-0 lg:max-h-[min(72vh,820px)] ${sectionVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.35s" }}
            >
              <div
                className="absolute inset-0"
                style={{ background: VIDEO_PLACEHOLDER_BG }}
                aria-hidden
              />
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/[0.15] transition-colors duration-300 group-hover:bg-black/25">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/[0.15] bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                  <svg
                    className="ml-[3px] h-6 w-6 fill-white"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <polygon points="8,5 19,12 8,19" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right panel — steps + features slide from right */}
            <div className="flex min-w-0 shrink-0 flex-col justify-between lg:min-w-[200px] lg:pl-4 xl:min-w-[220px] xl:pl-10">
              {/* Step buttons */}
              <div
                className={`anim-slide-right flex gap-6 pt-2.5 lg:gap-6 ${sectionVisible ? "visible" : ""}`}
                style={{ transitionDelay: "0.5s" }}
              >
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className={`cursor-pointer border-none bg-transparent p-0 text-sm font-semibold transition-colors duration-300 ${
                      activeStep === i
                        ? "text-white"
                        : "text-white/25 hover:text-white/60"
                    }`}
                    aria-pressed={activeStep === i}
                    aria-label={`Step ${s.id}`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>

              {/* Features with branch SVG */}
              <div
                className={`anim-slide-right flex flex-1 items-center pt-5 ${sectionVisible ? "visible" : ""}`}
                style={{ transitionDelay: "0.65s" }}
              >
                <svg
                  className="h-[160px] w-[60px] shrink-0"
                  viewBox="0 0 60 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M 0 30 L 15 30 Q 25 30 25 40 L 25 55 Q 25 65 35 65 L 60 65"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M 25 55 L 25 105"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                    fill="none"
                  />
                  <path
                    d="M 25 105 Q 25 115 35 115 L 60 115"
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
                <div className="flex flex-col">
                  <span
                    key={`f0-${activeStep}`}
                    className="feature-text feature-text-enter pb-[62px] text-[14.5px] font-medium whitespace-nowrap text-white"
                  >
                    {step.features[0]}
                  </span>
                  <span
                    key={`f1-${activeStep}`}
                    className="feature-text feature-text-enter text-[14.5px] font-medium whitespace-nowrap text-white"
                    style={{ animationDelay: "0.08s" }}
                  >
                    {step.features[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
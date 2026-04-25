import { useState, useEffect, useRef, useCallback, type RefObject } from "react";

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

function useScrollReveal(
  threshold = 0.15
): [RefObject<HTMLElement>, boolean] {
  const ref = useRef<HTMLElement>(null);
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

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const userInteractedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Global interaction listener
  useEffect(() => {
    const handleInteraction = () => {
      if (userInteractedRef.current) return;
      userInteractedRef.current = true;

      const v = videoRef.current;
      if (v && !v.paused) {
        v.muted = false;
        setIsMuted(false);
      }
    };

    const events: (keyof WindowEventMap)[] = [
      "click",
      "touchstart",
      "keydown",
      "scroll",
      "wheel",
      "mousemove",
      "pointerdown",
    ];

    events.forEach((evt) =>
      window.addEventListener(evt, handleInteraction, {
        once: false,
        passive: true,
      })
    );

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, handleInteraction)
      );
    };
  }, []);

  const setVideoWrapper = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    videoWrapperRef.current = node;
    if (!node) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (!v) return;

        if (entry.isIntersecting) {
          if (userInteractedRef.current) {
            v.muted = false;
            v.play()
              .then(() => {
                setIsPlaying(true);
                setHasStarted(true);
                setIsMuted(false);
              })
              .catch(() => {
                v.muted = true;
                setIsMuted(true);
                v.play()
                  .then(() => {
                    setIsPlaying(true);
                    setHasStarted(true);
                  })
                  .catch(() => setIsPlaying(false));
              });
          } else {
            v.muted = true;
            setIsMuted(true);
            v.play()
              .then(() => {
                setIsPlaying(true);
                setHasStarted(true);
              })
              .catch(() => setIsPlaying(false));
          }
        } else {
          v.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.4 }
    );

    obs.observe(node);
    observerRef.current = obs;
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const handleVideoClick = () => {
    const v = videoRef.current;
    if (!v) return;

    userInteractedRef.current = true;

    if (v.paused) {
      v.muted = false;
      setIsMuted(false);
      v.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      });
    } else {
      if (v.muted) {
        v.muted = false;
        setIsMuted(false);
      } else {
        v.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .rti-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

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

        .play-overlay {
          transition: opacity 0.35s ease;
        }
      `}</style>

      <section
        ref={sectionRef}
        className="rti-root flex min-h-dvh w-full flex-col bg-[#0d0d0f] text-white"
      >
        <div className="flex w-full max-w-none flex-1 flex-col justify-center px-5 py-12 sm:px-8 md:px-10 xl:px-12 xl:py-14 2xl:px-20">
          {/* ── HEADER ROW ── */}
          <div className="grid w-full grid-cols-1 gap-10 xl:grid-cols-2 xl:gap-x-12 xl:gap-y-0">
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

            <div
              className={`anim-slide-right xl:flex xl:justify-end xl:pt-2.5 xl:pb-10 ${sectionVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.25s" }}
            >
              <p className="max-w-[300px] text-[14.5px] leading-[1.7] text-white/[0.55] xl:text-right">
                Visualize insights, detect anomalies, and make data-driven
                decisions — all from one powerful AI dashboard.
              </p>
            </div>
          </div>

          {/* ── MAIN CONTENT ROW ──
              Stacks vertically until 1280px (xl). Below that — phones, tablets,
              small laptops — everything stacks so the video keeps a natural
              aspect ratio instead of getting horizontally stretched. */}
          <div className="mt-2 flex min-h-0 w-full flex-col gap-10 xl:mt-4 xl:min-h-[min(52vh,560px)] xl:flex-row xl:items-stretch xl:gap-10">
            {/* Stats */}
            <div className="flex flex-row flex-wrap justify-between gap-8 sm:gap-10 xl:flex-col xl:justify-between xl:gap-0 xl:shrink-0 xl:pr-2 xl:pt-2.5 xl:pb-2.5 2xl:pr-6 2xl:min-w-[160px]">
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

            {/* Video — keeps a controlled aspect ratio at every screen size */}
            <div
              ref={setVideoWrapper}
              onClick={handleVideoClick}
              className={`anim-video-open group relative w-full min-w-0 cursor-pointer overflow-hidden bg-black aspect-video sm:aspect-[16/10] md:aspect-[16/9] xl:aspect-[4/3] xl:flex-1 xl:min-h-0 xl:max-h-[min(72vh,820px)] ${sectionVisible ? "visible" : ""}`}
              style={{ transitionDelay: "0.35s" }}
            >
              <video
                ref={videoRef}
                src="/video.mp4"
                playsInline
                loop
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div
                className={`play-overlay absolute inset-0 z-[1] flex items-center justify-center bg-black/[0.15] group-hover:bg-black/25 ${
                  isPlaying && hasStarted && !isMuted
                    ? "opacity-0 group-hover:opacity-100"
                    : "opacity-100"
                }`}
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/[0.15] bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                  {isMuted ? (
                    <svg
                      className="h-6 w-6 fill-white"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : isPlaying ? (
                    <svg
                      className="h-6 w-6 fill-white"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <rect x="6" y="5" width="4" height="14" />
                      <rect x="14" y="5" width="4" height="14" />
                    </svg>
                  ) : (
                    <svg
                      className="ml-[3px] h-6 w-6 fill-white"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  )}
                </div>

                {isMuted && isPlaying && (
                  <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    Tap to unmute
                  </span>
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex min-w-0 shrink-0 flex-col justify-between xl:min-w-[200px] xl:pl-4 2xl:min-w-[220px] 2xl:pl-10">
              <div
                className={`anim-slide-right flex gap-6 pt-2.5 xl:gap-6 ${sectionVisible ? "visible" : ""}`}
                style={{ transitionDelay: "0.5s" }}
              >
                {STEPS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveStep(i);
                    }}
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
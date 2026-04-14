    // components/landing/WhyPulseSection.tsx
import { useState, useEffect, useRef, type ReactNode } from 'react'

/* ===== CIRCULAR PROGRESS RING ===== */
function CircleProgress({
  percent,
  label,
  color,
}: {
  percent: number
  label: string
  color: string
}) {
  const r = 30
  const c = 2 * Math.PI * r
  const off = c - (percent / 100) * c
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[68px] w-[68px]">
        <svg
          width="68"
          height="68"
          viewBox="0 0 68 68"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="4.5"
          />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4.5"
            strokeDasharray={c}
            strokeDashoffset={off}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
          {percent}%
        </div>
      </div>
      <span className="text-[11px] font-medium text-white/50">{label}</span>
    </div>
  )
}

/* ===== CHECK CIRCLE ICON ===== */
function CheckCircle({ id = 'bg' }: { id?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/* ===== SCROLL INDICATOR ===== */
function ScrollIndicator({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="sticky top-[50vh] flex w-[14px] shrink-0 -translate-y-1/2 flex-col items-center gap-1.5">
      {[0, 1, 2].map((idx) => {
        const isActive = idx === activeIndex
        return (
          <div
            key={idx}
            className="transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              width: isActive ? '3px' : '5px',
              height: isActive ? '32px' : '5px',
              borderRadius: isActive ? '3px' : '50%',
              background: isActive
                ? 'linear-gradient(180deg, #a78bfa, #e879f9)'
                : 'rgba(255,255,255,0.25)',
            }}
          />
        )
      })}
    </div>
  )
}

/* ===== GOALS CARD (BACK) ===== */
function GoalsCard() {
  const bars = [
    {
      w: '75%',
      bg: 'linear-gradient(90deg, #e879f9, #f472b6, #c084fc, rgba(255,255,255,0.35))',
      label: 'Saving',
    },
    {
      w: '58%',
      bg: 'linear-gradient(90deg, #818cf8, #a78bfa, rgba(200,180,255,0.45))',
      label: 'Project',
    },
    {
      w: '42%',
      bg: 'linear-gradient(90deg, #6366f1, #818cf8, rgba(180,170,255,0.35))',
      label: 'Innovation',
    },
    {
      w: '28%',
      bg: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
      label: 'Notification',
    },
  ]

  return (
    <div className="w-full rounded-2xl border border-white/[0.07] bg-[rgba(14,11,28,0.96)] px-[26px] pt-[26px] pb-[22px]">
      <h3 className="mb-[18px] text-xl font-bold text-white">Goals</h3>
      {bars.map((b, i) => (
        <div key={i} className={i < 3 ? 'mb-3' : ''}>
          <div className="flex items-center gap-3">
            <div className="h-[13px] flex-1 overflow-hidden rounded-[7px] bg-white/5">
              <div
                className="h-full rounded-[7px]"
                style={{ width: b.w, background: b.bg }}
              />
            </div>
            <span className="min-w-[72px] text-right text-xs font-medium text-white/[0.65]">
              {b.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===== READING GOALS CARD (FRONT) ===== */
function ReadingGoalsCard() {
  return (
    <div className="relative z-[2] mx-auto -mt-[60px] w-[92%] rounded-2xl border border-white/[0.09] bg-[rgba(10,8,22,0.98)] p-[22px] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="mb-4 flex items-center gap-[9px]">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-violet-500/[0.18]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2.2"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-white">Reading Goals</span>
      </div>
      {/* Progress bar */}
      <div className="mb-5 flex items-center gap-[10px]">
        <div className="h-[14px] flex-1 overflow-hidden rounded-[9px] bg-white/5">
          <div
            className="h-full w-[70%] rounded-[9px]"
            style={{
              background:
                'linear-gradient(90deg, #e879f9, #c084fc, #818cf8, rgba(200,200,255,0.45))',
            }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-white/60">
          35 of 50 books
        </span>
      </div>
      {/* Circle progress */}
      <div className="mb-4 flex justify-between px-1">
        <CircleProgress percent={45} label="Scifi" color="#a78bfa" />
        <CircleProgress percent={14} label="Horror" color="#6366f1" />
        <CircleProgress percent={20} label="Lit" color="#818cf8" />
        <CircleProgress percent={21} label="Classic" color="#4f46e5" />
      </div>
      {/* Footer */}
      <div className="rounded-[10px] border border-white/[0.04] bg-white/[0.035] py-[11px] text-center text-xs font-medium text-white/[0.55]">
        You have 158 days left
      </div>
    </div>
  )
}

/* ===== SECTIONS DATA ===== */
interface Section {
  title: ReactNode
  body: ReactNode
}

const SECTIONS: Section[] = [
  {
    title: 'Everything in one place',
    body: (
      <>
        Juggling between multiple apps for notes, tasks, and projects is
        frustrating and inefficient. With Pulse, you get a unified workspace
        where you can write documents, manage projects, track tasks, and build
        databases—all within a single, customizable platform. No more jumping
        between scattered tools or losing important information.
      </>
    ),
  },
  {
    title: (
      <>
        Fully Customizable &amp;
        <br />
        Flexible
      </>
    ),
    body: (
      <>
        No two workflows are the same, which is why Pulse lets you structure your
        workspace the way{' '}
        <strong className="font-bold text-white">you</strong> want. Use
        drag-and-drop elements to design pages, create nested databases, and
        build workspaces that fit your needs—whether you're an individual
        organizing personal projects or a team managing large-scale operations.
      </>
    ),
  },
  {
    title: (
      <>
        Real-Time Collaboration
        <br />
        Made Simple
      </>
    ),
    body: (
      <>
        Stay in sync with your team, no matter where they are. With live
        editing, task assignments, inline comments, and shared workspaces,
        collaboration feels{' '}
        <strong className="font-bold text-white">
          effortless and intuitive.
        </strong>{' '}
        Need to control who can see or edit certain information? Custom
        permissions ensure that the right people have access to the right
        content.
      </>
    ),
  },
]

/* ===== MAIN EXPORT ===== */
export function WhyPulse() {
  const [activeSection, setActiveSection] = useState(0)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(
              entry.target as HTMLDivElement
            )
            if (idx !== -1) setActiveSection(idx)
          }
        })
      },
      { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
    )
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative z-10 mx-auto max-w-[1280px] px-8 pt-10">
      <div className="overflow-visible rounded-3xl border border-white/[0.055] bg-white/[0.022] px-[60px] pt-[70px] pb-[80px]">
        <div className="flex items-start gap-[50px]">
          {/* LEFT: Indicator + scrolling text */}
          <div className="flex flex-[1_1_55%] items-start gap-6">
            <ScrollIndicator activeIndex={activeSection} />

            <div className="flex-1">
              {SECTIONS.map((s, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    sectionRefs.current[idx] = el
                  }}
                  className={`flex flex-col justify-center ${
                    idx < 2 ? 'min-h-[85vh]' : 'pb-10'
                  }`}
                  style={{ paddingTop: idx === 0 ? 0 : '20px' }}
                >
                  {/* Badge */}
                  <div className="mb-[18px] inline-flex w-fit items-center gap-[7px] self-start rounded-full border border-white/[0.07] bg-white/[0.055] px-4 py-[7px]">
                    <CheckCircle id={`wz${idx}`} />
                    <span className="text-[13px] font-medium text-white/85">
                      Why Pulse
                    </span>
                  </div>

                  {/* Heading */}
                  <h2
                    className="mb-6 font-serif text-white"
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 'clamp(28px, 3.2vw, 44px)',
                      fontWeight: 400,
                      lineHeight: 1.18,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {s.title}
                  </h2>

                  {/* Body */}
                  <p className="max-w-[500px] text-[15px] leading-[1.85] text-white/45">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Sticky dashboard cards */}
          <div className="sticky top-[15vh] flex-[0_0_360px] self-start">
            <GoalsCard />
            <ReadingGoalsCard />
          </div>
        </div>
      </div>
    </section>
  )
}
import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";

function publicImage(path: string) {
  const base = "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}${path.replace(/^\/+/, "")}`;
}

const TOP_CARDS = [
  {
    title: "Commerce Signal Clarity",
    body: "Pulse combines sales, marketing, and operations signals so teams can spot what changed and why in real time.",
    image: publicImage("images/second/card1.png"),
    placeholder: "p1" as const,
    icon: "pin" as const,
  },
  {
    title: "Campaign to Revenue Visibility",
    body: "Track performance from ad spend to conversion with one connected view across channels and teams.",
    image: publicImage("images/second/card2.png"),
    placeholder: "p2" as const,
    icon: "grid" as const,
  },
  {
    title: "AI Decisions, Not Noise",
    body: "Get plain-language recommendations from your own business data so daily decisions are faster and more confident.",
    image: publicImage("images/second/card3.png"),
    placeholder: "p3" as const,
    icon: "layers" as const,
  },
];

const BOTTOM_CARDS = [
  {
    title: "Inventory and Fulfillment Control",
    body: "See stock movement, delivery risks, and fulfillment bottlenecks before they impact customer experience.",
    image: publicImage("images/second/bigCard1.png"),
    placeholder: "p4" as const,
    icon: "sun" as const,
    tall: true,
  },
  {
    title: "Aligned Teams at Every Branch",
    body: "Benchmark store and branch performance with shared metrics so leaders can coach consistently and scale what works.",
    image: publicImage("images/second/bigCard2.png"),
    placeholder: "p5" as const,
    icon: "bolt" as const,
    tall: true,
  },
];

const PLACEHOLDER_BG: Record<"p1" | "p2" | "p3" | "p4" | "p5", string> = {
  p1: "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533483 100%)",
  p2: "linear-gradient(135deg, #0d1117 0%, #1b4332 30%, #2d6a4f 60%, #52b788 80%, #95d5b2 100%)",
  p3: "linear-gradient(135deg, #1a1a2e 0%, #4a1942 40%, #c84b8b 80%, #e8a0bf 100%)",
  p4: "linear-gradient(135deg, #0d0d0d 0%, #1c1c3a 30%, #3a3a6a 60%, #6a5acd 100%)",
  p5: "linear-gradient(135deg, #1a0a2e 0%, #3d1a6e 30%, #7b2d8e 50%, #e84393 80%, #fd79a8 100%)",
};

/* ── Scroll reveal hook ── */
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
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

  return [ref, visible] as const;
}

/* ── Animated wrapper ── */
function ScrollReveal({
  children,
  animation = "slide-down",
  delay = 0,
  threshold = 0.12,
  className = "",
}: {
  children: ReactNode;
  animation?: string;
  delay?: number;
  threshold?: number;
  className?: string;
}) {
  const [ref, visible] = useScrollReveal(threshold);
  return (
    <div
      ref={ref}
      className={`sr sr-${animation} ${visible ? "sr-go" : ""} ${className}`}
      style={{ "--sr-d": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ── Icons ── */
function PlaceholderIcon({ name }: { name: "pin" | "grid" | "layers" | "sun" | "bolt" }) {
  const cls = "h-16 w-16 text-white/25";
  switch (name) {
    case "pin":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7.5L12 22l-3-5.5C7 14.5 5 12 5 9a7 7 0 0 1 7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "grid":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "layers":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "sun":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
        </svg>
      );
    case "bolt":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    default:
      return null;
  }
}

function CardVisual({
  image,
  placeholder,
  icon,
  tall,
}: {
  image?: string;
  placeholder: keyof typeof PLACEHOLDER_BG;
  icon: "pin" | "grid" | "layers" | "sun" | "bolt";
  tall?: boolean;
}) {
  const h = tall ? "h-[320px] max-[600px]:h-[240px]" : "h-[280px] max-[600px]:h-[240px]";

  if (image) {
    return (
      <div className={`relative w-full overflow-hidden ${h}`}>
        <img
          src={image}
          alt=""
          className="block h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${h}`}>
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: PLACEHOLDER_BG[placeholder] }}
      >
        <PlaceholderIcon name={icon} />
      </div>
    </div>
  );
}

function StoryCard({
  title,
  body,
  image,
  placeholder,
  icon,
  tall,
}: {
  title: string;
  body: string;
  image?: string;
  placeholder: keyof typeof PLACEHOLDER_BG;
  icon: "pin" | "grid" | "layers" | "sun" | "bolt";
  tall?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#161619] transition-[transform,border-color,box-shadow] duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-white/[0.12] hover:shadow-[0_20px_60px_-12px_rgba(100,60,180,0.25)]">
      <CardVisual image={image} placeholder={placeholder} icon={icon} tall={tall} />
      <div
        className="absolute inset-x-0 bottom-0 px-6 pb-6 pt-7"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        }}
      >
        <h3
          className="mb-2 text-[1.35rem] font-bold leading-tight tracking-[-0.01em] text-[#f0efe9]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h3>
        <p className="max-w-[340px] text-[0.82rem] leading-[1.55] text-[#f0efe9]/60">{body}</p>
      </div>
    </article>
  );
}

export default function HumanityThroughAISection() {
  return (
    <section className="bg-[#0d0d0f] font-dm-sans text-[#f0efe9] overflow-hidden">
      <style>{`
        .sr { will-change: opacity, transform; }

        /* ── SLIDE DOWN — cards enter from top, firm deceleration, no bounce ── */
        .sr-slide-down {
          opacity: 0;
          transform: translateY(-90px);
          transition: opacity 0.75s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.75s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--sr-d, 0s);
        }
        .sr-slide-down.sr-go {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── SLIDE UP — bottom cards push up firmly ── */
        .sr-slide-up {
          opacity: 0;
          transform: translateY(90px);
          transition: opacity 0.8s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--sr-d, 0s);
        }
        .sr-slide-up.sr-go {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── SLIDE LEFT — title enters from the left, heavy ── */
        .sr-slide-left {
          opacity: 0;
          transform: translateX(-120px);
          transition: opacity 0.85s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.85s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--sr-d, 0s);
        }
        .sr-slide-left.sr-go {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── SLIDE RIGHT — description enters from the right ── */
        .sr-slide-right {
          opacity: 0;
          transform: translateX(120px);
          transition: opacity 0.85s cubic-bezier(0.33, 0, 0.2, 1),
                      transform 0.85s cubic-bezier(0.33, 0, 0.2, 1);
          transition-delay: var(--sr-d, 0s);
        }
        .sr-slide-right.sr-go {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>

      <div className="mx-auto max-w-[1200px] px-8 py-20 max-[600px]:px-4 max-[600px]:py-12">
        {/* ── HEADER ── */}
        <header className="mb-16 flex flex-wrap items-start justify-between gap-10 max-[600px]:flex-col">
          <ScrollReveal animation="slide-left" delay={0} threshold={0.05}>
            <h2
              className="max-w-[480px] text-[clamp(2.8rem,6vw,4.2rem)] font-extrabold leading-[1.1] tracking-[-0.02em]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Humanity Through Artificial Intelligence
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="slide-right" delay={0.15} threshold={0.05}>
            <p className="mt-3 max-w-[280px] text-[0.95rem] leading-relaxed text-[#f0efe9]/60">
              Pulse helps modern commerce teams move from scattered data to coordinated, high-confidence execution.
            </p>
          </ScrollReveal>
        </header>

        {/* ── TOP 3 CARDS — slide down from above, staggered ── */}
        <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
          {TOP_CARDS.map((c, i) => (
            <ScrollReveal
              key={c.title}
              animation="slide-down"
              delay={i * 0.18}
              threshold={0.05}
            >
              <StoryCard
                title={c.title}
                body={c.body}
                image={c.image}
                placeholder={c.placeholder}
                icon={c.icon}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* ── BOTTOM 2 CARDS — slide up from below ── */}
        <div className="mt-6 grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
          {BOTTOM_CARDS.map((c, i) => (
            <ScrollReveal
              key={c.title}
              animation="slide-up"
              delay={i * 0.2}
              threshold={0.05}
            >
              <StoryCard
                title={c.title}
                body={c.body}
                image={c.image}
                placeholder={c.placeholder}
                icon={c.icon}
                tall
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
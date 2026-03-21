"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/* Shop Intel — universal loader / skeleton helpers ("Convergence").
   Inject keyframes once per document. */

const STYLE_ID = "shop-intel-loader-keyframes";

const KEYFRAMES_CSS = `
  @keyframes si-orbit {
    0% { transform: rotate(0deg) translateX(var(--si-radius)) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(var(--si-radius)) rotate(-360deg); }
  }
  @keyframes si-breathe {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 1; }
  }
  @keyframes si-pulse-ring {
    0% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1); opacity: 0; }
    100% { transform: scale(0.8); opacity: 0.5; }
  }
  @keyframes si-converge-1 {
    0%, 100% { transform: translate(-14px, -6px) scale(0.85); }
    25% { transform: translate(4px, -10px) scale(1.1); }
    50% { transform: translate(10px, 4px) scale(0.95); }
    75% { transform: translate(-6px, 8px) scale(1.05); }
  }
  @keyframes si-converge-2 {
    0%, 100% { transform: translate(12px, 8px) scale(1.05); }
    25% { transform: translate(-8px, 12px) scale(0.9); }
    50% { transform: translate(-12px, -6px) scale(1.1); }
    75% { transform: translate(6px, -10px) scale(0.85); }
  }
  @keyframes si-converge-3 {
    0%, 100% { transform: translate(6px, -12px) scale(0.95); }
    25% { transform: translate(10px, 6px) scale(1.05); }
    50% { transform: translate(-8px, 10px) scale(0.85); }
    75% { transform: translate(-10px, -4px) scale(1.1); }
  }
  @keyframes si-converge-4 {
    0%, 100% { transform: translate(-8px, 10px) scale(1.1); }
    25% { transform: translate(6px, -8px) scale(0.85); }
    50% { transform: translate(14px, 2px) scale(1.05); }
    75% { transform: translate(-4px, -12px) scale(0.95); }
  }
  @keyframes si-bar-wave {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
  @keyframes si-dot-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes si-spin-smooth {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const CHANNELS = [
    { color: "#a78bfa", name: "TikTok" },
    { color: "#67e8f9", name: "Shopee" },
    { color: "#6ee7b7", name: "Shopify" },
    { color: "#fbbf24", name: "Store" },
] as const;

function useShopIntelLoaderKeyframes() {
    useLayoutEffect(() => {
        if (typeof document === "undefined") return;
        if (document.getElementById(STYLE_ID)) return;
        const el = document.createElement("style");
        el.id = STYLE_ID;
        el.textContent = KEYFRAMES_CSS;
        document.head.appendChild(el);
    }, []);
}

export function TinyLoader({ variant = "dots" }: { variant?: "dots" | "spin" | "bars" }) {
    useShopIntelLoaderKeyframes();

    if (variant === "spin") {
        return (
            <div className="inline-flex items-center justify-center" style={{ width: 16, height: 16 }}>
                <div
                    style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid rgba(167,139,250,0.15)",
                        borderTopColor: "#a78bfa",
                        animation: "si-spin-smooth 0.8s linear infinite",
                    }}
                />
            </div>
        );
    }

    if (variant === "bars") {
        return (
            <div className="inline-flex items-center gap-[2px]" style={{ height: 14 }}>
                {CHANNELS.map((ch, i) => (
                    <div
                        key={ch.name}
                        style={{
                            width: 2.5,
                            height: 14,
                            borderRadius: 1,
                            background: ch.color,
                            opacity: 0.7,
                            transformOrigin: "bottom",
                            animation: `si-bar-wave 1s ease-in-out ${i * 0.12}s infinite`,
                        }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-[4px]">
            {CHANNELS.map((ch, i) => (
                <div
                    key={ch.name}
                    style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: ch.color,
                        opacity: 0.8,
                        animation: `si-dot-bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                />
            ))}
        </div>
    );
}

const SMALL_LOADER_SIZES = {
    default: {
        box: 32,
        center: 5,
        centerOffset: 2.5,
        radius: 11,
        dot: (i: number) => 5 - i * 0.4,
        glow: 8,
        labelSize: 11,
        gapClass: "gap-2",
    },
    large: {
        box: 52,
        center: 8,
        centerOffset: 4,
        radius: 18,
        dot: (i: number) => 8 - i * 0.65,
        glow: 12,
        labelSize: 13,
        gapClass: "gap-3",
    },
} as const;

export function SmallLoader({
    label = "",
    className,
    size = "default",
    labelColor = "rgba(167,139,250,0.55)",
    centerPulseColor = "rgba(167,139,250,0.4)",
}: {
    label?: string;
    className?: string;
    size?: "default" | "large";
    /** Muted label color (e.g. theme subtitle). */
    labelColor?: string;
    /** Center orb fill (e.g. theme accent). */
    centerPulseColor?: string;
}) {
    useShopIntelLoaderKeyframes();
    const s = SMALL_LOADER_SIZES[size];

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-4",
                s.gapClass,
                size === "large" && "py-5",
                className,
            )}
        >
            <div className="relative" style={{ width: s.box, height: s.box }}>
                <div
                    className="absolute rounded-full"
                    style={{
                        width: s.center,
                        height: s.center,
                        top: "50%",
                        left: "50%",
                        marginTop: -s.centerOffset,
                        marginLeft: -s.centerOffset,
                        background: centerPulseColor,
                        animation: "si-breathe 2s ease-in-out infinite",
                    }}
                />
                {CHANNELS.map((ch, i) => (
                    <div
                        key={ch.name}
                        className="absolute flex items-center justify-center"
                        style={
                            {
                                width: "100%",
                                height: "100%",
                                top: 0,
                                left: 0,
                                "--si-radius": `${s.radius}px`,
                                animation: `si-orbit ${2.8 + i * 0.3}s linear ${i * -0.7}s infinite`,
                            } as CSSProperties
                        }
                    >
                        <div
                            style={{
                                width: s.dot(i),
                                height: s.dot(i),
                                borderRadius: "50%",
                                background: ch.color,
                                boxShadow: `0 0 ${s.glow}px ${ch.color}50`,
                            }}
                        />
                    </div>
                ))}
            </div>
            {label ? (
                <span
                    style={{
                        fontSize: s.labelSize,
                        color: labelColor,
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                    }}
                >
                    {label}
                </span>
            ) : null}
        </div>
    );
}

export function MediumLoader({ label = "Loading", className }: { label?: string; className?: string }) {
    useShopIntelLoaderKeyframes();

    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 py-8", className)}>
            <div className="relative" style={{ width: 56, height: 56 }}>
                {CHANNELS.map((ch, i) => (
                    <div
                        key={ch.name}
                        className="absolute rounded-full"
                        style={{
                            width: 16,
                            height: 16,
                            top: "50%",
                            left: "50%",
                            marginTop: -8,
                            marginLeft: -8,
                            background: `radial-gradient(circle, ${ch.color}90, ${ch.color}20)`,
                            filter: "blur(3px)",
                            animation: `si-converge-${i + 1} ${3.5 + i * 0.2}s ease-in-out infinite`,
                            mixBlendMode: "screen",
                        }}
                    />
                ))}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 10,
                        height: 10,
                        top: "50%",
                        left: "50%",
                        marginTop: -5,
                        marginLeft: -5,
                        background: "radial-gradient(circle, rgba(255,255,255,0.6), rgba(167,139,250,0.2))",
                        animation: "si-breathe 2.5s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 44,
                        height: 44,
                        top: "50%",
                        left: "50%",
                        marginTop: -22,
                        marginLeft: -22,
                        border: "1px solid rgba(167,139,250,0.1)",
                        animation: "si-pulse-ring 3s ease-in-out infinite",
                    }}
                />
            </div>
            <span
                style={{
                    fontSize: 12,
                    color: "rgba(167,139,250,0.45)",
                    letterSpacing: "0.08em",
                    fontWeight: 500,
                }}
            >
                {label}
            </span>
        </div>
    );
}

export function FullLoader({
    messages = ["Syncing your channels", "Pulling latest data", "Almost there"],
    className,
}: {
    messages?: string[];
    className?: string;
}) {
    useShopIntelLoaderKeyframes();
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 2800);
        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className={cn("flex flex-col items-center justify-center gap-6 py-16", className)}>
            <div className="relative" style={{ width: 90, height: 90 }}>
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 88,
                        height: 88,
                        top: 1,
                        left: 1,
                        border: "1px solid rgba(167,139,250,0.06)",
                        animation: "si-pulse-ring 4s ease-in-out infinite",
                    }}
                />
                {CHANNELS.map((ch, i) => (
                    <div
                        key={ch.name}
                        className="absolute rounded-full"
                        style={{
                            width: 24,
                            height: 24,
                            top: "50%",
                            left: "50%",
                            marginTop: -12,
                            marginLeft: -12,
                            background: `radial-gradient(circle, ${ch.color}70, ${ch.color}10)`,
                            filter: "blur(5px)",
                            animation: `si-converge-${i + 1} ${4 + i * 0.3}s ease-in-out infinite`,
                            mixBlendMode: "screen",
                        }}
                    />
                ))}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 14,
                        height: 14,
                        top: "50%",
                        left: "50%",
                        marginTop: -7,
                        marginLeft: -7,
                        background: "radial-gradient(circle, rgba(255,255,255,0.5), rgba(167,139,250,0.15))",
                        animation: "si-breathe 3s ease-in-out infinite",
                        boxShadow: "0 0 20px rgba(167,139,250,0.15)",
                    }}
                />
                {CHANNELS.map((ch, i) => {
                    const angle = (i * 90 + 45) * (Math.PI / 180);
                    const x1 = 45 + Math.cos(angle) * 36;
                    const y1 = 45 + Math.sin(angle) * 36;
                    return (
                        <svg
                            key={`line-${ch.name}`}
                            className="absolute left-0 top-0"
                            width="90"
                            height="90"
                            style={{ overflow: "visible" }}
                        >
                            <line
                                x1={x1}
                                y1={y1}
                                x2="45"
                                y2="45"
                                stroke={ch.color}
                                strokeWidth="0.5"
                                strokeOpacity="0.15"
                                strokeDasharray="2 4"
                            >
                                <animate
                                    attributeName="stroke-dashoffset"
                                    from="24"
                                    to="0"
                                    dur={`${1.5 + i * 0.2}s`}
                                    repeatCount="indefinite"
                                />
                            </line>
                        </svg>
                    );
                })}
            </div>

            <div className="relative h-5 overflow-hidden">
                {messages.map((msg, i) => (
                    <span
                        key={`${msg}-${i}`}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
                        style={{
                            fontSize: 13,
                            color: "rgba(167,139,250,0.45)",
                            letterSpacing: "0.06em",
                            fontWeight: 500,
                            opacity: i === msgIndex ? 1 : 0,
                            transform: i === msgIndex ? "translateY(0)" : "translateY(8px)",
                            transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    >
                        {msg}
                    </span>
                ))}
            </div>

            <div className="flex gap-1.5">
                {messages.map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full transition-all duration-500"
                        style={{
                            width: i === msgIndex ? 16 : 4,
                            height: 4,
                            background: i === msgIndex ? "rgba(167,139,250,0.4)" : "rgba(167,139,250,0.12)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/** Stacked bar placeholder matching the cumulative sales bar layout. */
export function SegmentedBarLoader({
    className,
    style,
    segmentBackgrounds,
}: {
    className?: string;
    style?: CSSProperties;
    /** One background per segment (e.g. same gradients as the real bar). Falls back to channel colors. */
    segmentBackgrounds?: string[];
}) {
    useShopIntelLoaderKeyframes();
    const flexWeights = [28, 22, 20, 18, 12];
    return (
        <div
            className={cn("flex min-h-[34px] flex-1 gap-0.5 overflow-hidden rounded-[18px]", className)}
            style={{ height: 34, ...style }}
        >
            {flexWeights.map((w, i) => {
                const ch = CHANNELS[i % CHANNELS.length];
                const fill =
                    segmentBackgrounds?.[i] ??
                    `linear-gradient(180deg, ${ch.color}55, ${ch.color}18)`;
                const isFirst = i === 0;
                const isLast = i === flexWeights.length - 1;
                return (
                    <div
                        key={i}
                        className="flex h-full min-w-0 items-end justify-center overflow-hidden"
                        style={{
                            flex: w,
                            borderRadius: isFirst ? "18px 0 0 18px" : isLast ? "0 18px 18px 0" : 0,
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: fill,
                                transformOrigin: "bottom",
                                animation: `si-bar-wave 1.1s ease-in-out ${i * 0.1}s infinite`,
                                opacity: 0.92,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}

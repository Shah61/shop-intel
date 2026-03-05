import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useTheme } from "next-themes";

interface TotalCumulativeCardProps {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    isLoading: boolean;
}

interface DaySegment {
    label: string;
    percentage: number;
    value: number;
}

const TotalCumulativeCard = ({
    totalSales,
    isLoading,
}: TotalCumulativeCardProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "#fff",
                subtitle: "#7a6a9a",
                subtitleAccent: "#b0a0d0",
                label: "#7a6a9a",
                valueLabel: "#5a4a7a",
                amount: "#fff",
                barBg: "rgba(var(--preset-primary-rgb), 0.06)",
                stripeAlpha: "0.04",
                segmentGradients: [
                    "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                    "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                    "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                    "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                    "linear-gradient(90deg, var(--preset-primary), var(--preset-lighter))",
                ],
                barText: "#fff",
                barTextShadow: "0 1px 3px rgba(0,0,0,0.3)",
            };
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "#1a1025",
            subtitle: "#8b7aa0",
            subtitleAccent: "#6d42a0",
            label: "#8b7aa0",
            valueLabel: "#9a8ab5",
            amount: "#1a1025",
            barBg: "rgba(var(--preset-primary-rgb), 0.06)",
            stripeAlpha: "0.1",
            segmentGradients: [
                "linear-gradient(90deg, var(--preset-lighter), var(--preset-primary))",
                "linear-gradient(90deg, var(--preset-lighter), var(--preset-primary))",
                "linear-gradient(90deg, var(--preset-lighter), var(--preset-primary))",
                "linear-gradient(90deg, var(--preset-lighter), var(--preset-primary))",
                "linear-gradient(90deg, var(--preset-lighter), var(--preset-primary))",
            ],
            barText: "#fff",
            barTextShadow: "0 1px 2px rgba(0,0,0,0.15)",
        };
    }, [isDark]);

    const segments: DaySegment[] = useMemo(() => {
        const today = new Date();
        const distributions = [0.28, 0.22, 0.2, 0.18, 0.12];
        return distributions.map((pct, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - (4 - i));
            const dayLabel =
                i === 4
                    ? "Today"
                    : i === 3
                      ? "Yesterday"
                      : date.toLocaleDateString("en-MY", {
                            weekday: "short",
                            day: "numeric",
                        });
            return {
                label: dayLabel,
                percentage: Math.round(pct * 100),
                value: totalSales * pct,
            };
        });
    }, [totalSales]);

    const todayDate = new Date().toLocaleDateString("en-MY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div
            style={{
                background: t.cardBg,
                borderRadius: 20,
                border: t.cardBorder,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontFamily: "'Outfit', sans-serif",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`,
                    pointerEvents: "none",
                }}
            />

            {/* 1. Header */}
            <div>
                <h2
                    style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: t.title,
                        margin: 0,
                        fontFamily: "'Outfit', sans-serif",
                        letterSpacing: "-0.5px",
                        lineHeight: 1.2,
                    }}
                >
                    Total Cumulative Sales
                </h2>
                <p
                    style={{
                        fontSize: 13,
                        color: t.subtitle,
                        margin: "4px 0 0 0",
                    }}
                >
                    All platforms •{" "}
                    <span style={{ color: t.subtitleAccent, fontWeight: 500 }}>
                        {todayDate}
                    </span>
                </p>
            </div>

            {/* 2. Segment bar row */}
            <div>
                {/* Labels */}
                <div style={{ display: "flex", gap: 0, marginBottom: 4 }}>
                    {segments.map((seg, i) => (
                        <div
                            key={`label-${i}`}
                            style={{
                                width: `${seg.percentage}%`,
                                paddingRight: i < segments.length - 1 ? 3 : 0,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 10,
                                    color: t.label,
                                    fontWeight: 500,
                                }}
                            >
                                {seg.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Bars */}
                <div style={{ display: "flex", gap: 0, alignItems: "flex-end" }}>
                    <div
                        style={{
                            display: "flex",
                            flex: 1,
                            gap: 2,
                            height: 34,
                            borderRadius: 18,
                            overflow: "hidden",
                            background: t.barBg,
                        }}
                    >
                        {isLoading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <Skeleton
                                      key={i}
                                      style={{
                                          height: "100%",
                                          flex: 1,
                                          borderRadius: 0,
                                      }}
                                  />
                              ))
                            : segments.map((seg, i) => (
                                  <div
                                      key={`bar-${i}`}
                                      style={{
                                          width: `${seg.percentage}%`,
                                          height: "100%",
                                          background: t.segmentGradients[i],
                                          display: "flex",
                                          alignItems: "center",
                                          paddingLeft: 12,
                                          fontSize: 11,
                                          fontWeight: 600,
                                          color: t.barText,
                                          position: "relative",
                                          overflow: "hidden",
                                          borderRadius:
                                              i === 0
                                                  ? "18px 0 0 18px"
                                                  : i === segments.length - 1
                                                    ? "0 18px 18px 0"
                                                    : "0",
                                          cursor: "default",
                                      }}
                                      title={`${seg.label}: RM ${seg.value.toLocaleString("en-MY", { minimumFractionDigits: 2 })}`}
                                  >
                                      {i === 0 && (
                                          <div
                                              style={{
                                                  position: "absolute",
                                                  inset: 0,
                                                  background: `repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,${t.stripeAlpha}) 4px, rgba(255,255,255,${t.stripeAlpha}) 8px)`,
                                                  pointerEvents: "none",
                                              }}
                                          />
                                      )}
                                      {i === segments.length - 1 && (
                                          <div
                                              style={{
                                                  position: "absolute",
                                                  inset: 0,
                                                  background: `repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(255,255,255,${t.stripeAlpha}) 4px, rgba(255,255,255,${t.stripeAlpha}) 8px)`,
                                                  pointerEvents: "none",
                                              }}
                                          />
                                      )}
                                      <span
                                          style={{
                                              position: "relative",
                                              zIndex: 1,
                                              textShadow: t.barTextShadow,
                                          }}
                                      >
                                          {seg.percentage}%
                                      </span>
                                  </div>
                              ))}
                    </div>
                </div>

                {/* Value labels */}
                {!isLoading && (
                    <div style={{ display: "flex", gap: 0, marginTop: 4 }}>
                        {segments.map((seg, i) => (
                            <div
                                key={`val-${i}`}
                                style={{
                                    width: `${seg.percentage}%`,
                                    paddingRight: i < segments.length - 1 ? 3 : 0,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: t.valueLabel,
                                        fontWeight: 500,
                                    }}
                                >
                                    RM{" "}
                                    {seg.value >= 1000
                                        ? `${(seg.value / 1000).toFixed(1)}k`
                                        : seg.value.toFixed(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Bottom — total amount only */}
            <div style={{ marginTop: 2 }}>
                <p
                    style={{
                        fontSize: 11,
                        color: t.valueLabel,
                        marginBottom: 4,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}
                >
                    Total Revenue
                </p>
                {isLoading ? (
                    <Skeleton style={{ height: 38, width: 200 }} />
                ) : (
                    <p
                        style={{
                            fontSize: 34,
                            fontWeight: 700,
                            color: t.amount,
                            fontFamily: "'Outfit', sans-serif",
                            letterSpacing: "-1px",
                            margin: 0,
                            lineHeight: 1,
                        }}
                    >
                        RM{" "}
                        {totalSales.toLocaleString("en-MY", {
                            minimumFractionDigits: 2,
                        })}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TotalCumulativeCard;
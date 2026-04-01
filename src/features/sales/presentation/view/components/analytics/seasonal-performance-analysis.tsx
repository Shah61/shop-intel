"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import {
  LineChart,
  Table2,
  TrendingUp,
  X,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/src/core/constant/helper";

/* ─── Dummy monthly total revenue (MYR), all channels — aligns with overview dashboard context ─── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/** MYR monthly revenue totals (rounded) — seasonal peaks Nov–Dec, softer mid-year */
const SEASONAL_REVENUE_BY_YEAR: Record<number, (number | null)[]> = {
  2020: [286000, 298000, 312000, 305000, 318000, 329000, 315000, 308000, 336000, 352000, 398000, 428000],
  2021: [312000, 325000, 338000, 328000, 345000, 358000, 342000, 335000, 362000, 384000, 428000, 462000],
  2022: [335000, 348000, 362000, 352000, 368000, 382000, 365000, 358000, 388000, 412000, 458000, 492000],
  2023: [368000, 382000, 398000, 388000, 405000, 418000, 402000, 395000, 425000, 448000, 498000, 532000],
  2024: [402000, 418000, 432000, 422000, 438000, 452000, 435000, 428000, 458000, 485000, 538000, 572000],
  2025: [438000, 455000, 472000, 462000, 478000, 492000, 475000, 468000, 498000, 525000, 582000, 618000],
  2026: [465000, 488000, 502000, null, null, null, null, null, null, null, null, null],
};

const YEAR_LINE_COLORS: Record<number, string> = {
  2026: "hsl(var(--primary))",
  2025: "#10b981",
  2024: "#3b82f6",
  2023: "#a855f7",
  2022: "#f59e0b",
  2021: "#ec4899",
  2020: "#64748b",
};

const MIN_YEAR = 2020;
const MAX_YEAR = 2026;

const getPercentFromBaseline = (series: (number | null)[]) => {
  if (!series?.[0] || series[0] == null) return series?.map(() => null) ?? [];
  const base = series[0];
  return series.map((v) => (v != null && base ? ((v - base) / base) * 100 : null));
};

const getMoMChange = (series: (number | null)[]) => {
  if (!series) return [];
  return series.map((v, i) => {
    if (v == null) return null;
    if (i === 0) return 0;
    const prev = series[i - 1];
    if (prev == null) return null;
    return v - prev;
  });
};

const getMoMPercentChange = (series: (number | null)[]) => {
  if (!series) return [];
  return series.map((v, i) => {
    if (v == null) return null;
    if (i === 0) return 0;
    const prev = series[i - 1];
    if (prev == null || prev === 0) return null;
    return ((v - prev) / prev) * 100;
  });
};

const getYearTotalDelta = (
  series: (number | null)[] | undefined,
  mode: "percent" | "regular"
) => {
  if (!series) return null;
  const vals = series.filter((v): v is number => v != null);
  if (vals.length < 2) return null;
  const first = series.find((v) => v != null);
  const last = [...series].reverse().find((v) => v != null);
  if (first == null || last == null) return null;
  return mode === "percent" ? ((last - first) / first) * 100 : last - first;
};

function SparklineMini({
  data,
  color = "hsl(var(--primary))",
  w = 88,
  h = 30,
}: {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block shrink-0" aria-hidden>
      <defs>
        <linearGradient id={`spk-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spk-${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ScaleMode = "percent" | "regular";

/** Vertically separate end-of-line labels that share similar Y (e.g. December cluster). */
function resolveStackedYs(
  ideals: number[],
  minY: number,
  maxY: number,
  labelHeight: number,
  gap: number
): number[] {
  const n = ideals.length;
  if (n === 0) return [];
  const minSep = labelHeight + gap;
  const order = ideals.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  let ys = order.map((o) => Math.min(maxY, Math.max(minY, o.y)));
  for (let iter = 0; iter < 16; iter++) {
    let changed = false;
    ys = ys.map((y) => Math.min(maxY, Math.max(minY, y)));
    for (let k = 1; k < n; k++) {
      if (ys[k] - ys[k - 1] < minSep) {
        ys[k] = ys[k - 1] + minSep;
        changed = true;
      }
    }
    for (let k = n - 2; k >= 0; k--) {
      if (ys[k + 1] - ys[k] < minSep) {
        ys[k] = ys[k + 1] - minSep;
        changed = true;
      }
    }
    if (!changed) break;
  }
  const result = new Array<number>(n);
  order.forEach((o, k) => {
    result[o.i] = ys[k];
  });
  return result;
}

export function SeasonalContentBody({
  rangeStart,
  rangeEnd,
  onRangeChange,
}: {
  rangeStart: number;
  rangeEnd: number;
  onRangeChange: (start: number, end: number) => void;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [showAverage, setShowAverage] = useState(true);
  const [scale, setScale] = useState<ScaleMode>("regular");
  const [scaleOpen, setScaleOpen] = useState(false);
  const [tooltip, setTooltip] = useState<{
    x: number;
    month: number;
    data: { year: number | string; color: string; value: number; isAverage?: boolean }[];
    lineX: number;
  } | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setScaleOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const visibleYears = useMemo(
    () =>
      Object.keys(SEASONAL_REVENUE_BY_YEAR)
        .map(Number)
        .filter((y) => y >= rangeStart && y <= rangeEnd)
        .sort((a, b) => b - a),
    [rangeStart, rangeEnd]
  );

  const averageData = useMemo(() => {
    const avg: (number | null)[] = [];
    for (let m = 0; m < 12; m++) {
      let s = 0;
      let c = 0;
      visibleYears.forEach((y) => {
        const row = SEASONAL_REVENUE_BY_YEAR[y];
        if (row?.[m] != null) {
          s += row[m] as number;
          c++;
        }
      });
      avg.push(c > 0 ? s / c : null);
    }
    return avg;
  }, [visibleYears]);

  const fmtVal = (v: number) =>
    scale === "percent"
      ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
      : formatCurrency(v);

  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const axisMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

  const renderChart = () => {
    const W = 1100;
    const H = 400;
    const pL = 52;
    const pR = 152;
    const pT = 16;
    const pB = 36;
    const cW = W - pL - pR;
    const cH = H - pT - pB;

    type LineDef = {
      year: number | string;
      data: (number | null)[];
      color: string;
      isAverage?: boolean;
    };

    const lines: LineDef[] = [];
    visibleYears.forEach((year) => {
      const p = SEASONAL_REVENUE_BY_YEAR[year];
      if (!p) return;
      lines.push({
        year,
        data: scale === "percent" ? getPercentFromBaseline(p) : p,
        color: YEAR_LINE_COLORS[year] ?? "hsl(var(--muted-foreground))",
      });
    });
    if (showAverage) {
      lines.push({
        year: "Avg",
        data:
          scale === "percent"
            ? getPercentFromBaseline(averageData)
            : averageData,
        color: "hsl(var(--primary))",
        isAverage: true,
      });
    }

    let all: number[] = [];
    lines.forEach((l) =>
      l.data.forEach((v) => {
        if (v != null) all.push(v);
      })
    );
    if (!all.length) all = [0, 1];
    let minV = Math.min(...all);
    let maxV = Math.max(...all);
    const rng = maxV - minV || 1;
    minV -= rng * 0.05;
    maxV += rng * 0.05;

    const xS = (m: number) => pL + (m / 11) * cW;
    const yS = (v: number) => pT + cH - ((v - minV) / (maxV - minV)) * cH;
    const yTicks: number[] = [];
    const step = (maxV - minV) / 6;
    for (let i = 0; i <= 6; i++) yTicks.push(minV + step * i);

    const pathLines = lines
      .map((line) => {
        const pts: { x: number; y: number; v: number; m: number }[] = [];
        line.data.forEach((v, i) => {
          if (v != null) pts.push({ x: xS(i), y: yS(v), v, m: i });
        });
        if (pts.length < 2) return null;
        const d = pts.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
        return { ...line, d, points: pts, lastPoint: pts[pts.length - 1] };
      })
      .filter(Boolean) as (LineDef & {
      d: string;
      points: { x: number; y: number; v: number; m: number }[];
      lastPoint: { x: number; y: number; v: number; m: number };
    })[];

    const sortedLabels = [...pathLines].sort(
      (a, b) => (b.lastPoint?.v ?? 0) - (a.lastPoint?.v ?? 0)
    );

    const END_LABEL_H = 18;
    const END_LABEL_GAP = 4;
    const endLabelMinY = pT + END_LABEL_H / 2 + 2;
    const endLabelMaxY = H - pB - END_LABEL_H / 2 - 2;
    const labelRows = sortedLabels.filter((l): l is (typeof pathLines)[number] => Boolean(l.lastPoint));
    const endLabelYs = resolveStackedYs(
      labelRows.map((l) => l.lastPoint!.y),
      endLabelMinY,
      endLabelMaxY,
      END_LABEL_H,
      END_LABEL_GAP
    );

    const handleMouseMove = (e: ReactMouseEvent<SVGSVGElement>) => {
      if (!chartRef.current) return;
      const rect = chartRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * W;
      if (svgX < pL || svgX > W - pR) {
        setTooltip(null);
        return;
      }
      const mi = Math.max(0, Math.min(11, Math.round(((svgX - pL) / cW) * 11)));
      const row: { year: number | string; color: string; value: number; isAverage?: boolean }[] = [];
      pathLines.forEach((l) => {
        const v = l.data[mi];
        if (v != null)
          row.push({
            year: l.year,
            color: l.color,
            value: v,
            isAverage: l.isAverage,
          });
      });
      if (row.length)
        setTooltip({
          x: (xS(mi) / W) * 100,
          month: mi,
          data: row.sort((a, b) => b.value - a.value),
          lineX: xS(mi),
        });
      else setTooltip(null);
    };

    return (
      <div className="relative w-full" onMouseLeave={() => setTooltip(null)}>
        <svg
          ref={chartRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full min-h-[260px]"
          onMouseMove={handleMouseMove}
        >
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={pL}
                y1={yS(v)}
                x2={W - pR}
                y2={yS(v)}
                stroke={gridStroke}
                strokeWidth="1"
              />
              <text
                x={W - pR + 6}
                y={yS(v) + 4}
                fill={axisMuted}
                fontSize="10"
                fontFamily="system-ui"
              >
                {fmtVal(v)}
              </text>
            </g>
          ))}
          {MONTHS.map((m, i) => (
            <g key={m}>
              <line
                x1={xS(i)}
                y1={pT}
                x2={xS(i)}
                y2={H - pB}
                stroke={gridStroke}
                strokeWidth="0.5"
                strokeDasharray="4 4"
              />
              <text
                x={xS(i)}
                y={H - 10}
                fill={axisMuted}
                fontSize="10"
                textAnchor="middle"
                fontFamily="system-ui"
              >
                {m}
              </text>
            </g>
          ))}
          {tooltip && (
            <line
              x1={tooltip.lineX}
              y1={pT}
              x2={tooltip.lineX}
              y2={H - pB}
              stroke={axisMuted}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}
          {pathLines.map((l) => (
            <path
              key={String(l.year)}
              d={l.d}
              fill="none"
              stroke={l.color}
              strokeWidth={l.isAverage ? 2.25 : 1.6}
              strokeDasharray={l.isAverage ? "5 4" : "none"}
              opacity={0.92}
            />
          ))}
          {tooltip &&
            pathLines.map((l) => {
              const v = l.data[tooltip.month];
              if (v == null) return null;
              return (
                <circle
                  key={`${l.year}-dot`}
                  cx={xS(tooltip.month)}
                  cy={yS(v)}
                  r={4}
                  fill={l.color}
                  stroke="hsl(var(--card))"
                  strokeWidth="2"
                />
              );
            })}
          {labelRows.map((l, idx) => {
            const lp = l.lastPoint!;
            const ay = endLabelYs[idx];
            const label = l.isAverage ? "Avg" : l.year;
            const bg = l.isAverage ? "hsl(var(--primary))" : l.color;
            const bubbleTextFill =
              bg === "hsl(var(--primary))"
                ? "hsl(var(--primary-foreground))"
                : "#ffffff";
            const badgeX = W - pR + 36;
            return (
              <g key={`lbl-${l.year}`}>
                <line
                  x1={lp.x}
                  y1={lp.y}
                  x2={badgeX - 2}
                  y2={ay - 1}
                  stroke={bg}
                  strokeOpacity={0.38}
                  strokeWidth={1.25}
                  strokeLinecap="round"
                />
                <rect
                  x={badgeX}
                  y={ay - 10}
                  width={34}
                  height={END_LABEL_H}
                  rx={4}
                  fill={bg}
                />
                <text
                  x={W - pR + 53}
                  y={ay + 4}
                  fill={bubbleTextFill}
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {label}
                </text>
                <text
                  x={W - pR + 88}
                  y={ay + 4}
                  fill={bg}
                  fontSize="9"
                  textAnchor="start"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {fmtVal(lp.v)}
                </text>
              </g>
            );
          })}
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: `${tooltip.x}%`,
              top: 24,
              transform: tooltip.x > 70 ? "translateX(-108%)" : "translateX(-50%)",
            }}
          >
            <div
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
              style={{ minWidth: 168 }}
            >
              <div className="mb-1 border-b border-border pb-1 font-semibold text-foreground">
                {MONTHS[tooltip.month]}
              </div>
              {tooltip.data.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="font-medium text-foreground">
                      {d.isAverage ? "Average" : d.year}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">{fmtVal(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => {
    const years = visibleYears;
    const changesForYear = (y: number) => {
      const p = SEASONAL_REVENUE_BY_YEAR[y];
      if (!p) return Array(12).fill(null);
      return scale === "percent" ? getMoMPercentChange(p) : getMoMChange(p);
    };

    const avgRow = Array.from({ length: 12 }, (_, m) => {
      let s = 0;
      let c = 0;
      years.forEach((y) => {
        const ch = changesForYear(y);
        if (ch[m] != null) {
          s += ch[m] as number;
          c++;
        }
      });
      return c > 0 ? s / c : null;
    });

    const fmt = (v: number | null) =>
      v == null
        ? "—"
        : scale === "percent"
          ? `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`
          : formatCurrency(v);

    const cellClass = (v: number | null) => {
      if (v == null) return "";
      if (v > 0) return isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-500/10 text-emerald-800";
      if (v < 0) return isDark ? "bg-red-500/15 text-red-300" : "bg-red-500/10 text-red-800";
      return "";
    };

    const yearTotClass = (v: number | null) => {
      if (v == null) return "";
      if (v > 0) return isDark ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white";
      if (v < 0) return isDark ? "bg-red-600 text-white" : "bg-red-500 text-white";
      return "";
    };

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: `${p}, 0.22)`,
                background: `${p}, 0.06)`,
              }}
            >
              <th className="sticky left-0 z-10 min-w-[56px] bg-card px-2 py-2 text-left font-semibold text-muted-foreground">
                Year
              </th>
              {MONTH_FULL.map((m) => (
                <th
                  key={m}
                  className="min-w-[72px] px-1 py-2 text-center font-semibold text-muted-foreground"
                >
                  {m.slice(0, 3)}
                </th>
              ))}
              <th className="min-w-[76px] px-2 py-2 text-center font-bold text-primary">
                Year Δ
              </th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => {
              const ch = changesForYear(year);
              const yt = getYearTotalDelta(SEASONAL_REVENUE_BY_YEAR[year], scale);
              return (
                <tr
                  key={year}
                  className="border-b border-border/60 hover:bg-muted/20"
                >
                  <td className="sticky left-0 z-10 bg-card px-2 py-1.5 font-semibold text-foreground">
                    {year}
                  </td>
                  {ch.map((v, i) => (
                    <td
                      key={i}
                      className={`px-1 py-1.5 text-center font-medium ${cellClass(v)}`}
                    >
                      {fmt(v)}
                    </td>
                  ))}
                  <td
                    className={`px-2 py-1.5 text-center text-[10px] font-bold ${yearTotClass(yt)}`}
                  >
                    {yt == null ? "—" : fmt(yt)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border bg-muted/20">
              <td className="sticky left-0 z-10 bg-muted/40 px-2 py-1.5 font-semibold text-foreground">
                Avg change
              </td>
              {avgRow.map((v, i) => (
                <td key={i} className="px-1 py-1.5 text-center font-semibold">
                  <span
                    className={
                      v != null && v >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {fmt(v)}
                  </span>
                </td>
              ))}
              <td className="px-2 py-1.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                {(() => {
                  let s = 0;
                  let c = 0;
                  years.forEach((y) => {
                    const t = getYearTotalDelta(SEASONAL_REVENUE_BY_YEAR[y], scale);
                    if (t != null) {
                      s += t;
                      c++;
                    }
                  });
                  return c > 0 ? fmt(s / c) : "—";
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const startPct = ((rangeStart - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
  const endPct = ((rangeEnd - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const p = "rgba(var(--preset-primary-rgb)";
  const presetTabShell: CSSProperties = {
    border: `1px solid ${p}, 0.22)`,
    background: `${p}, 0.06)`,
    boxShadow: `inset 0 1px 0 ${p}, 0.06)`,
  };
  const presetTabActive: CSSProperties = {
    background: `${p}, 0.22)`,
    color: "hsl(var(--foreground))",
    boxShadow: `0 1px 4px ${p}, 0.2)`,
  };
  const presetTabIdle: CSSProperties = {
    color: "hsl(var(--muted-foreground))",
    background: "transparent",
  };
  const presetBtnActive: CSSProperties = {
    border: `1px solid ${p}, 0.35)`,
    background: `${p}, 0.14)`,
    color: "hsl(var(--foreground))",
  };
  const presetBtnIdle: CSSProperties = {
    border: `1px solid ${p}, 0.18)`,
    background: `${p}, 0.04)`,
    color: "hsl(var(--muted-foreground))",
  };
  const presetDropdownBtn: CSSProperties = {
    border: `1px solid ${p}, 0.22)`,
    background: `${p}, 0.06)`,
    color: "hsl(var(--foreground))",
  };
  const presetDropdownMenu: CSSProperties = {
    border: `1px solid ${p}, 0.2)`,
    background: "hsl(var(--card))",
    boxShadow: `0 12px 40px -12px ${p}, 0.35)`,
  };
  const presetSliderTrack: CSSProperties = {
    background: `${p}, 0.1)`,
    boxShadow: `inset 0 0 0 1px ${p}, 0.12)`,
  };
  const presetSliderFill: CSSProperties = {
    background: `linear-gradient(90deg, ${p}, 0.35), ${p}, 0.72))`,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex gap-0.5 rounded-lg p-0.5" style={presetTabShell}>
          <button
            type="button"
            onClick={() => setViewMode("chart")}
            className="rounded-md p-2 transition-all duration-200"
            style={viewMode === "chart" ? presetTabActive : presetTabIdle}
            aria-pressed={viewMode === "chart"}
          >
            <LineChart className="h-4 w-4" style={{ color: "inherit" }} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className="rounded-md p-2 transition-all duration-200"
            style={viewMode === "table" ? presetTabActive : presetTabIdle}
            aria-pressed={viewMode === "table"}
          >
            <Table2 className="h-4 w-4" style={{ color: "inherit" }} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAverage((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200"
            style={showAverage ? presetBtnActive : presetBtnIdle}
          >
            <BarChart3 className="h-3.5 w-3.5" style={{ opacity: 0.85 }} />
            Average line
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setScaleOpen((o) => !o)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-95"
              style={presetDropdownBtn}
            >
              {scale === "percent" ? "Indexed %" : "MYR values"}
              <ChevronDown className="h-3 w-3" style={{ opacity: 0.75 }} />
            </button>
            {scaleOpen && (
              <div
                className="absolute right-0 top-full z-30 mt-1 min-w-[148px] overflow-hidden rounded-lg py-1"
                style={presetDropdownMenu}
              >
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[rgba(var(--preset-primary-rgb),0.08)]"
                  style={{
                    fontWeight: scale === "regular" ? 600 : 500,
                    color:
                      scale === "regular"
                        ? "hsl(var(--primary))"
                        : "hsl(var(--foreground))",
                    background:
                      scale === "regular" ? `${p}, 0.12)` : "transparent",
                  }}
                  onClick={() => {
                    setScale("regular");
                    setScaleOpen(false);
                  }}
                >
                  MYR values
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[rgba(var(--preset-primary-rgb),0.08)]"
                  style={{
                    fontWeight: scale === "percent" ? 600 : 500,
                    color:
                      scale === "percent"
                        ? "hsl(var(--primary))"
                        : "hsl(var(--foreground))",
                    background:
                      scale === "percent" ? `${p}, 0.12)` : "transparent",
                  }}
                  onClick={() => {
                    setScale("percent");
                    setScaleOpen(false);
                  }}
                >
                  Indexed to Jan %
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 flex justify-between px-1 text-[10px] font-semibold text-primary/75">
          {[2020, 2022, 2024, 2026].map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
        <div
          className="relative h-2.5 cursor-pointer select-none rounded-full"
          style={{ ...presetSliderTrack, touchAction: "none" }}
        >
          <div
            className="absolute h-full rounded-full"
            style={{ ...presetSliderFill, left: `${startPct}%`, width: `${endPct - startPct}%` }}
          />
          <YearRangeSliderHandles
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={onRangeChange}
            startPct={startPct}
            endPct={endPct}
          />
        </div>
      </div>

      <div className="border-t border-border pt-2">
        {viewMode === "chart" ? renderChart() : renderTable()}
      </div>
    </div>
  );
}

function YearRangeSliderHandles({
  rangeStart,
  rangeEnd,
  onRangeChange,
  startPct,
  endPct,
}: {
  rangeStart: number;
  rangeEnd: number;
  onRangeChange: (start: number, end: number) => void;
  startPct: number;
  endPct: number;
}) {
  const [dragging, setDragging] = useState<"start" | "end" | "range" | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const rangeGrabOffsetRef = useRef(0);

  const getYearFromX = useCallback((clientX: number) => {
    const el = sliderRef.current?.parentElement;
    if (!el) return MIN_YEAR;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    return Math.round(MIN_YEAR + t * (MAX_YEAR - MIN_YEAR));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const y = getYearFromX(e.clientX);
      if (dragging === "start") {
        onRangeChange(Math.min(y, rangeEnd - 1), rangeEnd);
        return;
      }
      if (dragging === "end") {
        onRangeChange(rangeStart, Math.max(y, rangeStart + 1));
        return;
      }
      const span = rangeEnd - rangeStart;
      const desiredStart = y - rangeGrabOffsetRef.current;
      const nextStart = Math.max(MIN_YEAR, Math.min(MAX_YEAR - span, desiredStart));
      onRangeChange(nextStart, nextStart + span);
    };
    const up = () => setDragging(null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragging, rangeStart, rangeEnd, getYearFromX, onRangeChange]);

  return (
    <>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Move selected year range"
        className="absolute top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center p-1 active:cursor-grabbing"
        style={{ left: `${(startPct + endPct) / 2}%` }}
        onMouseDown={(e) => {
          e.preventDefault();
          rangeGrabOffsetRef.current = getYearFromX(e.clientX) - rangeStart;
          setDragging("range");
        }}
      >
        <div
          className="grid grid-cols-3 grid-rows-2 gap-px"
          aria-hidden
        >
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className="h-0.5 w-0.5 rounded-full bg-primary/90"
            />
          ))}
        </div>
      </div>
      {(["start", "end"] as const).map((w) => {
        const pct = w === "start" ? startPct : endPct;
        const val = w === "start" ? rangeStart : rangeEnd;
        return (
          <div
            key={w}
            ref={w === "start" ? sliderRef : undefined}
            role="slider"
            tabIndex={0}
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{ left: `${pct}%` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setDragging(w);
            }}
          >
            <div
              className="h-4 w-4 rounded-full border-2 bg-card ring-2 ring-background transition hover:opacity-95"
              style={{
                borderColor: "rgba(var(--preset-primary-rgb), 0.55)",
                boxShadow: "0 2px 10px rgba(var(--preset-primary-rgb), 0.28)",
              }}
            />
            {dragging === w && (
              <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                {val}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

type DialogAnim = "closed" | "opening" | "open" | "closing";

export function SeasonalPerformanceDialog({
  open,
  onOpenChange,
  headlineRevenue,
  headlineSub,
  originRect = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headlineRevenue: number;
  headlineSub: string;
  /** Click target from banner — drives spring transform origin */
  originRect?: DOMRect | null;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [rangeStart, setRangeStart] = useState(2022);
  const [rangeEnd, setRangeEnd] = useState(2026);
  const [mounted, setMounted] = useState(false);
  const [animState, setAnimState] = useState<DialogAnim>("closed");

  const panelSurface = isDark
    ? "linear-gradient(135deg, rgba(26, 34, 44, 0.98), rgba(35, 45, 56, 0.94))"
    : "linear-gradient(135deg, rgba(250, 247, 255, 0.98), rgba(243, 237, 255, 0.94))";

  const headerBorder = "1px solid rgba(var(--preset-primary-rgb), 0.14)";
  const panelRing =
    "0 50px 100px -24px rgba(0,0,0,0.35), 0 0 0 1px rgba(var(--preset-primary-rgb), 0.12), 0 0 40px -8px rgba(var(--preset-primary-rgb), 0.08)";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || animState !== "closed") return;
    document.body.style.overflow = "hidden";
    setAnimState("opening");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimState("open"));
    });
  }, [open, animState]);

  const closeAnimated = useCallback(() => {
    if (animState === "closing" || animState === "closed") return;
    setAnimState("closing");
    window.setTimeout(() => {
      setAnimState("closed");
      document.body.style.overflow = "";
      onOpenChange(false);
    }, 450);
  }, [animState, onOpenChange]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (animState === "open" || animState === "opening"))
        closeAnimated();
    };
    if (open && animState !== "closed") window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, animState, closeAnimated]);

  if (!mounted) return null;
  if (animState === "closed" && !open) return null;

  const expanded = animState === "open";
  const backdropReady = animState === "open" || animState === "closing";

  const getOrigin = (): CSSProperties => {
    if (!originRect) return { transformOrigin: "50% 45%" };
    const ox = ((originRect.left + originRect.width / 2) / window.innerWidth) * 100;
    const oy = ((originRect.top + originRect.height / 2) / window.innerHeight) * 100;
    return { transformOrigin: `${ox}% ${oy}%` };
  };

  const panel = (
    <div className="fixed inset-0 z-[20000]">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close dialog"
        style={{
          backgroundColor: backdropReady ? "rgba(0,0,0,0.52)" : "rgba(0,0,0,0)",
          backdropFilter: backdropReady ? "blur(12px)" : "blur(0px)",
          WebkitBackdropFilter: backdropReady ? "blur(12px)" : "blur(0px)",
          transition:
            "background-color 500ms cubic-bezier(0.22, 1, 0.36, 1), backdrop-filter 500ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        onClick={closeAnimated}
      />
      <div
        className="absolute flex flex-col overflow-hidden rounded-[20px]"
        style={{
          top: "5%",
          left: "5%",
          width: "90%",
          height: "90%",
          maxHeight: "min(90dvh, 90vh)",
          background: panelSurface,
          border: headerBorder,
          boxShadow: panelRing,
          transition:
            "transform 520ms cubic-bezier(0.175, 0.885, 0.32, 1.08), opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 520ms ease, box-shadow 520ms ease",
          transform: expanded ? "scale(1)" : "scale(0.12)",
          opacity: expanded ? 1 : 0,
          ...getOrigin(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="shrink-0 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4"
          style={{
            borderBottom: headerBorder,
            background: isDark
              ? "linear-gradient(180deg, rgba(var(--preset-primary-rgb), 0.08) 0%, transparent 100%)"
              : "linear-gradient(180deg, rgba(var(--preset-primary-rgb), 0.06) 0%, transparent 100%)",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-5 gap-y-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(var(--preset-primary-rgb), 0.28), rgba(var(--preset-primary-rgb), 0.1))",
                    boxShadow: "0 4px 18px rgba(var(--preset-primary-rgb), 0.22)",
                    border: "1px solid rgba(var(--preset-primary-rgb), 0.2)",
                  }}
                >
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Sales overview
                  </p>
                  <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                    {formatCurrency(headlineRevenue)}{" "}
                    <span className="font-normal text-muted-foreground">
                      consolidated (selected range)
                    </span>
                  </h2>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {headlineSub}
                  </p>
                </div>
              </div>
              <div
                className="hidden h-12 w-px shrink-0 self-center sm:block"
                style={{ background: "rgba(var(--preset-primary-rgb), 0.16)" }}
                aria-hidden
              />
              <div className="min-w-0 max-w-md flex-1 basis-[min(100%,18rem)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary/90">
                  Seasonal revenue
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Month-by-month totals across TikTok, Shopee, Shopify, and stores—handy for
                  campaigns, stock, and staffing. Past patterns are not a forecast.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAnimated}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:scale-105 hover:rotate-90 active:scale-95"
              style={{
                borderColor: "rgba(var(--preset-primary-rgb), 0.2)",
                background: "rgba(var(--preset-primary-rgb), 0.06)",
                transition: "all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-5">
          <SeasonalContentBody
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeChange={(a, b) => {
              setRangeStart(a);
              setRangeEnd(b);
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

/** Sparkline points: YoY growth of March revenue (dummy trend) */
const BANNER_SPARK = [312000, 338000, 362000, 388000, 418000, 455000, 502000].map((v) => v / 5000);

export function SeasonalPerformanceBanner({
  onOpen,
  ytdGrowthLabel,
  compact = false,
}: {
  onOpen: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  ytdGrowthLabel: string;
  compact?: boolean;
}) {
  return (
    <>
      <style>{`
        .seasonal-banner-trigger {
          transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 280ms ease, border-color 280ms ease;
        }
        .seasonal-banner-trigger:hover {
          transform: translateY(-2px);
          box-shadow:
            0 20px 60px -20px rgba(var(--preset-primary-rgb), 0.22),
            0 0 0 1px rgba(var(--preset-primary-rgb), 0.2);
          border-color: rgba(var(--preset-primary-rgb), 0.32) !important;
        }
        .seasonal-banner-trigger:active {
          transform: translateY(0) scale(0.995);
        }
        .seasonal-banner-trigger:hover .seasonal-banner-arrow {
          transform: translateX(3px);
        }
        .seasonal-banner-arrow {
          transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
      <button
        type="button"
        onClick={onOpen}
        className={`seasonal-banner-trigger group flex w-full items-center justify-between rounded-xl border border-border bg-gradient-to-r from-primary/[0.08] via-card to-card text-left shadow-sm ${
          compact
            ? "max-w-[460px] gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5"
            : "max-w-xl gap-2.5 px-3 py-2 sm:max-w-md lg:max-w-lg"
        }`}
      >
        <div className={`flex min-w-0 flex-1 items-center ${compact ? "gap-2.5" : "gap-3"}`}>
          <div
            className={`${compact ? "h-7" : "h-9"} w-1 shrink-0 rounded-full bg-gradient-to-b from-primary to-[var(--preset-lighter)]`}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${compact ? "text-xs sm:text-sm" : "text-sm"} whitespace-nowrap font-semibold text-foreground`}>
                Seasonal performance
              </span>
              <span className={`${compact ? "text-[9px]" : "text-[10px]"} rounded bg-primary/15 px-1.5 py-0.5 font-bold uppercase tracking-wide text-primary`}>
                Insight
              </span>
            </div>
            <p className={`${compact ? "hidden text-[10px] sm:block sm:truncate" : "text-[11px] truncate"} text-muted-foreground`}>
              Monthly revenue patterns across years — tap to explore
            </p>
          </div>
        </div>
        <div className={`flex shrink-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
          <div className="hidden text-right sm:block">
            <div className={`${compact ? "text-[11px]" : "text-xs"} font-bold tabular-nums text-emerald-600 dark:text-emerald-400`}>
              {ytdGrowthLabel}
            </div>
            <div className="text-[10px] text-muted-foreground">vs prior YTD</div>
          </div>
          <SparklineMini data={BANNER_SPARK} color="hsl(var(--primary))" />
          <div className="seasonal-banner-arrow text-muted-foreground group-hover:text-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </button>
    </>
  );
}

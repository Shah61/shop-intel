"use client"

import * as React from "react"
import { addMonths, subMonths, format, isSameDay, isWithinInterval, isBefore, isAfter, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export type Timeframe = "daily" | "weekly" | "monthly" | "yearly"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  className?: string
  placeholder?: string
  label?: string
  timeframe?: Timeframe
  onTimeframeChange?: (tf: Timeframe) => void
}

// ─── Calendar Month Grid ─────────────────────────────────────────────────────

function MonthGrid({
  month,
  selected,
  hoverDate,
  onDateClick,
  onDateHover,
  minSelectableDate,
}: {
  month: Date
  selected: DateRange
  hoverDate: Date | null
  onDateClick: (date: Date) => void
  onDateHover: (date: Date | null) => void
  minSelectableDate?: Date | null
}) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const isInRange = (day: Date) => {
    const { from, to } = selected
    if (from && to) {
      return isWithinInterval(day, { start: from, end: to })
    }
    if (from && hoverDate && !to) {
      const start = isBefore(hoverDate, from) ? hoverDate : from
      const end = isAfter(hoverDate, from) ? hoverDate : from
      return isWithinInterval(day, { start, end })
    }
    return false
  }

  const isRangeStart = (day: Date) => {
    if (selected.from && isSameDay(day, selected.from)) return true
    return false
  }

  const isRangeEnd = (day: Date) => {
    if (selected.to && isSameDay(day, selected.to)) return true
    if (!selected.to && selected.from && hoverDate && isSameDay(day, hoverDate)) return true
    return false
  }

  return (
    <div className="select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-x-1.5 mb-1">
        {weekdays.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-medium py-1.5"
            style={{ color: "var(--drp-text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1.5">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, month)
          const isBeforeMin = !!(minSelectableDate && isBefore(day, minSelectableDate) && !isSameDay(day, minSelectableDate))
          const inRange = isInRange(day)
          const rangeStart = isRangeStart(day)
          const rangeEnd = isRangeEnd(day)
          const isToday = isSameDay(day, new Date())
          const isEndpoint = rangeStart || rangeEnd

          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
              style={{ height: 40 }}
            >
              {/* Range background band */}
              {inRange && isCurrentMonth && (
                <div
                  className="absolute inset-y-[3px]"
                  style={{
                    left: rangeStart ? "50%" : -3,
                    right: rangeEnd ? "50%" : -3,
                    backgroundColor: "var(--drp-range-bg)",
                    borderRadius:
                      rangeStart && rangeEnd
                        ? "9999px"
                        : rangeStart
                        ? "9999px 0 0 9999px"
                        : rangeEnd
                        ? "0 9999px 9999px 0"
                        : "0",
                  }}
                />
              )}

              {/* Day button */}
              <button
                type="button"
                onClick={() => isCurrentMonth && !isBeforeMin && onDateClick(day)}
                onMouseEnter={() => isCurrentMonth && !isBeforeMin && onDateHover(day)}
                onMouseLeave={() => onDateHover(null)}
                disabled={!isCurrentMonth || isBeforeMin}
                className={cn(
                  "relative z-10 flex items-center justify-center rounded-full text-[13px] font-medium transition-all duration-150",
                  "w-[34px] h-[34px]",
                  !isCurrentMonth && "opacity-0 pointer-events-none",
                  isBeforeMin && isCurrentMonth && "opacity-30 cursor-not-allowed",
                )}
                style={{
                  color: isEndpoint
                    ? "#fff"
                    : inRange
                    ? "var(--drp-range-text)"
                    : isToday && !isBeforeMin
                    ? "var(--drp-accent)"
                    : "var(--drp-text)",
                  backgroundColor: isEndpoint
                    ? "var(--drp-accent)"
                    : "transparent",
                  boxShadow: isEndpoint
                    ? "0 2px 8px var(--drp-accent-shadow)"
                    : "none",
                }}
                onMouseOver={(e) => {
                  if (!isEndpoint && isCurrentMonth && !isBeforeMin) {
                    e.currentTarget.style.backgroundColor = "var(--drp-hover-bg)"
                  }
                }}
                onMouseOut={(e) => {
                  if (!isEndpoint) {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
              >
                {format(day, "d")}
                {isToday && !isEndpoint && (
                  <span
                    className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--drp-accent)" }}
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
]

export function DateRangePickerPro({
  value,
  onChange,
  className,
  placeholder = "Select date range",
  label = "Date Range",
  timeframe,
  onTimeframeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [selectionPhase, setSelectionPhase] = React.useState<"start" | "end">("start")
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)
  const [leftMonth, setLeftMonth] = React.useState(new Date())

  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selected = value ?? internalValue
  const setSelected = onChange ?? setInternalValue

  // Position dropdown using fixed positioning to escape parent overflow
  React.useEffect(() => {
    if (!isOpen || !dropdownRef.current || !containerRef.current) return
    const reposition = () => {
      const dd = dropdownRef.current
      const trigger = containerRef.current
      if (!dd || !trigger) return
      const triggerRect = trigger.getBoundingClientRect()
      const ddRect = dd.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const pad = 12

      // Horizontal: left-align with trigger, shift if overflowing
      let left = triggerRect.left
      if (left + ddRect.width > vw - pad) {
        left = vw - pad - ddRect.width
      }
      if (left < pad) left = pad
      dd.style.left = `${left}px`

      // Vertical: prefer below trigger, flip above if no room
      const spaceBelow = vh - triggerRect.bottom - pad
      const spaceAbove = triggerRect.top - pad
      if (spaceBelow < ddRect.height && spaceAbove > spaceBelow) {
        dd.style.top = `${triggerRect.top - ddRect.height - 8}px`
      } else {
        dd.style.top = `${triggerRect.bottom + 8}px`
      }
    }
    requestAnimationFrame(reposition)
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [isOpen])

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleDateClick = (date: Date) => {
    if (selectionPhase === "start") {
      setSelected({ from: date, to: undefined })
      setSelectionPhase("end")
    } else {
      if (selected.from && isBefore(date, selected.from)) return
      setSelected({ from: selected.from, to: date })
      setSelectionPhase("start")
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected({ from: undefined, to: undefined })
    setSelectionPhase("start")
  }

  const rightMonth = addMonths(leftMonth, 1)

  const displayValue =
    selected.from && selected.to
      ? `${format(selected.from, "MMM d, yyyy")} — ${format(selected.to, "MMM d, yyyy")}`
      : selected.from
      ? `${format(selected.from, "MMM d, yyyy")} — ...`
      : null

  const dayCount =
    selected.from && selected.to
      ? Math.round(
          (selected.to.getTime() - selected.from.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1
      : null

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ── CSS Variables for theme ── */}
      <style>{`
        .drp-root {
          /* Dark theme (default) — card-style background, Layout preset color */
          --drp-bg: linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85));
          --drp-bg-solid: #1a2230;
          --drp-border: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.15);
          --drp-border-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.35);
          --drp-text: #e8e0f0;
          --drp-text-secondary: #c0b0e0;
          --drp-text-muted: #5a4a7a;
          --drp-accent: var(--preset-primary, #7c3aed);
          --drp-accent-soft: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.15);
          --drp-accent-shadow: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.35);
          --drp-range-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12);
          --drp-range-text: #c0b0e0;
          --drp-hover-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
          --drp-divider: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
          --drp-trigger-bg: linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85));

          --drp-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.1);
          --drp-nav-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12);
        }

        /* Light theme override — card-style background, Layout preset color */
        :is(.light, [data-theme="light"], [class*="light"]) .drp-root,
        .drp-root:is(.light, [data-theme="light"]) {
          --drp-bg: linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85));
          --drp-bg-solid: #f3edff;
          --drp-border: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12);
          --drp-border-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.3);
          --drp-text: #1a1025;
          --drp-text-secondary: #3d2066;
          --drp-text-muted: #9a8ab5;
          --drp-accent: var(--preset-primary, #7c3aed);
          --drp-accent-soft: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.1);
          --drp-accent-shadow: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.25);
          --drp-range-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
          --drp-range-text: #3d2066;
          --drp-hover-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06);
          --drp-divider: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06);
          --drp-trigger-bg: linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85));
          --drp-shadow: 0 20px 60px -15px rgba(100, 60, 180, 0.15), 0 0 0 1px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
          --drp-nav-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
        }

        @media (prefers-color-scheme: light) {
          .drp-root:not(:is(.dark, [data-theme="dark"], [class*="dark"])) {
            --drp-bg: linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85));
            --drp-bg-solid: #f3edff;
            --drp-border: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.12);
            --drp-border-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.3);
            --drp-text: #1a1025;
            --drp-text-secondary: #3d2066;
            --drp-text-muted: #9a8ab5;
            --drp-accent: var(--preset-primary, #7c3aed);
            --drp-accent-soft: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.1);
            --drp-accent-shadow: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.25);
            --drp-range-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
            --drp-range-text: #3d2066;
            --drp-hover-bg: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06);
            --drp-divider: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06);
            --drp-trigger-bg: linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85));
            --drp-preset-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.06);
            --drp-shadow: 0 20px 60px -15px rgba(100, 60, 180, 0.15), 0 0 0 1px rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
            --drp-nav-hover: rgba(var(--preset-primary-rgb, 124, 58, 237), 0.08);
          }
        }

        .drp-trigger {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .drp-trigger:hover {
          border-color: var(--drp-border-hover) !important;
          box-shadow: 0 0 0 3px var(--drp-accent-soft);
        }
        .drp-trigger:focus-visible {
          outline: none;
          border-color: var(--drp-accent) !important;
          box-shadow: 0 0 0 3px var(--drp-accent-soft);
        }
        .drp-trigger[data-open="true"] {
          border-color: var(--drp-accent) !important;
          box-shadow: 0 0 0 3px var(--drp-accent-soft);
        }

        .drp-dropdown {
          animation: drpSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes drpSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Responsive: stack calendars on small screens */
        @media (max-width: 639px) {
          .drp-calendars {
            flex-direction: column !important;
            padding: 12px !important;
          }
          .drp-calendar-divider {
            width: 100% !important;
            height: 1px !important;
            margin: 8px 0 !important;
          }
        }

      `}</style>

      <div className="drp-root">
        {/* Label */}
        {label && (
          <label
            className="block text-[13px] font-medium mb-1.5"
            style={{ color: "var(--drp-text-muted)" }}
          >
            {label}
          </label>
        )}

        {/* ── Trigger Button ── */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          data-open={isOpen}
          className="drp-trigger w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left cursor-pointer"
          style={{
            backgroundColor: "var(--drp-trigger-bg)",
            border: "1px solid var(--drp-border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <CalendarIcon
            size={16}
            style={{ color: "var(--drp-accent)", flexShrink: 0 }}
          />
          <div className="flex-1 min-w-0">
            {displayValue ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-[13px] font-medium truncate"
                  style={{ color: "var(--drp-text)" }}
                >
                  {displayValue}
                </span>
                {dayCount != null && (
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      backgroundColor: "var(--drp-accent-soft)",
                      color: "var(--drp-accent)",
                      fontWeight: 600,
                    }}
                  >
                    {dayCount}d
                  </span>
                )}
              </div>
            ) : (
              <span
                className="text-[13px]"
                style={{ color: "var(--drp-text-muted)" }}
              >
                {placeholder}
              </span>
            )}
          </div>
          {displayValue && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClear(e as any) }}
              className="flex-shrink-0 rounded-md p-0.5 transition-colors hover:bg-[var(--drp-hover-bg)] cursor-pointer"
              style={{ color: "var(--drp-text-muted)" }}
            >
              <X size={14} />
            </span>
          )}
        </button>

        {/* ── Dropdown Panel ── */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className="drp-dropdown fixed z-[9999] rounded-2xl overflow-hidden sm:w-[620px]"
            style={{
              backgroundColor: "var(--drp-bg)",
              border: "1px solid var(--drp-border)",
              boxShadow: "var(--drp-shadow)",
              backdropFilter: "blur(20px)",
              maxWidth: "calc(100vw - 24px)",
              maxHeight: "calc(100vh - 24px)",
              overflowY: "auto",
            }}
          >
            {/* Top bar — selection hint + timeframe tabs */}
            <div
              className="px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--drp-divider)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--drp-text-muted)" }}
                >
                  {selectionPhase === "start"
                    ? "Select start date"
                    : "Select end date"}
                </span>
              </div>

              {/* Timeframe tabs — always visible */}
              {timeframe && onTimeframeChange && (
                <div>
                  <div
                    className="text-[11px] font-medium mb-1.5 uppercase tracking-wider"
                    style={{ color: "var(--drp-text-muted)" }}
                  >
                    Timeframe
                  </div>
                  <div
                    className="inline-flex rounded-lg p-0.5 gap-0.5"
                    style={{ backgroundColor: "var(--drp-accent-soft)" }}
                  >
                    {TIMEFRAMES.map((tf) => (
                      <button
                        key={tf.value}
                        type="button"
                        onClick={() => onTimeframeChange(tf.value)}
                        className="text-[12px] font-medium px-3 py-1.5 rounded-md transition-all"
                        style={{
                          color:
                            timeframe === tf.value
                              ? "#fff"
                              : "var(--drp-text-secondary)",
                          backgroundColor:
                            timeframe === tf.value
                              ? "var(--drp-accent)"
                              : "transparent",
                          boxShadow:
                            timeframe === tf.value
                              ? "0 1px 4px var(--drp-accent-shadow)"
                              : "none",
                        }}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Month navigation */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--drp-divider)" }}
            >
              <button
                type="button"
                onClick={() => setLeftMonth(subMonths(leftMonth, 1))}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--drp-text-secondary)" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--drp-nav-hover)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-4 sm:gap-8">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--drp-text)" }}
                >
                  {format(leftMonth, "MMMM yyyy")}
                </span>
                <span
                  className="text-[13px] font-semibold hidden sm:inline"
                  style={{ color: "var(--drp-text)" }}
                >
                  {format(rightMonth, "MMMM yyyy")}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLeftMonth(addMonths(leftMonth, 1))}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--drp-text-secondary)" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--drp-nav-hover)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Calendar grids */}
            <div className="drp-calendars flex p-4 gap-0">
              {/* Left month */}
              <div className="flex-1 px-2">
                {/* Mobile-only month label */}
                <div
                  className="sm:hidden text-center text-[12px] font-semibold mb-2"
                  style={{ color: "var(--drp-text-muted)" }}
                >
                  {format(leftMonth, "MMMM yyyy")}
                </div>
                <MonthGrid
                  month={leftMonth}
                  selected={selected}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                  minSelectableDate={selectionPhase === "end" ? selected.from : null}
                />
              </div>

              {/* Divider */}
              <div
                className="drp-calendar-divider w-px self-stretch mx-3"
                style={{ backgroundColor: "var(--drp-divider)" }}
              />

              {/* Right month */}
              <div className="flex-1 px-2">
                {/* Mobile-only month label */}
                <div
                  className="sm:hidden text-center text-[12px] font-semibold mb-2"
                  style={{ color: "var(--drp-text-muted)" }}
                >
                  {format(rightMonth, "MMMM yyyy")}
                </div>
                <MonthGrid
                  month={rightMonth}
                  selected={selected}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                  minSelectableDate={selectionPhase === "end" ? selected.from : null}
                />
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderTop: "1px solid var(--drp-divider)" }}
            >
              <button
                type="button"
                onClick={() => {
                  setLeftMonth(new Date())
                  if (!selected.from) {
                    handleDateClick(new Date())
                  }
                }}
                className="text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                style={{
                  color: "var(--drp-accent)",
                  backgroundColor: "transparent",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--drp-accent-soft)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                Today
              </button>

              {selected.from && selected.to && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    color: "#fff",
                    backgroundColor: "var(--drp-accent)",
                    boxShadow: "0 2px 8px var(--drp-accent-shadow)",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.opacity = "0.9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DateRangePickerPro

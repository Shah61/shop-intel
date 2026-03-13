"use client"

import * as React from "react"
import {
  format,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

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

const PRESETS = [
  { id: "today", label: "Today", get: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { id: "7d", label: "Last 7 days", get: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { id: "30d", label: "Last 30 days", get: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { id: "thisMonth", label: "This month", get: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { id: "lastMonth", label: "Last month", get: () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return { from: startOfMonth(d), to: endOfMonth(d) } } },
] as const

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
    if (from && to) return isWithinInterval(day, { start: from, end: to })
    if (from && hoverDate && !to) {
      const start = isBefore(hoverDate, from) ? hoverDate : from
      const end = isAfter(hoverDate, from) ? hoverDate : from
      return isWithinInterval(day, { start, end })
    }
    return false
  }
  const isRangeStart = (day: Date) => !!(selected.from && isSameDay(day, selected.from))
  const isRangeEnd = (day: Date) =>
    !!(selected.to && isSameDay(day, selected.to)) ||
    (!selected.to && selected.from && hoverDate && isSameDay(day, hoverDate))

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
        {weekdays.map((d) => (
          <div key={d} className="text-center text-[10px] sm:text-[11px] font-medium py-1 text-muted-foreground">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, month)
          const isBeforeMin = !!(minSelectableDate && isBefore(day, minSelectableDate) && !isSameDay(day, minSelectableDate))
          const inRange = isInRange(day)
          const rangeStart = isRangeStart(day)
          const rangeEnd = isRangeEnd(day)
          const isToday = isSameDay(day, new Date())
          const isEndpoint = rangeStart || rangeEnd
          return (
            <button
              key={i}
              type="button"
              onClick={() => isCurrentMonth && !isBeforeMin && onDateClick(day)}
              onMouseEnter={() => isCurrentMonth && !isBeforeMin && onDateHover(day)}
              onMouseLeave={() => onDateHover(null)}
              disabled={!isCurrentMonth || isBeforeMin}
              className={cn(
                "relative z-10 flex items-center justify-center rounded-md text-[12px] sm:text-[13px] font-medium transition-colors w-7 h-7 sm:w-8 sm:h-8",
                !isCurrentMonth && "opacity-0 pointer-events-none",
                isBeforeMin && isCurrentMonth && "opacity-40 cursor-not-allowed",
                isEndpoint && "bg-primary text-primary-foreground",
                inRange && !isEndpoint && "bg-primary/15 text-foreground",
                isToday && !isEndpoint && !inRange && "ring-1 ring-primary text-primary",
                !isEndpoint && !inRange && "hover:bg-muted"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePickerPro({
  value,
  onChange,
  className,
  placeholder = "Select date range",
  label = "",
  timeframe,
  onTimeframeChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<DateRange>({ from: undefined, to: undefined })
  const [selectionPhase, setSelectionPhase] = React.useState<"start" | "end">("start")
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)
  const [showCustom, setShowCustom] = React.useState(false)
  const [month, setMonth] = React.useState(new Date())
  const containerRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selected = value ?? internalValue
  const setSelected = onChange ?? setInternalValue

  React.useEffect(() => {
    if (!isOpen || !dropdownRef.current || !containerRef.current) return
    const run = () => {
      const dd = dropdownRef.current
      const trigger = containerRef.current
      if (!dd || !trigger) return
      const tr = trigger.getBoundingClientRect()
      const dr = dd.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const pad = 8
      let left = tr.left
      if (left + dr.width > vw - pad) left = vw - dr.width - pad
      if (left < pad) left = pad
      dd.style.left = `${left}px`
      const spaceBelow = vh - tr.bottom - pad
      const spaceAbove = tr.top - pad
      if (spaceBelow < dr.height && spaceAbove > spaceBelow) {
        dd.style.top = `${tr.top - dr.height - 8}px`
      } else {
        dd.style.top = `${tr.bottom + 8}px`
      }
    }
    requestAnimationFrame(run)
    window.addEventListener("resize", run)
    window.addEventListener("scroll", run, true)
    return () => {
      window.removeEventListener("resize", run)
      window.removeEventListener("scroll", run, true)
    }
  }, [isOpen, showCustom])

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsOpen(false); setShowCustom(false) } }
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
      setShowCustom(false)
      setIsOpen(false)
    }
  }

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    const range = preset.get()
    setSelected({ from: range.from, to: range.to })
    setIsOpen(false)
    setShowCustom(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected({ from: undefined, to: undefined })
    setSelectionPhase("start")
  }

  const displayValue =
    selected.from && selected.to
      ? `${format(selected.from, "MMM d")} – ${format(selected.to, "MMM d, yyyy")}`
      : selected.from
      ? `${format(selected.from, "MMM d")} – …`
      : null

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label ? (
        <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      ) : null}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left w-full min-w-0 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "sm:min-w-[200px]"
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className={cn("flex-1 min-w-0 truncate text-sm", displayValue ? "text-foreground font-medium" : "text-muted-foreground")}>
          {displayValue ?? placeholder}
        </span>
        {displayValue ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleClear(e); }}
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed z-[9999] rounded-xl border bg-popover text-popover-foreground shadow-lg overflow-hidden w-[calc(100vw-16px)] max-w-[320px] sm:max-w-[360px] max-h-[min(85vh,520px)] overflow-y-auto"
        >
          {/* Presets */}
          {!showCustom ? (
            <>
              <div className="p-2 border-b">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">Quick select</p>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-0.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className="text-left text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-2 border-b">
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="w-full text-sm font-medium text-primary px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Custom range…
                </button>
              </div>
              {timeframe != null && onTimeframeChange != null ? (
                <div className="p-3 border-b">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Timeframe</p>
                  <div className="flex flex-wrap gap-1">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => onTimeframeChange(tf)}
                        className={cn(
                          "text-xs font-medium capitalize px-2.5 py-1.5 rounded-md transition-colors",
                          timeframe === tf ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <span className="text-sm font-semibold">{format(month, "MMMM yyyy")}</span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
                    className="p-1.5 rounded hover:bg-muted"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
                    className="p-1.5 rounded hover:bg-muted"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  {selectionPhase === "start" ? "Select start date" : "Select end date"}
                </p>
                <MonthGrid
                  month={month}
                  selected={selected}
                  hoverDate={hoverDate}
                  onDateClick={handleDateClick}
                  onDateHover={setHoverDate}
                  minSelectableDate={selectionPhase === "end" ? selected.from : null}
                />
              </div>
              <div className="px-3 py-2 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMonth(new Date())}
                  className="text-xs text-primary hover:underline"
                >
                  Go to today
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DateRangePickerPro

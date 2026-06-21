"use client"

import { useEffect, useRef, useState } from "react"

import {
  EMAIL,
  EMAIL_MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
  PHONE_WHATSAPP,
} from "./contact-info"

const DEMO_BUTTON_DELAY_MS = 400

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function BookDemoPopover({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        className={`relative overflow-hidden rounded-full font-semibold text-white transition-all duration-300 ${
          compact ? "px-4 py-1.5 text-[12px]" : "px-6 py-2 text-[13px]"
        } ${hovered && !compact ? "demo-btn-hover" : ""}`}
        style={{
          animationName: "landing-header-in",
          animationDuration: "0.55s",
          animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          animationFillMode: "forwards",
          animationDelay: `${DEMO_BUTTON_DELAY_MS}ms`,
          opacity: 0,
          background: hovered
            ? "linear-gradient(135deg, #8b5cf6, #d946ef, #8b5cf6)"
            : "linear-gradient(135deg, #7c3aed, #c026d3)",
          backgroundSize: hovered ? "200% auto" : "100% auto",
          boxShadow: hovered && !compact ? undefined : compact ? "0 2px 10px rgba(124,58,237,0.25)" : "0 4px 16px rgba(124,58,237,0.3)",
          transform: hovered && !compact ? "scale(1.05)" : "scale(1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 55%, transparent 65%)",
            backgroundSize: "250% 100%",
            animation: hovered ? "demo-shimmer 1.2s ease-in-out infinite" : "none",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
        <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
          Book a Demo
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="transition-transform duration-300"
            style={{ transform: open || hovered ? "translateX(2px)" : "translateX(0)" }}
          >
            <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Book a demo"
          className="absolute right-0 top-[calc(100%+10px)] z-[60] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#100e1b] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          style={{
            animation: "book-demo-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards",
          }}
        >
          <div className="border-b border-white/[0.06] px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">Talk to our team</p>
            <a
              href={PHONE_TEL}
              className="mt-1 block text-[17px] font-semibold text-white transition-colors hover:text-violet-300"
              dir="ltr"
            >
              {PHONE_DISPLAY}
            </a>
            <p className="mt-1 text-[12px] text-white/40">Mon–Fri, 9am–6pm (MYT)</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3">
            <a
              href={PHONE_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/15 px-3 py-2.5 text-[13px] font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/25"
              onClick={() => setOpen(false)}
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <a
              href={PHONE_TEL}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] font-semibold text-white/90 transition-colors hover:bg-white/[0.08]"
              onClick={() => setOpen(false)}
            >
              <PhoneIcon />
              Call
            </a>
          </div>

          <a
            href={EMAIL_MAILTO}
            className="flex items-center gap-2.5 border-t border-white/[0.06] px-5 py-3.5 text-[13px] text-white/60 transition-colors hover:bg-white/[0.03] hover:text-white/90"
            onClick={() => setOpen(false)}
          >
            <MailIcon />
            {EMAIL}
          </a>
        </div>
      )}

      <style>{`
        @keyframes book-demo-pop {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

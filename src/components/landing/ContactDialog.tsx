"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { trackWhatsAppConversion } from "@/lib/gtag"; 

import {
  EMAIL,
  EMAIL_MAILTO,
  PHONE_DISPLAY,
  PHONE_TEL,
  PHONE_WHATSAPP,
} from "./contact-info"

export { EMAIL, PHONE_DISPLAY, PHONE_TEL as PHONE_HREF } from "./contact-info"

const OPEN_MS = 480
const CLOSE_MS = 260
const EASE_OPEN = "cubic-bezier(0.34, 1.2, 0.5, 1)"
const EASE_CLOSE = "cubic-bezier(0.4, 0, 1, 1)"

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#contactGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#contactGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function useContactDialog() {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const originRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const openDialog = useCallback((trigger?: HTMLElement | null) => {
    if (trigger) {
      const r = trigger.getBoundingClientRect()
      originRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    } else {
      originRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }
    setMounted(true)
  }, [])

  const closeDialog = useCallback(() => {
    setShown(false)
    window.setTimeout(() => setMounted(false), CLOSE_MS)
  }, [])

  useLayoutEffect(() => {
    if (!mounted) return
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    const ox = originRef.current.x - rect.left
    const oy = originRef.current.y - rect.top
    panel.style.transformOrigin = `${ox}px ${oy}px`
    void panel.getBoundingClientRect()
    requestAnimationFrame(() => setShown(true))
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [mounted, closeDialog])

  return { mounted, shown, openDialog, closeDialog, panelRef }
}

type ContactDialogProps = {
  mounted: boolean
  shown: boolean
  onClose: () => void
  panelRef: React.Ref<HTMLDivElement>
}

export function ContactDialog({ mounted, shown, onClose, panelRef }: ContactDialogProps) {
  if (!mounted || typeof document === "undefined") return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Book a free demo"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default bg-black/70 backdrop-blur-sm transition-opacity"
        style={{
          opacity: shown ? 1 : 0,
          transitionDuration: `${shown ? OPEN_MS : CLOSE_MS}ms`,
        }}
      />

      <div
        ref={panelRef}
        className="relative z-[1] w-full max-w-[520px] max-h-[min(90dvh,720px)] overflow-y-auto rounded-3xl border border-white/[0.12] bg-[#100e1b] opacity-100 shadow-[0_30px_90px_rgba(0,0,0,0.8)]"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(0.12)",
          transition: `transform ${shown ? OPEN_MS : CLOSE_MS}ms ${shown ? EASE_OPEN : EASE_CLOSE}, opacity ${shown ? OPEN_MS * 0.6 : CLOSE_MS}ms ease`,
        }}
      >
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <linearGradient id="contactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-6 pb-7 pt-10 sm:px-9 sm:pb-9 sm:pt-11">
          <div className="mb-7 text-center sm:mb-8">
            <h3
              className="mb-2 text-white"
              style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: "clamp(24px, 6vw, 34px)",
                fontWeight: 400,
                lineHeight: 1.15,
              }}
            >
              Let&apos;s talk about your business
            </h3>
            <p className="mx-auto max-w-[400px] text-[14px] leading-[1.7] text-white/50">
              Reach out by phone or email — we&apos;ll get back to you fast.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <a
              href={PHONE_TEL}
              className="group/card relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <PhoneIcon />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/40">Call us</p>
                <p className="text-[16px] font-semibold text-white" dir="ltr">{PHONE_DISPLAY}</p>
                <p className="mt-1.5 text-[12px] text-white/40">Mon–Fri, 9am–6pm (MYT)</p>
              </div>
            </a>

            <a
              href={EMAIL_MAILTO}
              className="group/card relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <MailIcon />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/40">Email us</p>
                <p className="break-all text-[16px] font-semibold text-white">{EMAIL}</p>
                <p className="mt-1.5 text-[12px] text-white/40">Within 1 business day</p>
              </div>
            </a>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
             href={PHONE_WHATSAPP}
             target="_blank"
             rel="noopener noreferrer"
             onClick={() => trackWhatsAppConversion()}
             className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366]/15 px-6 py-3.5 text-[15px] font-medium text-[#25D366] transition-colors duration-200 hover:bg-[#25D366]/25"
           >
             Chat on WhatsApp
           </a>
            <a
              href={EMAIL_MAILTO}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-[15px] font-medium text-white/90 transition-colors duration-200 hover:bg-white/[0.12] hover:text-white"
            >
              Send us a message
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

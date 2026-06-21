"use client"

import { useRef } from "react"

import { ContactDialog, useContactDialog } from "./ContactDialog"

export default function ContactSection() {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { mounted, shown, openDialog, closeDialog, panelRef } = useContactDialog()

  return (
    <section
      id="contact"
      className="relative w-full overflow-hidden bg-[#070611] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.22) 0%, rgba(244,114,182,0.10) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-[640px] flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-[7px]">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-pink-400" />
          <span className="text-[13px] font-medium text-white/80">Get in touch</span>
        </div>

        <h2
          className="mb-4 text-white"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(30px, 5vw, 52px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}
        >
          Let&apos;s talk about your business
        </h2>

        <p className="mb-9 max-w-[520px] text-[15px] leading-[1.8] text-white/50 sm:text-base">
          Questions, a demo, or just curious how Pulse fits your team? Reach out
          and we&apos;ll get back to you fast.
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => openDialog(buttonRef.current)}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.35)] transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98] sm:px-8"
          style={{ background: "linear-gradient(135deg, #7c3aed, #c026d3, #db2777)" }}
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)",
            }}
            aria-hidden
          />
          <span className="relative z-10">Book a Free Demo</span>
          <svg
            className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
            width="16"
            height="16"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <ContactDialog mounted={mounted} shown={shown} onClose={closeDialog} panelRef={panelRef} />
    </section>
  )
}

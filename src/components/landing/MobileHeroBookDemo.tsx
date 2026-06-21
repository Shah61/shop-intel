"use client"

import { useRef } from "react"

import { ContactDialog, useContactDialog } from "./ContactDialog"

export function MobileHeroBookDemo() {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { mounted, shown, openDialog, closeDialog, panelRef } = useContactDialog()

  return (
    <>
      <div
        className="landing-bottom-fade mx-auto mt-2 flex w-full justify-center px-6 pb-8 md:hidden"
        style={{ animationDelay: "960ms" }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => openDialog(buttonRef.current)}
          className="group relative w-full max-w-[280px] overflow-hidden rounded-full px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_32px_rgba(124,58,237,0.45)] transition-transform duration-300 active:scale-[0.97]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #c026d3, #db2777)" }}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-40"
            style={{
              background:
                "radial-gradient(circle at 30% 0%, rgba(255,255,255,0.35), transparent 55%)",
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-active:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)",
            }}
            aria-hidden
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            Book a Demo
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M5.5 3L9.5 7L5.5 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <ContactDialog mounted={mounted} shown={shown} onClose={closeDialog} panelRef={panelRef} />
    </>
  )
}

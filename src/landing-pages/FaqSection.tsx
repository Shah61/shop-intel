import type { CSSProperties } from "react"
import { useState } from "react"
import { Plus, X } from "lucide-react"

/** Same mesh + base gradient as `GetWorkDoneSection` inner card — used as the card fill. */
const GET_WORK_DONE_CARD_BG_STYLE: CSSProperties = {
  background: `
    radial-gradient(circle at 70% 20%, rgba(255, 120, 200, 0.25), transparent 40%),
    radial-gradient(circle at 30% 80%, rgba(120, 150, 255, 0.2), transparent 50%),
    linear-gradient(135deg, #0b0a14 0%, #100e1b 40%, #0a0f2c 100%)
  `,
}

const faqs = [
  {
    q: "What is Pulse?",
    a: "Pulse is an operations and intelligence platform for modern commerce brands. It unifies your sales, marketing, inventory, retail, and customer signals into one decision-ready workspace.",
  },
  {
    q: "Can I integrate Pulse with my existing tools?",
    a: "Yes. Pulse is built to connect with your existing stack, including commerce channels and marketing platforms, so your team works from one consistent source of truth.",
  },
  {
    q: "How does Pulse automate tasks?",
    a: "Pulse automates repetitive reporting and analysis work, then uses AI to surface what changed, why it matters, and what your team should do next.",
  },
  {
    q: "Is my data secure with Pulse?",
    a: "Yes. Pulse uses enterprise-grade security controls and encrypted data handling so your business data stays protected.",
  },
  {
    q: "What kind of support do you offer?",
    a: "We provide onboarding guidance, implementation support, and ongoing product assistance to help your team get value from Pulse quickly.",
  },
]

type Props = {
  /** Black page + rounded card whose fill matches “Get your work done” */
  workDoneBackdrop?: boolean
}

export default function FAQSection({ workDoneBackdrop }: Props) {
  const [openIndex, setOpenIndex] = useState(0)

  const inner = (
    <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div>
          <div className="inline-block mb-4 px-4 py-1 text-sm rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10">
            FAQ
          </div>

          <h2 className="text-5xl font-semibold leading-tight mb-6">
            Frequently Asked Questions
          </h2>

          <h3 className="text-xl mb-2 text-white/90">
            Still have a question?
          </h3>

          <p className="text-white/60 mb-6">
            Contact us and our team will help you get started.
          </p>

          {/* avatars */}
          <div className="flex items-center -space-x-3">
            <img
              src="https://i.pravatar.cc/100?img=1"
              className="h-10 w-10 rounded-full border-2 border-[#0b0a14]"
            />
            <img
              src="https://i.pravatar.cc/100?img=2"
              className="h-10 w-10 rounded-full border-2 border-[#0b0a14]"
            />
            <img
              src="https://i.pravatar.cc/100?img=3"
              className="h-10 w-10 rounded-full border-2 border-[#0b0a14]"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {faqs.map((faq, i) => {
            const isOpen = i === openIndex

            return (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-[#0a0a12] overflow-hidden"
              >
                {/* QUESTION */}
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? -1 : i)
                  }
                  className="w-full flex items-center justify-between text-left px-6 py-5"
                >
                  <span className="text-lg font-medium">
                    {faq.q}
                  </span>

                  {isOpen ? (
                    <X className="w-5 h-5 text-white/60" />
                  ) : (
                    <Plus className="w-5 h-5 text-white/60" />
                  )}
                </button>

                {/* ANSWER */}
                <div
                  className={`px-6 transition-all duration-300 ${
                    isOpen ? "pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-white/60 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

    </div>
  )

  if (workDoneBackdrop) {
    return (
      <section id="faq" className="w-full scroll-mt-28 bg-black px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-28 md:scroll-mt-32">
        <div className="relative mx-auto w-full max-w-[min(86.4vw,1512px)] overflow-hidden rounded-2xl border border-white/10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={GET_WORK_DONE_CARD_BG_STYLE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 backdrop-blur-[20px]"
          />
          <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-14 md:px-12 md:py-16">
            {inner}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="faq" className="w-full scroll-mt-28 bg-black py-28 px-6 text-white md:scroll-mt-32 md:px-16">
      {inner}
    </section>
  )
}
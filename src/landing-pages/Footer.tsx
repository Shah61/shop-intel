import Link from "next/link"

type FooterLink = { label: string; href: string; external?: boolean }

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About Pulse", href: "/home#real-time-intelligence" },
      { label: "Platform Overview", href: "/home/features" },
      { label: "Why Teams Choose Pulse", href: "/home/why-choose-us" },
    ],
  },
  {
    title: "Features",
    links: [
      { label: "Sales Intelligence", href: "/home/features" },
      { label: "Marketing Intelligence", href: "/home/features" },
      { label: "Inventory & Fulfillment", href: "/home/features" },
      { label: "Retail & Branch Analytics", href: "/home/features" },
    ],
  },
  {
    title: "Learn More",
    links: [
      { label: "FAQ", href: "/home/features#faq" },
      { label: "Book a Demo", href: "/home#contact" },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full bg-[#050508] text-white px-6 md:px-16 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">

        {/* TOP GRID */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 md:gap-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-6 text-white/90">{col.title}</h4>
              <ul className="space-y-4 text-white/60">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:text-white transition"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="inline-block hover:text-white transition">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="mt-20 flex justify-center sm:justify-end">
          <div className="text-center text-sm text-white/50 sm:text-right">
            © 2026 Haris AI Solutions, Inc.
          </div>
        </div>

      </div>
    </footer>
  )
}

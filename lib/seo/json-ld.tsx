import { absoluteUrl, siteConfig } from "@/lib/seo/site"
import { faqs } from "@/lib/seo/faq"

type JsonLdObject = Record<string, unknown>

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl("/Icon.png"),
    description: siteConfig.description,
    areaServed: "MY",
  }
}

export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: ["PulseTech", "Pulse Tech Malaysia"],
    url: siteConfig.url,
    description: siteConfig.shortDescription,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en",
  }
}

export function softwareApplicationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.url}/#software`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "E-commerce analytics",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MYR",
      description: "Get started with Pulse — contact us for plans.",
    },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    featureList: [
      "Unified sales analytics across channels",
      "AI-powered business intelligence",
      "Marketing campaign tracking",
      "Inventory management",
      "Physical retail tracking",
    ],
  }
}

export function faqJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

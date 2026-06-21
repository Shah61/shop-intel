declare global {
    interface Window {
      gtag?: (...args: unknown[]) => void;
    }
  }
  
  export const GOOGLE_ADS_WHATSAPP_SEND_TO =
    "AW-18253883339/Zus4CPf42cIcEMvPkIBE";
  
  // Fire-and-forget. Use on links that keep their own navigation
  // (e.g. target="_blank"). The hit is sent via the Beacon API.
  export function trackWhatsAppConversion(): void {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "conversion", {
      send_to: GOOGLE_ADS_WHATSAPP_SEND_TO,
    });
  }
  
  export {};
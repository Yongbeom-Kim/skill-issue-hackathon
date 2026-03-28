/**
 * Get a logo URL for any source domain.
 * Uses Clearbit Logo API — works for any company.
 *
 * Usage:
 *   getSourceIcon("flyscoot.com")      → "https://logo.clearbit.com/flyscoot.com"
 *   getSourceIcon("booking.com")       → "https://logo.clearbit.com/booking.com"
 *   getSourceIcon("reddit")            → "https://logo.clearbit.com/reddit.com"
 *   getSourceIcon("xhs")              → "https://logo.clearbit.com/xiaohongshu.com"
 */

const SOURCE_ALIASES: Record<string, string> = {
  xhs: "xiaohongshu.com",
  xiaohongshu: "xiaohongshu.com",
  reddit: "reddit.com",
  tripadvisor: "tripadvisor.com",
  sia: "singaporeair.com",
  scoot: "flyscoot.com",
  jetstar: "jetstar.com",
  airasia: "airasia.com",
  qantas: "qantas.com",
}

export function getSourceIcon(source: string, size = 32): string {
  const domain = SOURCE_ALIASES[source.toLowerCase()] ?? source
  return `https://logo.clearbit.com/${domain}?size=${size}`
}

/**
 * Get display color for community sources (used for quote borders).
 */
export function getSourceColor(source: string): string {
  switch (source.toLowerCase()) {
    case "xhs":
    case "xiaohongshu":
      return "#e74c3c"
    case "reddit":
      return "#ff6600"
    case "tripadvisor":
      return "#00aa6c"
    default:
      return "#888"
  }
}

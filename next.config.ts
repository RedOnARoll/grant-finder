import type { NextConfig } from "next"

const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/^https?:\/\//, "")

const securityHeaders = [
  // Prevent clickjacking — SAMEORIGIN (not DENY) so same-origin iframes work (e.g. /forms/*.pdf)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Restrict referrer info sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed by this app
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  // Enforce HTTPS for 1 year
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Content Security Policy — blocks external script injection
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.stripe.com`,
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

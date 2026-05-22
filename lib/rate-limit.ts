/**
 * In-memory rate limiter.
 * Works per-instance on Vercel serverless. For multi-region distributed
 * rate limiting, swap the store for Upstash Redis (@upstash/ratelimit).
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Prune expired entries every 5 min to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000).unref?.()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check and increment the rate limit for `key`.
 * @param key      e.g. "signup:1.2.3.4"
 * @param limit    Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/** Extract best-effort client IP from proxy-forwarded headers. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

/** Standard 429 response with Retry-After header. */
export function tooManyRequests(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": "0",
      },
    }
  )
}

/**
 * Validate Content-Length against a maximum.
 * Returns a 413 Response if the header reports an oversized payload,
 * or null if the size is acceptable.
 * Note: also call this after reading the body for streams without Content-Length.
 */
export function checkPayloadSize(request: Request, maxBytes: number): Response | null {
  const len = Number(request.headers.get("content-length") ?? 0)
  if (len > maxBytes) {
    return new Response(
      JSON.stringify({ error: "Payload too large." }),
      { status: 413, headers: { "Content-Type": "application/json" } }
    )
  }
  return null
}

/** Strip null bytes and control characters from a string. */
export function sanitizeString(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/\x00/g, "").replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").trim()
}

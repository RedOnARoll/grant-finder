import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ── Upstash Redis (production) ────────────────────────────────────────
// When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, all
// rate limits are enforced via Redis and work correctly across every
// Vercel serverless instance. Falls back to in-memory for local dev.

let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Cache Ratelimit instances by their config so we don't recreate them
const limiterCache = new Map<string, Ratelimit>()

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  if (!limiterCache.has(cacheKey)) {
    limiterCache.set(cacheKey, new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
      prefix: "gw:rl",
    }))
  }
  return limiterCache.get(cacheKey)!
}

// ── In-memory fallback (local dev) ───────────────────────────────────

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000).unref?.()

function rateLimitMemory(key: string, limit: number, windowMs: number): RateLimitResult {
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

// ── Public API ────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (redis) {
    const limiter = getUpstashLimiter(limit, windowMs)
    const { success, remaining, reset } = await limiter.limit(key)
    return { allowed: success, remaining, resetAt: reset }
  }
  return rateLimitMemory(key, limit, windowMs)
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
 * Returns a 413 Response if the header reports an oversized payload, null otherwise.
 * Note: also validate the actual body size after parsing for streams without Content-Length.
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

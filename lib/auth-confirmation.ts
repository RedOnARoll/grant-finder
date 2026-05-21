export const AUTH_CONFIRMATION_EVENT = "grantway-auth-confirmed"

export type AuthConfirmationPayload = {
  target: string
  at: number
}

function parsePayload(value: string | null): AuthConfirmationPayload | null {
  if (!value) return null

  try {
    const payload = JSON.parse(value) as Partial<AuthConfirmationPayload>
    if (typeof payload.target !== "string" || typeof payload.at !== "number") return null
    return { target: payload.target, at: payload.at }
  } catch {
    return null
  }
}

function isRecent(payload: AuthConfirmationPayload) {
  return Date.now() - payload.at < 10 * 60 * 1000
}

export function readLatestAuthConfirmation() {
  if (typeof window === "undefined") return null
  const payload = parsePayload(window.localStorage.getItem(AUTH_CONFIRMATION_EVENT))
  return payload && isRecent(payload) ? payload : null
}

export function broadcastAuthConfirmation(target = "/") {
  if (typeof window === "undefined") return

  const payload: AuthConfirmationPayload = { target, at: Date.now() }
  const serialized = JSON.stringify(payload)

  window.localStorage.setItem(AUTH_CONFIRMATION_EVENT, serialized)

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(AUTH_CONFIRMATION_EVENT)
    channel.postMessage(payload)
    channel.close()
  }
}

export function listenForAuthConfirmation(onConfirm: (payload: AuthConfirmationPayload) => void) {
  if (typeof window === "undefined") return () => {}

  let lastHandledAt = Number(window.sessionStorage.getItem(`${AUTH_CONFIRMATION_EVENT}:handled`) ?? 0)

  const confirmOnce = (payload: AuthConfirmationPayload | null) => {
    if (!payload || !isRecent(payload) || payload.at <= lastHandledAt) return
    lastHandledAt = payload.at
    window.sessionStorage.setItem(`${AUTH_CONFIRMATION_EVENT}:handled`, String(payload.at))
    onConfirm(payload)
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_CONFIRMATION_EVENT) return
    const payload = parsePayload(event.newValue)
    confirmOnce(payload)
  }

  const handleFocus = () => confirmOnce(readLatestAuthConfirmation())
  const handleVisibilityChange = () => {
    if (!document.hidden) confirmOnce(readLatestAuthConfirmation())
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener("focus", handleFocus)
  document.addEventListener("visibilitychange", handleVisibilityChange)

  const initialTimer = window.setTimeout(() => confirmOnce(readLatestAuthConfirmation()), 0)

  let channel: BroadcastChannel | null = null
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(AUTH_CONFIRMATION_EVENT)
    channel.onmessage = (event: MessageEvent<AuthConfirmationPayload>) => {
      if (event.data?.target) confirmOnce(event.data)
    }
  }

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener("focus", handleFocus)
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    window.clearTimeout(initialTimer)
    channel?.close()
  }
}

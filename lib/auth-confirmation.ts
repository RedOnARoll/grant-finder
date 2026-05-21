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

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_CONFIRMATION_EVENT) return
    const payload = parsePayload(event.newValue)
    if (payload) onConfirm(payload)
  }

  window.addEventListener("storage", handleStorage)

  let channel: BroadcastChannel | null = null
  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(AUTH_CONFIRMATION_EVENT)
    channel.onmessage = (event: MessageEvent<AuthConfirmationPayload>) => {
      if (event.data?.target) onConfirm(event.data)
    }
  }

  return () => {
    window.removeEventListener("storage", handleStorage)
    channel?.close()
  }
}

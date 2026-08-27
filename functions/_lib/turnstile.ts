export interface TurnstileVerificationInput {
  token: string
  remoteIp: string
}

export interface TurnstileOptions {
  secret: string
  fetch?: typeof fetch
  timeoutMs?: number
}

export async function verifyTurnstile(
  input: TurnstileVerificationInput,
  options: TurnstileOptions
): Promise<boolean> {
  if (!options.secret || !input.token) return false
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000)
  const body = new URLSearchParams({
    secret: options.secret,
    response: input.token,
    remoteip: input.remoteIp,
    idempotency_key: crypto.randomUUID()
  })

  try {
    const response = await (options.fetch ?? fetch)(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: controller.signal
      }
    )
    if (!response.ok) return false
    const result = (await response.json()) as { success?: unknown }
    return result.success === true
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

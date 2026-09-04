import { parse } from 'tldts'

export function registrableDomain(hostname) {
  if (typeof hostname !== 'string') return ''
  const normalized = hostname.trim().toLowerCase().replace(/\.+$/u, '')
  if (!normalized) return ''

  const result = parse(normalized, { allowPrivateDomains: true })
  if (!result.domain
    || result.isIp
    || result.isSpecialUse
    || (result.isIcann !== true && result.isPrivate !== true)) return ''
  return result.domain.toLowerCase()
}

export function registrableDomainFromUrl(value) {
  try {
    return registrableDomain(new URL(value).hostname)
  } catch {
    return ''
  }
}

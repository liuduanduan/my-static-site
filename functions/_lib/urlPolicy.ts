import { normalizeOfficialUrl } from '../../shared/submissions/validation'

export function assertPublicHttpsUrl(value: unknown): URL {
  return new URL(normalizeOfficialUrl(value))
}

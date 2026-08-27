import type { D1DatabaseLike } from './submissionRepository'

export interface Env {
  SUBMISSIONS_DB: D1DatabaseLike
  TURNSTILE_SECRET_KEY: string
  PUBLIC_CODE_PEPPER: string
  SUBMISSIONS_ADMIN_TOKEN: string
  CONTACT_EMAIL_ENCRYPTION_KEY: string
}

export type SubmissionSecurityEnv = Pick<
  Env,
  'PUBLIC_CODE_PEPPER' | 'CONTACT_EMAIL_ENCRYPTION_KEY'
>

export function requireEnvString(env: Partial<Env>, key: keyof Env): string {
  const value = env[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required binding: ${key}`)
  }
  return value
}

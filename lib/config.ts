// lib/config.ts
// Central configuration that won't fail during build

export function isBuildTime(): boolean {
  return (
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    !process.env.RESEND_API_KEY
  )
}

export function getEnvVar(key: string, defaultValue: string = ''): string {
  if (isBuildTime()) {
    return defaultValue
  }
  return process.env[key] || defaultValue
}

export function warnIfMissing(key: string, value: string): void {
  if (!value && !isBuildTime() && typeof window === 'undefined') {
    console.warn(`⚠️ ${key} is not set`)
  }
}

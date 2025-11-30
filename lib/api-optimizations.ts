// lib/api-optimizations.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export class APIOptimizer {
  private static instance: APIOptimizer
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 30000 // 30 seconds

  static getInstance(): APIOptimizer {
    if (!APIOptimizer.instance) {
      APIOptimizer.instance = new APIOptimizer()
    }
    return APIOptimizer.instance
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private readonly MAX_ATTEMPTS = 10
  private readonly WINDOW_MS = 60000 // 1 minute

  isRateLimited(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.WINDOW_MS

    let userAttempts = this.attempts.get(identifier) || []
    userAttempts = userAttempts.filter((time) => time > windowStart)

    if (userAttempts.length >= this.MAX_ATTEMPTS) {
      return true
    }

    userAttempts.push(now)
    this.attempts.set(identifier, userAttempts)
    return false
  }
}

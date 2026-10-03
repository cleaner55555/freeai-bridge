import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface FundStatus {
  earnedUsd: number
  fundUsd: number
  devUsd: number
  spentUsd: number
  remainingUsd: number
  blocked: boolean
  downgraded: boolean
}

// ponytail: JSON fajlovi, bez DB. Dovoljno za MVP.
function dir(): string {
  const d = join(homedir(), '.dsh', 'freeai-bridge')
  if (!existsSync(d)) mkdirSync(d, { recursive: true })
  return d
}

function readJson<T>(p: string, fallback: T): T {
  try {
    if (!existsSync(p)) return fallback
    return JSON.parse(readFileSync(p, 'utf8')) as T
  } catch {
    return fallback
  }
}

export function earningsPath(): string {
  return join(dir(), 'earnings.json')
}

export function spendPath(): string {
  return join(dir(), 'spend.json')
}

export function recordRevenue(revenueUsd: number, apiFundRatio: number): FundStatus {
  const e = readJson<{ earned: number }>(earningsPath(), { earned: 0 })
  e.earned += revenueUsd
  writeFileSync(earningsPath(), JSON.stringify(e, null, 2))
  return status(apiFundRatio, 50)
}

export function recordSpend(costUsd: number, apiFundRatio: number, limitUsd: number): FundStatus {
  const s = readJson<{ spent: number }>(spendPath(), { spent: 0 })
  s.spent += costUsd
  writeFileSync(spendPath(), JSON.stringify(s, null, 2))
  return status(apiFundRatio, limitUsd)
}

export function status(apiFundRatio = 0.8, limitUsd = 50): FundStatus {
  const e = readJson<{ earned: number }>(earningsPath(), { earned: 0 })
  const s = readJson<{ spent: number }>(spendPath(), { spent: 0 })
  const fundUsd = +(e.earned * apiFundRatio).toFixed(4)
  const devUsd = +(e.earned * (1 - apiFundRatio)).toFixed(4)
  const remainingUsd = +(Math.min(fundUsd - s.spent, limitUsd - s.spent)).toFixed(4)
  return {
    earnedUsd: e.earned,
    fundUsd,
    devUsd,
    spentUsd: s.spent,
    remainingUsd,
    blocked: remainingUsd <= 0,
    downgraded: s.spent >= limitUsd * 0.8,
  }
}

// DeepSeek cene $/1M tokena (chat; flash jeftiniji off-peak).
const RATES: Record<string, { input: number; output: number }> = {
  'deepseek/deepseek-chat': { input: 0.27, output: 1.1 },
  'deepseek/deepseek-reasoner': { input: 0.55, output: 2.19 },
}

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const r = RATES[model] ?? RATES['deepseek/deepseek-chat']
  return +(((inputTokens * r.input + outputTokens * r.output) / 1_000_000).toFixed(6))
}

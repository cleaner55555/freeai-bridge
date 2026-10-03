import type { Ad, AdProvider } from './types'

interface BuzzerAd {
  id: string
  title: string
  description: string
  url: string
  cpm?: number
  category?: string
  advertiser?: string
}

const DEMO_ADS: BuzzerAd[] = [
  { id: 'demo_1', title: 'Learn Web3 Development', description: 'Build decentralized apps with our free course. Join 50,000+ developers.', url: 'https://example.com/web3-course', cpm: 5.0 },
  { id: 'demo_2', title: 'Secure Your Crypto', description: 'Hardware wallets starting at $59. Protect your digital assets.', url: 'https://example.com/hardware-wallet', cpm: 8.0 },
  { id: 'demo_3', title: 'AI Tools for Developers', description: 'Boost your productivity with AI-powered coding assistants.', url: 'https://example.com/ai-tools', cpm: 6.5 },
]

function demoAd(context: string): Ad {
  const c = context.toLowerCase()
  const pick = c.includes('crypto') || c.includes('blockchain') || c.includes('web3')
    ? DEMO_ADS[1]
    : c.includes('ai') || c.includes('code') || c.includes('develop')
      ? DEMO_ADS[2]
      : DEMO_ADS[0]
  return { id: pick.id, title: pick.title, body: pick.description, url: pick.url, format: 'native' }
}

function toAd(raw: BuzzerAd, impressionId?: string): Ad | null {
  if (!raw?.id) return null
  return { id: raw.id, title: raw.title ?? '', body: raw.description ?? '', url: raw.url ?? '', format: 'native', impressionId }
}

export function createBuzzerProvider(opts: { publisherId: string; apiKey: string; baseUrl?: string }): AdProvider {
  const base = opts.baseUrl ?? process.env.BUZZER_API_URL ?? 'https://api.buzer.xyz'
  const authed = Boolean(opts.publisherId && opts.apiKey)
  const headers = {
    'content-type': 'application/json',
    'X-Publisher-ID': opts.publisherId,
    'X-API-Key': opts.apiKey,
  }

  return {
    async getAd(context: string) {
      if (!authed) return demoAd(context)
      const res = await fetch(`${base}/api/v1/ads/contextual`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ context, format: 'native' }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)
      if (!res || !res.ok) return demoAd(context)
      const data = (await res.json().catch(() => null)) as { ad?: BuzzerAd; impressionId?: string } | null
      return toAd(data?.ad as BuzzerAd, data?.impressionId) ?? demoAd(context)
    },

    async trackImpression(adId: string, impressionId: string) {
      if (!authed || adId.startsWith('demo_')) return { revenueUsd: 0 }
      const res = await fetch(`${base}/api/v1/tracking/impression`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ adId, impressionId }),
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)
      if (!res || !res.ok) return { revenueUsd: 0 }
      const data = (await res.json().catch(() => null)) as { earnedUsdc?: string } | null
      return { revenueUsd: Number(data?.earnedUsdc) || 0 }
    },

    async getEarnings() {
      if (!authed) return { totalUsd: 0 }
      const res = await fetch(`${base}/api/v1/publishers/${opts.publisherId}/earnings`, {
        headers: { 'X-API-Key': opts.apiKey },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null)
      if (!res || !res.ok) return { totalUsd: 0 }
      const data = (await res.json().catch(() => null)) as { lifetimeUsdc?: string; pendingUsdc?: string } | null
      return { totalUsd: Number(data?.lifetimeUsdc ?? data?.pendingUsdc) || 0 }
    },
  }
}

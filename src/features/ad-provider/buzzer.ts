import type { AdProvider } from './types'

// ponytail: fetch-based stub, bez novog dependency-ja. Pravi SDK kad krenu pare.
// Buzzer: 85% share, CPM $5-8, USDC isplata.
export function createBuzzerProvider(opts: { publisherId: string; apiKey: string }): AdProvider {
  const base = process.env.BUZZER_API_BASE ?? 'https://api.buzzer.example/v1'
  const headers = { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` }
  return {
    async getAd(context: string) {
      if (!opts.publisherId || !opts.apiKey) return null
      const res = await fetch(`${base}/ads/contextual`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ publisher_id: opts.publisherId, context, format: 'native' }),
      }).catch(() => null)
      if (!res || !res.ok) return null
      const j = (await res.json().catch(() => null)) as Record<string, string> | null
      if (!j?.id) return null
      return { id: j.id, title: j.title ?? '', body: j.body ?? '', url: j.url ?? '', format: 'native' }
    },
    async trackImpression(adId: string, impressionId: string) {
      const res = await fetch(`${base}/ads/impression`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ad_id: adId, impression_id: impressionId }),
      }).catch(() => null)
      const j = (await res?.json().catch(() => null)) as { revenue_usd?: number } | null
      return { revenueUsd: j?.revenue_usd ?? 0 }
    },
    async getEarnings() {
      const res = await fetch(`${base}/publishers/${opts.publisherId}/earnings`, { headers }).catch(() => null)
      const j = (await res?.json().catch(() => null)) as { total_usd?: number } | null
      return { totalUsd: j?.total_usd ?? 0 }
    },
  }
}

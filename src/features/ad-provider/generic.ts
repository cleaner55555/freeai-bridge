import type { AdProvider } from './types'

// ponytail: Prism/Kontext dele isti HTTP shape — jedan stub za oba dok ne izaberemo mrezu.
export function createGenericProvider(opts: { apiKey: string; botId: string }): AdProvider {
  const base = process.env.ADS_API_BASE ?? 'https://api.ads.example/v1'
  const headers = { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` }
  return {
    async getAd(context: string) {
      if (!opts.apiKey) return null
      const res = await fetch(`${base}/display`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ bot_id: opts.botId, topic: context.slice(0, 500), format: 'text' }),
      }).catch(() => null)
      if (!res || !res.ok) return null
      const j = (await res.json().catch(() => null)) as Record<string, string> | null
      if (!j?.id) return null
      return { id: j.id, title: j.title ?? '', body: j.body ?? '', url: j.url ?? '', format: 'text' }
    },
    async trackImpression(adId: string, impressionId: string) {
      await fetch(`${base}/impression`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ad_id: adId, impression_id: impressionId }),
      }).catch(() => null)
      return { revenueUsd: 0 }
    },
    async getEarnings() {
      return { totalUsd: 0 }
    },
  }
}

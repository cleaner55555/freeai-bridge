export interface Ad {
  id: string
  title: string
  body: string
  url: string
  format: 'native' | 'text' | 'banner'
}

export interface AdProvider {
  getAd(context: string): Promise<Ad | null>
  trackImpression(adId: string, impressionId: string): Promise<{ revenueUsd: number }>
  getEarnings(): Promise<{ totalUsd: number }>
}

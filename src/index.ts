import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { Config } from './config'
import type { Config as ConfigShape } from './config'
import { createAdProvider } from './features/ad-provider/index'
import { recordRevenue, status } from './features/budget-manager/index'

export const name = 'dsh-freeai-bridge'
export const inject = ['tools']

export { Config }

/** Pure builder ostaje za keyless testove. */
export function buildStatusLine(fundUsd: number, remainingUsd: number): string {
  return `fond $${fundUsd.toFixed(2)} / preostalo $${remainingUsd.toFixed(2)}`
}

export function apply(ctx: Context, config: ConfigShape): void {
  if (!config.enabled) return
  const provider = createAdProvider(config.provider, {
    publisherId: process.env.FREEAI_PUBLISHER_ID ?? config.publisherId,
    apiKey: process.env.FREEAI_ADS_KEY ?? config.apiKey,
  })

  ctx.tools.register(
    defineTool({
      name: 'freeai-bridge_status',
      description: 'Prikazi stanje fonda: zarada od reklama, fond za AI, potrosnja.',
      parameters: {},
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      async execute() {
        const st = status(config.apiFundRatio, config.limitUsd)
        return (
          `Zarada: $${st.earnedUsd.toFixed(2)} | Fond: $${st.fundUsd.toFixed(2)} ` +
          `| Potroseno: $${st.spentUsd.toFixed(2)} | Preostalo: $${st.remainingUsd.toFixed(2)}` +
          (st.blocked ? ' | BLOKIRANO' : '')
        )
      },
    }),
  )

  ctx.tools.register(
    defineTool({
      name: 'freeai-bridge_ad',
      description: 'Uzmi kontekstualnu reklamu i evidentiraj prihod.',
      parameters: {
        context: { type: 'string', required: true, description: 'Kontekst (zadnja user poruka).' },
      },
      output: {
        schema: { type: 'string' },
        render: (_args, value) => [{ type: 'text', text: value }],
      },
      async execute(args) {
        const ad = await provider.getAd(args.context)
        if (!ad) return 'Sponsored: —'
        const imp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        const { revenueUsd } = await provider.trackImpression(ad.id, imp).catch(() => ({ revenueUsd: 0 }))
        if (revenueUsd > 0) recordRevenue(revenueUsd, config.apiFundRatio)
        return `Sponsored: ${ad.title} — ${ad.body} (${ad.url})`
      },
    }),
  )
}

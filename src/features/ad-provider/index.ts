import { createBuzzerProvider } from './buzzer'
import { createGenericProvider } from './generic'
import type { AdProvider } from './types'

export type * from './types'

export function createAdProvider(kind: string, opts: { publisherId: string; apiKey: string }): AdProvider {
  if (kind === 'buzzer') return createBuzzerProvider(opts)
  return createGenericProvider({ apiKey: opts.apiKey, botId: opts.publisherId })
}

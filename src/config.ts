import Schema from '@deepseek-ai/schemastery'

// FreeAI Bridge konfiguracija — sve promenljivo iz cordis.yml bez editovanja koda.
export interface Config {
  enabled: boolean
  publisherId: string
  apiKey: string
  provider: string
  apiFundRatio: number
  limitUsd: number
  period: string
  downgradeModel: string
}

export const Config: Schema<Config> = Schema.object({
  enabled: Schema.boolean().default(false).description('Ukljuci besplatni AI (reklame).'),
  publisherId: Schema.string().default('').description('Publisher ID kod ad mreze.'),
  apiKey: Schema.string().default('').description('API kljuc ad mreze (env OVERRIDE preporucen).'),
  provider: Schema.string().default('buzzer').description('Ad provider: buzzer | kontext | prism.'),
  apiFundRatio: Schema.number().default(0.8).description('Deo prihoda za DeepSeek fond (0-1); ostatak ide razvoju.'),
  limitUsd: Schema.number().default(50).description('Mesecni hard cap potrosnje u USD.'),
  period: Schema.string().default('monthly').description('Budzet period: monthly | weekly | daily.'),
  downgradeModel: Schema.string().default('deepseek/deepseek-chat').description('Model na 80% potrosnje.'),
})

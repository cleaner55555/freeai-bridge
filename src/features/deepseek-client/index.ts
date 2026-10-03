import { estimateCost, recordSpend, status } from '../budget-manager/index'

// ponytail: gate pre svakog llm poziva. Fond=0 -> blokiraj sa porukom.
export async function gatedDeepSeekCall(opts: {
  model: string
  apiKey: string
  messages: Array<{ role: string; content: string }>
  apiFundRatio: number
  limitUsd: number
  downgradeModel: string
}): Promise<{ text: string; costUsd: number; model: string }> {
  const st = status(opts.apiFundRatio, opts.limitUsd)
  if (st.blocked) throw new Error('Reklame nisu generisale dovoljno prihoda — AI pauziran.')
  const model = st.downgraded ? opts.downgradeModel : opts.model
  const base = process.env.DEEPSEEK_API_BASE ?? 'https://api.deepseek.com/v1'
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${opts.apiKey}` },
    body: JSON.stringify({ model, messages: opts.messages, stream: false }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}`)
  const j = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  const text = j.choices?.[0]?.message?.content ?? ''
  const cost = estimateCost(model, j.usage?.prompt_tokens ?? 0, j.usage?.completion_tokens ?? 0)
  recordSpend(cost, opts.apiFundRatio, opts.limitUsd)
  return { text, costUsd: cost, model }
}

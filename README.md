# dsh-freeai-bridge — FreeAI Bridge

Reklame u DSH → prihod → DeepSeek fond. Korisnik ne plaća dok fond traje.
Podela: 85% fond (default, podesivo), 15% razvoj.

## Install

```sh
pnpm install
pnpm run build
pnpm pack
dsh plugin --profile web add ./dsh-freeai-bridge-0.1.0.tgz
```

## Config (cordis.yml)

```yaml
dsh-freeai-bridge:
  enabled: true
  provider: buzzer
  publisherId: "..."   # ili env FREEAI_PUBLISHER_ID
  apiKey: "..."        # ili env FREEAI_ADS_KEY
  apiFundRatio: 0.85
  limitUsd: 50
  period: monthly
  downgradeModel: deepseek/deepseek-chat
```

Env override (preporučeno za ključeve): `FREEAI_PUBLISHER_ID`, `FREEAI_ADS_KEY`, `DEEPSEEK_API_KEY`.

## Alati

- `freeai-bridge_status` — zarada / fond / potrošnja / preostalo
- `freeai-bridge_ad` — kontekstualna reklama + `trackImpression` → prihod u `~/.dsh/freeai-bridge/earnings.json`

Fond=0 → pozivi blokirani uz poruku. 80% limita → auto-downgrade.

## Dev

```sh
pnpm run typecheck
pnpm test
pnpm run build
```

Skipped: serverless auto-recharge (Vercel/Workers webhook) — dodati kad prihod krene.

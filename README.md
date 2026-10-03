# dsh-freeai-bridge — FreeAI Bridge

Reklame u DSH → prihod → DeepSeek fond. Korisnik ne plaća dok fond traje.
Podela: 80% fond (default, podesivo), 20% razvoj.

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
  apiFundRatio: 0.8
  limitUsd: 50
  period: monthly
  downgradeModel: deepseek/deepseek-chat
```

Env override (preporučeno za ključeve): `FREEAI_PUBLISHER_ID`, `FREEAI_ADS_KEY`, `DEEPSEEK_API_KEY`.

## Buzzer ključevi — svoji, po korisniku

Svaki korisnik koristi SVOJ Buzzer publisher nalog. Zarada ide na njegov wallet, on sam kupuje DeepSeek kredit. Plugin samo meri da li zarada pokriva potrošnju.

1. Registruj se na [buzzernetwork.com/publishers](https://buzzernetwork.com/publishers)
2. Poveži wallet (USDC isplata)
3. Iz dashboarda uzmi Publisher ID i API Key
4. Ubaci u config ili env:

```yaml
dsh-freeai-bridge:
  enabled: true
  publisherId: "tvoj_publisher_id"
  apiKey: "tvoj_api_key"
```

```sh
export BUZZER_PUBLISHER_ID=tvoj_publisher_id
export BUZZER_API_KEY=tvoj_api_key
```

Bez ključeva plugin radi u demo režimu (primer reklame, prihod 0 — ne upisuje se u fond).

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

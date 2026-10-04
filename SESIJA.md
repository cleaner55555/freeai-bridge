# SESIJA — FreeAI Bridge (2026-10-04)

## Cilj
DSH plugin koji prikazuje reklame, prihod usmerava u DeepSeek fond. Korisnik ne plaća dok fond traje.

## Urađeno

### 1. Scaffold
- `npx dsh-plugin-guide new freeai-bridge --lang ts --dir ./freeai-bridge` (binarka se zove `dsh-plugin-dev`, paket `dsh-plugin-guide`)
- Lokacija: `/Users/cleaner55555/freeai-bridge`, paket `dsh-freeai-bridge@0.1.0`

### 2. Features (sve u `src/`)
- `features/ad-provider/` — `types.ts` (Ad + impressionId), `buzzer.ts` (PRAVI API, ne stub), `generic.ts` (prism/kontext stub), `index.ts` (fabrika)
- `features/budget-manager/` — `earnings.json` / `spend.json` u `~/.dsh/freeai-bridge/`, `status()`, `estimateCost()`, block na 0, downgrade na 80%
- `features/deepseek-client/` — `gatedDeepSeekCall()` (gate pre poziva)
- `src/index.ts` — alati `freeai-bridge_status` i `freeai-bridge_ad`
- `client/features/ad-display/` — Sponsored slot stub
- `src/config.ts` — enabled, provider, publisherId, apiKey, apiFundRatio **0.8**, limitUsd 50, period, downgradeModel

### 3. Buzzer integracija (istraženo iz `buzzer-ads-mcp@1.0.0`, yogeba/buzz-network)
- Base: `https://api.buzer.xyz` (env `BUZZER_API_URL`)
- Auth: headeri `X-Publisher-ID` + `X-API-Key`
- `POST /api/v1/ads/contextual` `{context, format}` → `{ad, impressionId}`
- `POST /api/v1/tracking/impression` `{adId, impressionId}` → `{earnedUsdc}`
- `GET /api/v1/publishers/{id}/earnings` → `{lifetimeUsdc, pendingUsdc, ...}`
- Fetch timeout 8s, nikad throw iz providera (null / 0)
- Demo režim bez ključeva: primer reklame, prihod 0 (ne upisuje se u fond)
- Env prioritet: `BUZZER_*` → `FREEAI_*` → config

### 4. GitHub
- Repo: https://github.com/cleaner55555/freeai-bridge (public)
- Commiti: scaffold/MVP → prava Buzzer integracija (`a1c0a53`) → split 80/20 (`44a4d84`)

### 5. DSH `web` profil
- Instaliran `dsh-freeai-bridge@0.1.0`, dodat u `bundles`
- `cordis.patch.yml` profila: `enabled: true`, provider buzzer, fond 80%, limit $50
- `dsh --profile web --dump-config` čist

## Odluke
- **Svoji ključevi po korisniku**, ne zajednička mreža (tuđi DeepSeek se ne može dopuniti; redistribucija = backend + poverenje + porez).
- **Split 80% fond / 20% razvoj.** Pošteno: sa svačijim svojim ključevima 20% je evidencija u statusu, ne automatski transfer. Pravi priliv ide preko referrala/dogovora.
- Korisnik otvara Buzzer nalog sam (email + wallet potpis + uslovi); ime: Dejan Silbaski.

## Zamke (za ubuduće)
- `dsh plugin` koristi ugrađeni pnpm 9 (store v3); profil je pravljen pnpm 11 (store v11) → za add koristiti `/Users/cleaner55555/Library/pnpm/pnpm` (11.7.0).
- `pnpm add` ne zameni isti tgz dvaput → `remove` + `add`.
- `git commit`/`push`/`pack` NE u jednom `&&` lancu (wrapper blokira) → korak po korak.
- Verifikacija bez pnpm wrappera: `./node_modules/.bin/tsc --noEmit`, `vitest run`, `tsdown`.
- `timeout` ne postoji na macOS.

## Sledeće
1. Korisnik: nalog na buzzernetwork.com/publishers → Publisher ID + API Key.
2. Ja: upis ključeva (env/config) + provera kroz `freeai-bridge_status` / `freeai-bridge_ad`.
3. Opciono: pravi UI slot u Web UI, auto-recharge backend, referral za dev 20%.

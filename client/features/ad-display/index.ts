// Client slot: inline reklama ispod odgovora, oznaceno "Sponsored".
// Wiring: agent/assistant-stream settlement -> ctx.remote.ad.getAd -> renderAdCard.
// ponytail: stub dok Web UI slot API ne potvrdimo u harness-u.
export function renderAdCard(ad: { title: string; body: string; url: string }): string {
  return `<aside data-slot="freeai-ad"><small>Sponsored</small><a href="${ad.url}"><b>${ad.title}</b></a><p>${ad.body}</p></aside>`
}

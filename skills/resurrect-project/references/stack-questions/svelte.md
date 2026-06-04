# Stack questions — Svelte / SvelteKit projects

Use during Phase 3 (Architect) when the surveyed project uses Svelte or SvelteKit.

The chatr.tech resurrection (2026-05-22) is the worked example informing these questions.

## Pre-conditions

Confirm these from the Phase 1 survey before asking:

- Which Svelte version (3 / 4 / 5)?
- Which SvelteKit version (1 / 2)?
- TypeScript or plain JS?
- Adapter (`adapter-vercel`, `adapter-node`, `adapter-cloudflare`, `adapter-static`, `adapter-auto`)?
- Has SSR / does it stream / does it have an admin area?

## Question library (ask one at a time)

### Framework version

> Svelte ecosystem moves fast. You're on Svelte `<N>` / SvelteKit `<N>`. Today's defaults are Svelte 5 / SvelteKit 2.
>
> - **Jump to current.** Full rewrite of any code that touches Svelte's reactive primitives (`$:` → runes, `<svelte:component>` removed, etc.). Most idiomatic going forward.
> - **Stay on current major.** Less churn, but you'll be migrating again in 12 months.
> - **Pin to historical version.** Only viable for time-capsule motion.

### Adapter / hosting

> Existing adapter: `<adapter-name>`.
>
> - **Cloudflare** — best for streaming / edge / global; cheap; pairs well with DNS already on CF.
> - **Vercel** — best for Next-style team workflows; more expensive at scale; preview deploys built-in.
> - **Node (self-hosted)** — most flexibility; most ops cost.
> - **Static (`adapter-static`)** — only if no server routes.

### LLM / external API (if applicable)

> Existing integration: `<openai|anthropic|other>` SDK version `<N>`.
>
> - **Single-provider, current SDK.** Simplest. Lock in to one vendor.
> - **Provider abstraction.** A thin interface with multiple providers (e.g. Claude default, OpenAI fallback). More code, more flexibility, future-proof against rate-limit / cost / quality shifts.
> - **Provider abstraction with streaming parity.** Hardest — providers' streaming protocols differ enough that a unified streaming interface takes real work.

### CMS / data layer

> Existing data layer: `<sanity|prisma|contentful|local-json|other>`.
>
> Patterns worth weighing:
>
> - **JSON / markdown in the repo, edited via Claude Code.** Lowest ops cost. Best when content volume is small and editors are technical.
> - **Sanity / Contentful / hosted CMS.** Best when non-technical editors need a UI.
> - **Database (Postgres / Turso / D1).** Best when data is relational and queried frequently.
>
> A CMS that was right in 2023 may be wrong in 2026 — the chatr.tech case dropped Sanity in favor of in-repo JSON.

### Build / tooling

> Existing: Vite `<N>`, TypeScript `<N>`.
>
> - **Bump to current.** Almost always the right call; build tooling rarely has migration drama.
> - **Stay on existing.** Only if pinning to a frozen artifact.

### Streaming / SSE / WebSockets

> If the original used `sse.js`, Vercel Edge functions, or custom WebSocket handling: today's defaults are different.
>
> - **SvelteKit's `+server.ts` with `ReadableStream`.** Native. Recommended.
> - **Hono / Elysia / standalone API layer.** If you want the API portable to other frontends.
> - **Edge functions specifically.** Cloudflare Workers / Vercel Edge / Netlify Edge — adapter-specific.

### Auth / user accounts (if applicable)

> If the project had auth:
>
> - **Auth.js / Lucia / Clerk / Supabase Auth** — pick based on integration surface.
> - **No auth (single-user).** Often the right choice for a personal-use revival.

### State management

> If the original had complex state:
>
> - **Svelte 5 runes only.** Most reactive code is now component-local; minimal global state.
> - **Stores (`writable` / `readable`).** Still supported; right for cross-component state.
> - **Third-party (`zustand-svelte`, etc.).** Rarely needed.

## Question NOT to ask

- "What styling solution?" — usually irrelevant; CSS/Tailwind/UnoCSS choices don't change architecture.
- "Tests?" — Phase 4's "open / next" can include this; not architecture.
- "Linter / formatter?" — same. ESLint + Prettier are defaults; not worth interview time.

## Chatr.tech decisions (reference)

The chatr.tech resurrection landed these in roughly 15 minutes of interview:

1. **Provider abstraction** — Claude + OpenAI behind one interface (provider abstraction with streaming parity)
2. **No CMS** — JSON in the repo, edited via Claude Code
3. **Cloudflare adapter** — swap `adapter-vercel` → `adapter-cloudflare`
4. **Aggressive modernization** — Svelte 5 / SvelteKit 2 / TS 5 / current SDKs; fork-and-rewrite, not migrate

These are the *output shape* this question library is designed to produce — 4 atomic decisions, each citing a trade-off, none overlapping.

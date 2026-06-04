# Project page template

This is the **target output shape** of a resurrection. Phase 4 produces a file in this shape (adapted to host wiki conventions if a host is present).

## Frontmatter (base)

```yaml
---
title: <human title>
type: project
status: <see vocabulary.md cascade table>
tags: [<2-5 relevant tags>]
sources: [<source files if any — frontmatter wiki-links if the host uses Obsidian>]
updated: <today, YYYY-MM-DD>
---
```

Host-specific frontmatter extensions (only if the host CLAUDE.md or schema requires them) go below the base fields.

## Body sections

In order. Omit any section that has no content — don't leave empty headers.

### 1. Context paragraph (no header)

One paragraph immediately under the H1. Answers:

- What is it? (1 sentence)
- When was it last touched? (with date)
- What's the current deployment state? (with verification level — "live," "down," "[unverified]")

Example:

> Bring [[chatr.tech]] back online. The site was a Slack-style multi-bot chat UI I built in ~2023–2024, last touched **2024-03-21**. Code still exists on GitHub; nothing is deployed today (Cloudflare zone shows **0 unique visitors / 30d**).

### 2. `## Stack as it stood`

Bullet list of major techs with versions where known. Sourced from Phase 1 survey output.

Example:

```
- **Web app:** [[brandtam-sk-chatr]] — SvelteKit 1.x, Svelte 3, TS 4.9, Vite 4. Uses `openai` SDK v3...
- **CMS:** [[brandtam-sanity-chatrbots]] — Sanity v3 studio...
- **LLM:** OpenAI GPT-4 via Vercel Edge functions...
- **Hosting:** Vercel (per README) — deployment status [unverified].
```

Tone: factual, historical. Use `[unverified]` for inferred-not-confirmed facts.

### 3. `## Sibling: <related>` (optional)

If Phase 1 surfaced related repos that are *not* part of this resurrection — call them out as siblings, with a one-line note on why they're scope-excluded.

Example from chatr.tech:

> [[brandtam-sk-chatr-bot]] (last push **2023-03-08**) is a simpler, earlier ancestor — single chatbot with mood selection, README titled "ChatrBot.ai" → maps to [[chatrbot.ai]]. Not part of this resurrection unless I decide to revive both.

### 4. `## Reflection (<date>)`

From Phase 2 outputs. Compact:

```
- **Original intent:** <1 sentence>
- **Why it stalled:** <1 sentence>
- **Why now:** <1 sentence>
- **Motion:** <named — link to vocabulary.md if host doesn't have its own>
```

This section is **the user's own historical record of the decision to resurrect**. Don't paraphrase — use their words where possible.

### 5. `## Decisions (<date>)`

Numbered list from Phase 3 output. Each decision is atomic:

```
N. **<short title>** — <outcome>. <1–3 sentence rationale>. <Cross-links>.
```

Skip this section entirely if the motion was "time capsule" or "archive."

### 6. `## Open / next`

Concrete next steps. Each item is something with a clear "done" state:

- "Pick a rewrite branch name on [[<repo>]] (`v2`, `rewrite`, `cloudflare`, …) and scaffold it."
- "Confirm Anthropic API key in local env."
- "Decide whether feature X carries forward."

Do NOT use this section for:
- Things that are already decisions (those belong in §5)
- Things that aren't really blockers (those go to host wiki's TODO if applicable)

### 7. `## Related`

Cross-references to other wiki pages that aren't repos/CMS/etc. — domains, account pages, cluster siblings, the website page if separate from the project.

```
- Site (currently down): [[<website-slug>]]
- Domain: [[<domain>]]
- Cluster siblings (not in scope yet): [[<sibling-1>]], [[<sibling-2>]]
```

## Adaptation notes

- **Host with wiki-link convention** → use `[[basename]]` throughout.
- **Host with markdown-link convention** → use `[text](path)` throughout. Same content, different syntax.
- **No host** → drop the wiki-links; use plain text or external URLs only. The cross-link semantics still belong in the prose ("the related repo is at github.com/…").

## Length target

A finished project page should fit on one screen of scroll in Obsidian (or ~50–80 markdown lines). If it's longer, sections are bloating. Tighten or move detail into linked pages.

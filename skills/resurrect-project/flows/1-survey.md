# Phase 1 — Survey

Goal: build a factual picture of what the project *was*, with zero assumptions about what it *is*. The output of this phase is historical signal, not current truth.

**Critical rule:** everything you read in this phase is **history**. The README from 2023 was true in 2023. The package.json shows what was depended on; it does not show what works. Treat every file as a primary source from a specific date.

## Inputs

You need at least one of:

- A local clone of the repo
- A GitHub URL the user can clone for you (use `gh repo clone <owner>/<name>`)
- Just a name + rough description (less common — push for at least a URL)

## Host project detection (run once, at the start)

From the user's current working directory, before changing directories:

```
ls CLAUDE.md projects/ log.md 2>/dev/null
```

Hold the result. Phase 4 will use it.

## What to read

In rough priority order — stop early if the picture is clear:

1. **README** — the canonical historical intent. Note its `last modified` date; assume nothing it says is still true.
2. **package.json / pyproject.toml / Gemfile / go.mod / etc.** — what was depended on. Note the package manager itself; some are deprecated.
3. **The lockfile** — exact versions at last install. Compare key deps to today's versions (mentally — don't query npm).
4. **`.env.example` / `wrangler.toml` / `vercel.json` / `netlify.toml` / etc.** — deployment assumptions. What service was this supposed to run on?
5. **Top-level config files** — `tsconfig.json`, `svelte.config.js`, `next.config.js`, `astro.config.mjs` — these encode framework version assumptions.
6. **The last 10–20 commits** — `git log --oneline -20`. What was the user working on when they stopped? Was there a half-finished branch?
7. **Open issues / TODOs in code** — `grep -nE 'TODO|FIXME|XXX|HACK' -r src/` (or the source dir). These are the user's own future-self notes.
8. **The file tree** — `find . -type f -name '*.{md,ts,tsx,js,jsx,py,rb,go,rs,svelte}' | head -50`. Just to see the shape.

## What NOT to do

- **Don't run the code.** Surveying is read-only. If the user wants to see if it still runs, that's a separate explicit step they should decide on.
- **Don't update dependencies.** That's Phase 3+, conditional on motion.
- **Don't infer current state from past state.** "It used GPT-4 via Vercel Edge" tells you nothing about whether the OpenAI API key still works or whether the Vercel project still exists.
- **Don't make up information.** If the README doesn't say what hosting was used, say "[unverified]" — don't guess from the config files unless the inference is direct.

## Output of this phase

A factual summary you can hold in working memory through Phase 2, structured as:

- **What it was** — 1–2 sentences distilled from the README
- **Stack as it stood** — bullet list of major techs with versions where known. Use the `templates/project-page.md` "Stack as it stood" block as the target shape.
- **Last activity** — date of last commit, what the commit was about (especially: was it a feature, a bugfix, or "wip" / "test" / "tmp")
- **Known unknowns** — list things the survey couldn't determine. E.g.:
  - "Hosting platform: README says Vercel, but no `vercel.json`. Unverified."
  - "External dependencies: Sanity project `<id>` — existence unverified."
  - "Secrets required: OpenAI API key, possibly more — `.env.example` lists 3 vars."
  - "Last commit was `wip: trying X` — the codebase may be in an in-progress state."

Hand this off to Phase 2 mentally. **Do not write the project page yet.**

## Multi-repo surveys

Sometimes a project spans multiple repos (a frontend + a CMS + a worker). If the survey finds references to sibling repos:

- Note them. Don't clone unless the user explicitly authorizes — could be a long list.
- If 2+ are clearly load-bearing, mention them in the Phase 2 transition: "before we reflect, do you want to survey the related [[X]] repo too, or is this one the heart?"

This was the chatr.tech case — 3 candidate repos (`sk-chatr`, `sanity-chatrbots`, `sk-chatr-bot`). Phase 1 cloned all three; Phase 2 determined that `sk-chatr-bot` was actually a different project (`chatrbot.ai`), not part of the chatr.tech resurrection.

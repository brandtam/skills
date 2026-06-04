# Stack questions — generic fallback

Use during Phase 3 (Architect) when the surveyed project uses a stack we don't have a dedicated question file for yet.

This is a starting point, not a substitute for stack-specific depth. When you finish a resurrection with this file, **offer to extract a stack-specific file** for next time — it's cheap to write while the questions are fresh.

## Question library (ask one at a time)

### Language / runtime version

> The project is on `<language>` `<version>`. Today's current is `<version>`.
>
> - **Jump to current.** Idiomatic, but expect breaking changes across major versions.
> - **Stay on existing major.** Less churn, more debt.
> - **Pin to historical version.** Time-capsule only.

### Framework / framework version (if any)

> Existing: `<framework>` `<version>`.
>
> - Same three options as language version: jump, stay-on-major, or pin.
> - Add: **swap framework entirely** if the original choice is questioned in Phase 2.

### Dependency posture

> Big dependencies on: `<list main ones from package manifest>`.
>
> - **Bump all to current.** Default for "ongoing use" motions.
> - **Bump selectively.** Some libraries are notorious for breaking changes; pick which to pin.
> - **Replace specific ones.** If a dep is unmaintained or has a clearly-better successor.

### External services

> External services referenced: `<list from configs / env.example>`.
>
> For each:
> - **Keep using it.** Confirm account still exists, key still works.
> - **Replace with alternative.** Cost / quality / reliability shift since the original choice.
> - **Drop entirely.** Self-host the function or remove the feature.

### Data layer (if applicable)

> Existing: `<database / CMS / file-based>`.
>
> See `svelte.md` data-layer section — the trade-offs are stack-agnostic.

### Hosting / deployment

> Existing: `<platform>`.
>
> - Same as for any stack — Cloudflare / Vercel / Netlify / Fly / self-hosted / etc.
> - Stack constraints matter (some platforms support some runtimes only).

### Auth (if applicable)

Same question shape as `svelte.md`.

### Testing strategy

> Existing: `<framework / none>`.
>
> If the user wants this to be ongoing-use, ask: are tests in scope for the rewrite, or deferred?
>
> Defer is fine — but explicit defer beats implicit defer.

## Extending this skill

If you finish a resurrection that used this file, suggest extracting a stack-specific file at the end:

> "We just resurrected a `<stack>` project using the generic question file. Want to extract `<stack>.md` from this conversation so the next `<stack>` resurrection is sharper?"

If the user agrees, write `~/.claude/skills/resurrect-project/references/stack-questions/<stack>.md` modeled on `svelte.md`'s structure.

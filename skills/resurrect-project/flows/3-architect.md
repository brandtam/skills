# Phase 3 — Architect

**Conditional phase.** What happens here depends entirely on the motion decision from Phase 2.

## Branch by motion

### If motion is "archive"

Skip this phase entirely. Go to Phase 4 and write an archive note.

### If motion is "time capsule"

Ask one question only:

> What's the minimum change needed to unblock this? List the specific deprecated/broken bits. We'll patch only those.

Capture the minimum-patch list. Do not ask about hosting changes, modernization paths, or framework jumps. Go to Phase 4 with this list as the "next concrete step."

### If motion is "resurrect (migrate)"

Ask normal migration questions, but **stay in the existing architecture's shape**. The user has committed to migrating, not rewriting.

- "These deps are deprecated: X, Y, Z. Bump each to current? Or pin some?"
- "Framework version X is N major versions behind. Migrate incrementally (X→X+1→…) or jump?"
- "Any abstractions that *must* survive intact? (E.g. a data shape with persisted records.)"

### If motion is "fork-and-rewrite" or "fresh start"

Full architecture interview. Pull the stack-specific question file:

```
~/.claude/skills/resurrect-project/references/stack-questions/<stack>.md
```

Available stacks at v1:
- `svelte.md` — Svelte / SvelteKit projects (deep coverage from chatr.tech)
- `_generic.md` — fallback for unknown stacks

If the project is a stack we don't have a file for yet, use `_generic.md` and offer to start a new stack file at the end of the resurrection (TODO follow-up).

## How to ask

- **One decision at a time.** Don't list five questions. Wait for the user to land on each.
- **Cite the historical state.** "It used `@sveltejs/adapter-vercel` 2.x — keep Vercel, switch to Cloudflare, or other?" The historical state isn't an answer; it's a starting point for the conversation.
- **Surface trade-offs.** Don't ask "which framework?" without naming the trade-offs of each.
- **Note constraints from Phase 2.** If the user said "I want this on Cloudflare" earlier, don't re-ask hosting — confirm and move on.
- **Capture decisions as you go.** Each landed decision becomes a numbered entry for the project page. Format per `templates/project-page.md` "Decisions" block.

## Decision capture format

Each decision is:

```
N. **<short title>** — <one-sentence outcome>. <Rationale, 1–3 sentences>. <Cross-links to memory files or wiki pages if relevant>.
```

Example from chatr.tech:

```
1. **LLM provider — config-selectable.** A config file picks between Claude (Anthropic) (default) and OpenAI. Both providers sit behind a single streaming-chat interface.
```

Keep decisions atomic. A decision that needs sub-bullets is probably two decisions in a trench coat — split it.

## Open / next

End Phase 3 with a **short list of "open / next"** items — things that came up during the interview but weren't fully resolved. Examples:

- "Pick a rewrite branch name (`v2`, `rewrite`, `cloudflare`, …)"
- "Confirm OpenAI account access; key may have rotated"
- "Decide if X feature carries forward or is dropped"

These feed Phase 4's "Open / next" block on the project page.

## When to stop

Phase 3 ends when:

- All blocking architectural questions are answered, OR
- The user is in "let me think about it" mode on the remaining ones

Don't over-interview. A project page with 4 strong decisions and 2 open items is better than one with 8 wishy-washy decisions and zero open items.

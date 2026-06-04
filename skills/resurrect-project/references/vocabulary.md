# Vocabulary

The single most important file in this skill. Resurrection conversations go wrong when "resurrect," "rewrite," and "rebuild" are used interchangeably — they're different motions with different costs, different success criteria, and different scaffolding.

## Primary spectrum: time capsule ↔ ongoing use

The motion check in Phase 2 lands somewhere on this spectrum. Everything else cascades from it.

### Time capsule

> "Make the existing code run again, with minimum changes. I want to use this thing, not evolve it."

- **What changes:** only what blocks the code from running today (deprecated SDK versions, expired dependencies, broken auth).
- **What stays:** architecture, abstractions, naming, the whole shape of the codebase.
- **Effort:** hours to a day.
- **Output:** a functional artifact, frozen-in-time.
- **Risk:** the patches you make to unblock it accumulate as tech debt for anyone (including future-you) who eventually wants to evolve it.
- **Project page `status`:** `archived` with a clear note that it was unblocked but not modernized.

### Ongoing use

> "I want to use this as a foundation for continued work."

The "ongoing use" end of the spectrum has three fine-grained variants. Pick one explicitly:

#### Resurrect (migrate)

> "Bring the existing code forward through normal migration."

- Each deprecated dependency gets bumped, each broken abstraction gets refactored in place.
- The code's identity persists; the git history persists.
- **Effort:** days to weeks depending on how stale.
- **Risk:** you migrate a lot of yesterday's assumptions into today's code.
- **Project page `status`:** `active`.

#### Fork-and-rewrite

> "Existing code is reference, not migration base. New branch built fresh against current best practices."

- The existing branch becomes a *reference* — a working specification of what the thing did and how — but is not the starting point for code.
- The new branch can borrow ideas, copy-paste specific algorithms, mimic UX moments — but doesn't carry the structural debt.
- **Effort:** weeks (faster than fresh-start because the reference exists).
- **Risk:** drift from the original intent; over-reinvention.
- **Project page `status`:** `active`. Old branch tagged or noted as reference-only.
- **Most common motion for code older than ~18 months in a fast-moving stack.**

#### Fresh start

> "Keep the idea. Throw the code away. Rebuild from zero."

- The repo may stay (renamed/branched) or get archived.
- The previous codebase serves only as historical context.
- **Effort:** full project effort.
- **Risk:** lose the lessons embedded in the old code.
- **Project page `status`:** `active` on a new project page. Old codebase referenced as historical only.
- **Use when:** the original assumptions were so wrong (or the stack so different) that even the structure can't be salvaged.

### Archive

> "The right answer sometimes."

- Don't revive. Document what it was, why you're stopping, what you learned.
- This is a *valid output* of Phase 2. The skill should not push past it.
- **Project page `status`:** `archived` with reasoning.

## Anti-patterns

- **"Let's just modernize it"** — vague; doesn't pick a motion. Force a specific term.
- **"Resurrect" used to mean "fresh start"** — these are opposite ends. Confusing them produces architecture decisions that don't match the effort the user is willing to invest.
- **Skipping the motion check because the user "obviously wants to rebuild"** — they may not. Often the right answer is time capsule or archive; the skill's job is to make that visible.
- **Picking a motion implicitly through Phase 3 questions** — happens when the architect phase starts before Phase 2 lands a decision. The result is a Frankenstein motion that costs more and delivers less.

## Cascade

The motion determines:

| Decision | Time capsule | Resurrect | Fork-and-rewrite | Fresh start | Archive |
|---|---|---|---|---|---|
| Phase 3 depth | "least change to unblock" only | normal migration questions | full architecture interview | full architecture interview | skipped |
| Phase 4 scaffolding | minimal | project page + migration plan | project page + rewrite-branch plan | new project page | archive note |
| Project page `status:` | `archived` (note) | `active` | `active` | `active` | `archived` (reasoning) |
| Old code's role | running artifact | migration base | reference only | historical only | preserved as-is |
| Effort budget | hours | days–weeks | weeks | weeks–months | minutes |

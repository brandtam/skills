---
name: resurrect-project
description: Investigate and revive a dormant code project — survey existing code as historical signal, interview the user on today's architectural intent, capture decisions, then scaffold a project page and a rewrite plan. Use when the user says "resurrect", "revive", "bring back", "rebuild", or "modernize" an old or dormant code project, references picking up an abandoned codebase, or asks to plan a rewrite of something that already exists. Adapts to host project — conforms to a wiki schema if one is present (CLAUDE.md + projects/ folder + log.md), otherwise emits portable markdown.
license: MIT
metadata:
  version: "0.1.0"
---

# resurrect-project

Help the user revive a dormant code project — *with intention*. The risk in resurrection is migrating yesterday's assumptions into today's rewrite; this skill's job is to interrupt that, force a fresh architectural conversation, and only then scaffold.

## Quick start

Four phases, run in order. Each phase has a dedicated flow file with full detail; pull the file in only when entering that phase.

1. **Survey** ([flows/1-survey.md](flows/1-survey.md)) — read READMEs, package.json/pyproject.toml/Gemfile, last commits, deploy configs. Treat all of this as **historical signal**, not current fact. Surface what the project *was*, then explicitly question whether any of it still applies.

2. **Reflect** ([flows/2-reflect.md](flows/2-reflect.md)) — *before* the architecture conversation, ask the harder questions: what was the original intent, did it ever work, why did it stall, what would you change, why pick it up now, and crucially **time-capsule vs ongoing use** (motion check). This phase determines whether Phase 3 happens in full, in part, or at all.

3. **Architect** ([flows/3-architect.md](flows/3-architect.md)) — *only if* Phase 2 lands on "ongoing use" (or stronger). Today's stack decisions. Use the stack-specific question file under [references/stack-questions/](references/stack-questions/); for unknown stacks fall back to [_generic.md](references/stack-questions/_generic.md). If Phase 2 landed on "time capsule," skip to the minimal "what's the least change to unblock it?" question only.

4. **Scaffold** ([flows/4-scaffold.md](flows/4-scaffold.md)) — write a project page (in the host wiki if one exists, otherwise standalone), cross-link to repos/domains/related work, append a `log.md` entry if the host has one, and end with a clear "next concrete step."

## Vocabulary check

The motion check happens in Phase 2 (Reflect), but the vocabulary is the skill's foundation — see [references/vocabulary.md](references/vocabulary.md). These are not synonyms:

**Primary spectrum (set during Phase 2):**

- **Time capsule** — make the existing code run again. Minimum-viable unblock of deprecated bits. Output: "I can use this thing again." Not "this thing is ready to evolve."
- **Ongoing use** — modernize for continued building. Output: a clean foundation for future work, not a museum piece.

**Fine-grained variants (relevant once "ongoing" is chosen):**

- **Resurrect** — bring the existing code back to life, migrating along the way
- **Fresh start** — keep the idea, throw the code away, rebuild from zero
- **Fork-and-rewrite** — start from the existing code, but as a sibling branch with no migration commitment (existing branch becomes reference, not migration base)
- **Archive** — formally give up; document why; stop

The interview depth, the scaffolding, and the project page's `status:` value differ across these. Confirm before proceeding past Phase 2.

## Host project adaptation

Detect once, at the start of the survey phase. Run this check from the user's current working directory:

```
ls CLAUDE.md projects/ log.md 2>/dev/null
```

Interpret:

- **All three present** → wiki host. Conform to its schema. Read CLAUDE.md to learn the project page frontmatter shape and log.md action verbs. See [REFERENCE.md](REFERENCE.md) §"Wiki host integration."
- **Some present** → partial host. Use what's there; don't invent missing structure.
- **None present** → no host. Output portable markdown to a sensible default path (`./RESURRECTION-<slug>.md` or similar) and tell the user where.

Do not hardcode any specific wiki's schema. The reference wiki this was built against is at `/Users/brandt/codes/brandtam/mybot-dev` but the skill must not assume it.

## What this skill does NOT do

- It does not write code. The scaffolding output is a *plan*, not commits.
- It does not run package managers, migrations, or build steps.
- It does not make decisions for the user. It asks, captures, and reflects.
- It does not duplicate the global `resurrect-old-repo` skill — they're peers with different emphases; use whichever the user reaches for.

## Advanced

- Full workflow with checkpoints: [REFERENCE.md](REFERENCE.md)
- Worked example (chatr.tech, 2026-05-22): [EXAMPLES.md](EXAMPLES.md)
- Modernization recipes (deprecated SDK swaps, framework jumps): [references/modernization-paths.md](references/modernization-paths.md)
- Adding a new stack to the question library: [REFERENCE.md](REFERENCE.md) §"Extending stack coverage"

# response-shape

A `UserPromptSubmit` hook that caps every reply at one decision and one
question.

- **Script:** [`response-shape.sh`](./response-shape.sh)
- **Event:** `UserPromptSubmit`
- **Wiring:** see [`../README.md`](../README.md)

## The rule it injects

1. Answer what was asked. Nothing adjacent.
2. Surface at most **one** decision — the next one — then stop.
3. Ask at most **one** question.
4. No option menus, no stacked recommendations, no "also worth noting".
5. Findings that were not asked for: omit. If they matter, one line —
   "found N other things, want them?"
6. Long-form analysis only when explicitly asked for.

**Violation test:** more than one decision surfaced, or more than one question
asked, is a violation.

## Why it exists

The failure mode: asked to look at a GitHub issue and talk through how to handle
it, Claude returned a full audit — measured bundle numbers, a reframing of the
metric being used, four recommendations, and a closing question. Every fact in it
was correct. The response was still wrong, because a single "what do we do here?"
came back as a wall requiring a dozen threads held at once. Every session then
needed a second round trip to unpack it.

This was already written as a preference in `~/CLAUDE.md` — "initial responses
should be extremely concise", marked MOST IMPORTANT, sitting at the top of
context. It was broken on the first turn of the very session that produced the
wall.

Two reasons it failed, in order of importance:

- **"Concise" is not falsifiable.** Any response can be argued concise for its
  subject, which leaves room to rationalise an exception whenever a task feels
  analytically rich — precisely when the over-dumping happens. "One decision, one
  question" offers nothing to rationalise around: the violation is visible in two
  seconds, without reading the content.
- **Position decays.** Instructions loaded at session start compete with
  everything arriving after them. A `UserPromptSubmit` hook re-injects on every
  prompt, so salience does not fall off as the conversation grows.

The second point is why it is a hook rather than another line in `CLAUDE.md`. The
first is why the wording changed rather than just the delivery.

## What it does and does not buy

It does not guarantee compliance. Rough estimate for the specific failure mode —
an open-ended "look at X and let's talk about it" prompt — is a 70–80% over-dump
rate before, 20–30% after. Most of that comes from the falsifiable wording; the
hook mainly keeps the rule from decaying over a long session.

Residual failures cluster in one place: when there is something genuinely
interesting to report. That is the case to watch.

## The general lesson

Two things transfer to any rule you want an agent to actually follow:

1. **Write rules whose violation is visible without judgement.** If checking
   compliance requires interpreting the content, the rule is a preference, not a
   constraint.
2. **Put the rule where it cannot decay.** Anything loaded once at session start
   competes with everything that follows. Harness-executed injection does not.

## Related

The originating discussion and a project-scoped copy live in the Meyer microsite
repo at `docs/agents/response-shape.md`.

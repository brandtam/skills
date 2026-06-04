# Phase 2 — Reflect

The most important phase, and the one most easily skipped. Before the architecture conversation, the user needs to face questions about *the project itself* — what it was for, whether it worked, why it stalled, and whether it's even the right thing to revive.

Skip this and you risk doing high-quality architectural work on the wrong problem.

## Posture

- Open-ended questions, not yes/no.
- Ask one or two at a time. Wait for real answers. Resist the urge to batch.
- The user's memory of the project may be vague — that itself is data. Note when "I don't remember" is the answer; it changes the motion calculus.
- This is not a checklist to power through. It's a structured reflection. The whole phase might take 20 minutes of real conversation.

## Question library

Pull questions in roughly this order. Skip any that the survey phase already conclusively answered.

### Group A — Original intent

1. **What was this for?** What problem did it solve, what itch did it scratch, what were you exploring?
2. **Who was it for?** Just you, a specific audience, a hypothetical market?
3. **What did "done" look like at the time?** A working prototype, a launched product, a public artifact, something else?

### Group B — Outcome

4. **Did it ever work as intended?** What was the best moment with it? (If yes — capture the demo/screenshot/URL if recoverable.)
5. **Was anyone using it?** Even informally — friends, you-day-to-day, occasional users?
6. **What part are you proud of?** Often there's a kernel worth preserving even if the surrounding code isn't.

### Group C — Why it stalled

7. **Why did it stall?** Probe gently — common patterns:
   - **Technical block** — something specific broke (deprecated SDK, vendor sunset, paid tier expired)
   - **Loss of interest** — life happened, attention moved
   - **No traction** — users didn't show up
   - **Scope creep** — the next version felt too big
   - **External constraint** — job change, life event, cost
   The honest answer matters because it predicts whether the revival will stick.

### Group D — Counterfactual

8. **Knowing what you know now, what would you change about the original conception?** Not the architecture — the *idea*. Different audience? Different scope? Different problem entirely?
9. **What's worth keeping from the original vision?** A specific feature, a specific aesthetic, a specific user-experience moment, the underlying problem?

### Group E — Why now

10. **Why pick it up today?** What's different about the present that makes this worth revisiting?
    - New capabilities exist (e.g. better LLMs, better browsers, new APIs)
    - You learned something that changes the approach
    - The original problem is still real and unsolved
    - Sunk-cost / curiosity / nostalgia (valid, but should be named)

11. **What does success look like *this time*?** Concretely — finished prototype, public launch, monetized, internal-only tool, learning artifact?

## The motion check (load-bearing)

After the question library, force a single explicit decision. This determines what Phase 3 does, what Phase 4 writes, and how `status:` lands on the project page.

> Where on the spectrum from **time capsule** to **ongoing use** does this revival land?
>
> - **Time capsule** — make the existing code run again. Patch deprecated deps to the minimum. Keep the architecture as-was. Output is a functional artifact, not a foundation. *Status on the project page: `archived` with a note explaining it was unblocked but not modernized.*
>
> - **Resurrect (migrate)** — bring the code forward to today's stack with normal migration. *Status: `active`.*
>
> - **Fork-and-rewrite** — keep the existing code as reference, build a new branch fresh against current best practices. Don't commit to migrating anything from the old branch. *Status: `active`. Existing branch tagged or noted as reference-only.*
>
> - **Fresh start** — keep the idea, throw the code away, rebuild from zero. The repo may stay or get archived. *Status: `active` on a new project page; old codebase referenced as historical only.*
>
> - **Archive** — the right answer sometimes. Document what it was, why it's stopping, and what you learned. *Status: `archived` with reasoning.*

If the user is unsure, **don't push past this**. Surface the trade-offs (effort, output-quality, code-debt risk) and let them sit with it. A wrong motion decision wastes Phase 3 and 4.

## Output of this phase

Capture in memory (Claude's), not yet on disk:

- A 1–2 sentence "original intent" line
- A 1-line "why it stalled" line
- A 1-line "why now" line
- The motion decision, named explicitly
- Any concrete must-keeps / must-changes from the counterfactual

These feed Phase 3 (which questions to ask, how deep to go) and Phase 4 (the project page body).

## Worked example (chatr.tech, 2026-05-22)

These questions were *not* asked explicitly during the chatr.tech resurrection, and the project page reflects that gap — the intent and counterfactual are implicit at best. If we'd run Phase 2, the answers might have been:

- **Intent:** explore multi-bot LLM UIs, Slack-style; play with personality-per-bot via prompts.
- **Worked?** Yes briefly, locally; never deployed publicly with traffic.
- **Stalled because:** OpenAI's pricing model shifted, Sanity felt overengineered for the use case, attention moved.
- **Counterfactual:** wouldn't have used Sanity; would have made bot definitions just files; would have been provider-agnostic from day one.
- **Why now:** Claude exists now and is a better fit; Cloudflare Workers handle the streaming better than Vercel Edge; the JSON-as-CMS pattern is now a tested idiom.
- **Motion:** **fork-and-rewrite** — old branch as reference, rewrite branch with Svelte 5 / SvelteKit 2 / Anthropic+OpenAI provider abstraction / no CMS / Cloudflare adapter.

Notice that this phase *would have made the motion explicit*, and that motion (fork-and-rewrite) is exactly what the chatr.tech project page implicitly chose — but without naming it. Naming matters: it tells future-you what the bar is for "done," and it tells anyone reading the page what kind of project this is.

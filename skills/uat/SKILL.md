---
name: uat
description: Run a user acceptance testing session with collect-grill-PRD workflow. Use when user says "uat", "start uat", "acceptance testing", "let's test", or invokes /uat. Captures observations as checklist items, grills for decisions, then generates a PRD.
license: MIT
metadata:
  version: "0.1.0"
---

# UAT

User acceptance testing in three phases: **collect**, **grill**, **PRD**.

## Phase 1: Collect

When the user starts a UAT round:

1. Determine the round number by checking for existing `local-docs/uat-round-*.md` files
2. Create `local-docs/uat-round-N.md` with a `# UAT Round N` heading
3. Ensure `local-docs/uat-screenshots/` exists
4. Tell the user you're ready and to start dropping observations

While collecting:
- The user drops observations one at a time — voice transcriptions, typed notes, screenshots, or images
- Add each as a `- [ ]` checkbox item to the UAT doc
- Keep descriptions concise but capture the full intent
- If a screenshot is provided, save a reference to its path next to the item
- Don't ask clarifying questions yet — just log and confirm. Say "Logged. Next." or similar
- Stay in collect mode until the user says they're done ("done", "that's it", "finished testing", etc.)

## Phase 2: Grill

When the user signals they're done collecting:

1. Read back the full UAT document
2. Walk through each item one at a time, asking targeted questions to resolve:
   - What specifically should change?
   - Are there sub-decisions (behavior, styling, scope)?
   - What's the recommended approach?
3. Use AskUserQuestion for structured choices where appropriate
4. After each item is resolved, update the UAT doc with sub-bullets capturing the decisions
5. Present a summary table of all decisions when done

## Phase 3: PRD

After grilling is complete:

1. Write a PRD to `local-docs/prd-uat-round-N.md` covering:
   - Problem Statement
   - Solution
   - User Stories (extensive numbered list)
   - Implementation Decisions (modules to build/modify with specifics)
   - Testing Decisions
   - Out of Scope
   - Further Notes
2. Survey the codebase to write informed implementation decisions — include module names and architectural patterns, not file paths (those rot)

## Visual QA (optional)

When the user asks to verify changes visually, or after implementation:

1. Write a Playwright script to screenshot each changed feature
2. Save screenshots to `local-docs/uat-screenshots/`
3. Review each screenshot and report findings
4. Clean up the QA script after

## Tips

- Screenshots from the user are ephemeral in chat — note what they show but don't depend on accessing them later
- The user may use voice transcription, so observations may be conversational. Extract the intent
- Some items may be quick fixes, others may be architectural. Log them all the same way during collect
- During grill, recommend an answer for each question so the user can just confirm or redirect

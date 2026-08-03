#!/usr/bin/env bash
# Injected on every user prompt. Rationale and wiring instructions live in
# brandtam/skills -> hooks/response-shape/README.md
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"RESPONSE SHAPE — hard rule, overrides any verbosity default:\n1. Answer what was asked. Nothing adjacent.\n2. Surface at most ONE decision — the next one — then stop.\n3. Ask at most ONE question.\n4. No option menus, no stacked recommendations, no 'also worth noting'.\n5. Findings you were not asked for: omit. If they matter, one line: 'found N other things, want them?'\n6. Long-form analysis only when Brandt explicitly asks.\nViolation test: >1 decision surfaced, or >1 question asked, = violated. This is falsifiable on sight; treat it as a hard constraint, not a style preference."}}
JSON

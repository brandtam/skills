# Default PR template

Use this when the repo has no PR template of its own. Omit sections that
genuinely don't apply. Keep it scannable — a reviewer should get the shape of
the change in under a minute.

---

## Summary

One or two sentences: what this changes and why it's needed. Written for
someone who hasn't followed the work.

## Context

The motivation — the bug, the requirement, the constraint that forced this.
Link the issue, spec, or discussion. Skip if the summary already covers it.

## Changes

- Grouped by capability or subsystem, not by file
- Each bullet a discrete change as it exists in the final code
- Imperative mood ("Add X", "Extract Y", "Replace Z with W")

## Reviewer notes

Anything a reviewer would otherwise have to discover on their own:

- Trade-offs made and alternatives rejected
- Areas that most need scrutiny
- Follow-up work intentionally left out of scope

## Risk

- **Breaking changes** — API, schema, or behavior changes callers must react to
- **Migrations** — DB migrations and whether they're reversible
- **Config** — new env vars, secrets, feature flags, infra changes
- **Dependencies** — added or upgraded packages and why

Omit the whole section only when all four are genuinely empty.

## Verification

How this was checked — tests added or updated, manual steps taken, or an
explicit statement that it isn't verified yet.

## Related

`Closes #123` — only when this branch actually closes the issue. Otherwise
plain links.

# Changeset Format

Default pending changesets live directly under `.changeset/`:

```markdown
---
type: minor
category: Added
issue: #123
---

Add saved dashboard filters so users can return to common report views.

- Existing reports keep their current filter behavior.
- Saved filters are available from the report toolbar.
```

## Fields

- `type`: required. Use `major`, `minor`, or `patch`.
- `category`: optional when repo tooling has defaults. Prefer Keep a Changelog categories.
- `issue` or `pr`: optional link or issue number.

The first body line is the changelog summary. Keep it short, concrete, and user-facing.

## Type Selection

- `major`: breaking public contracts, removed released workflows, required data migrations, dropped documented runtime support.
- `minor`: new workflows, new capabilities, backwards-compatible public contract additions, deprecations.
- `patch`: bug fixes, security fixes that preserve public contracts, copy/visual/browser fixes, dependency fixes with no behavior change.

## Wording Rules

- Describe the shipped result, not implementation steps.
- Prefer active, concrete language.
- Avoid internal-only phrasing like "refactor", "wire up", "plumb", or "cleanup" unless that is genuinely what users see.
- Include migration, app-author, operator, or security notes when those readers need action.

## When To Skip

Do not add a changeset for test-only changes, internal refactors with no public behavior change, typo fixes in internal docs, or lockfile churn with no shipped effect.

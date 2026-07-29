<!-- release-kit v1 — canonical source: brandtam/skills (skills/setup-release-kit) -->

# Changesets

Every PR that changes shipped behavior carries **one** changeset file in this directory.
A changeset is a small markdown note describing the user-facing result of the change. At
release time the notes are consumed into `CHANGELOG.md`, the package version is bumped, and
the consumed files are archived under `released/<version>/`.

## Add one

```sh
npm run changeset:add      # interactive prompt (pnpm/yarn/bun work the same)
```

Or write the file by hand — `kebab-case-name.md` with frontmatter:

```markdown
---
type: minor # major | minor | patch
category: Added # Added | Changed | Deprecated | Removed | Fixed | Security | Migration Notes | Known Issues | Upgrade Notes
area: platform # optional grouping token (kebab-case, optional `:` namespace)
issue: #123 # optional
---

Add saved dashboard filters so users can return to common report views.

- Optional follow-up bullets for operators / migration steps.
```

The changeset **is** the changelog entry — `CHANGELOG.md` (and any GitHub Release built from
it) copies it verbatim. The first line is the **summary** (short, concrete, user-facing); any
follow-up bullets also appear, so include only ones worth publishing. Keep the whole thing
concise and jargon-free, and put implementation detail in the PR, not here.

## Type selection

- **major** — breaking a public contract, removing a released workflow, a required data migration.
- **minor** — a new capability or workflow, a backwards-compatible contract addition, a deprecation.
- **patch** — a bug fix, a security fix that preserves contracts, a copy/visual fix.

## When to skip

Test-only changes, internal refactors with no shipped behavior change, internal-doc typo
fixes, and lockfile churn don't need a changeset. For those PRs, apply the
`skip-changeset` label so CI's changeset gate passes.

## Commands

| Command                | What it does                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `changeset:add`        | Interactive prompt to create a changeset.                                                   |
| `changeset:status`     | Preview the next version + changelog from pending changesets.                               |
| `changeset:check`      | Validate every pending changeset's format.                                                  |
| `changeset:check-pr`   | Validate **this branch's** changeset and require one exists (the CI gate).                  |
| `changeset:version`    | Consume pending changesets → bump version + changelog (used internally by `release`).       |
| `release`              | Open the release PR: bump + changelog from all pending changesets (dry-run unless `--yes`). |
| `release:tag`          | After the release PR merges, push the annotated tag `vX.Y.Z` (dry-run unless `--yes`).      |

**Scope:** the kit ends at the pushed tag. Deploys, publishes, and GitHub Releases are this
repo's own workflows, triggered by `on: push: tags`.

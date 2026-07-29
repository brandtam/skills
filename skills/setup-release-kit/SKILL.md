---
name: setup-release-kit
description: Install or upgrade the portable changeset-and-release workflow (release kit) in a repo — changeset per PR, CI gate, two-phase tag-based releases, archived notes. Use when the user asks to set up, install, add, migrate to, or update the release kit / changeset workflow in a repository.
license: MIT
metadata:
  version: "1.0.0"
---

# Setup Release Kit

Install the canonical changeset-and-release workflow into the current repo, or upgrade an
existing copy. The canonical files live in this skill's `assets/` directory and are copied
**verbatim** — repo-specific behavior belongs only in `package.json` scripts and
tag-triggered workflows, never inside the copied scripts.

## Scope — say this to the user up front

**The kit ends at the pushed tag.** It owns: changeset per PR, the CI gate, version bump,
`CHANGELOG.md`, archiving notes to `.changeset/released/<version>/`, and pushing the
annotated tag `vX.Y.Z`. It never deploys or publishes anything. Anything downstream must be
a repo-owned workflow triggered by `on: push: tags`.

## What gets installed

| Asset | Destination | Notes |
| --- | --- | --- |
| `assets/scripts/changesets.mjs` | `scripts/changesets.mjs` | Zero-dependency CLI |
| `assets/scripts/lib/changesets.mjs` | `scripts/lib/changesets.mjs` | Core library |
| `assets/scripts/release.mjs` | `scripts/release.mjs` | Phase 1: release PR |
| `assets/scripts/release-tag.mjs` | `scripts/release-tag.mjs` | Phase 2: push tag |
| `assets/changeset-readme.md` | `.changeset/README.md` | Format reference |
| `assets/workflows/changeset.yml` | `.github/workflows/changeset.yml` | PR gate (no install step needed) |
| `assets/workflows/release-on-tag.yml` | `.github/workflows/release-on-tag.yml` | **Optional** — offer it |
| `assets/workflows/deploy-on-tag.yml` | `.github/workflows/deploy-on-tag.yml` | **Starter stub** — offer only if no tag-triggered workflow exists |

The library's test suite lives at `tests/changesets.test.mjs` in this skill (run with
`node --test`); it is not installed into target repos.

Plus these `package.json` scripts (merge, don't clobber):

```json
"changeset": "node scripts/changesets.mjs",
"changeset:add": "node scripts/changesets.mjs add",
"changeset:status": "node scripts/changesets.mjs status",
"changeset:check": "node scripts/changesets.mjs validate",
"changeset:check-pr": "node scripts/changesets.mjs validate --branch-only --require-pending",
"changeset:version": "node scripts/changesets.mjs version",
"release": "node scripts/release.mjs",
"release:tag": "node scripts/release-tag.mjs"
```

## First checks

1. Confirm you are at a repo root with `package.json` and a git remote. The scripts assume
   a `main` default branch, GitHub, and the `gh` CLI; flag any mismatch before proceeding.
2. Inspect what release tooling exists: `.changeset/`, `@changesets/cli` in dependencies,
   `CHANGELOG.md`, release scripts, tag-triggered workflows, existing tags.
3. Pick the mode below and tell the user which one applies before changing anything.

## Mode: fresh install (no changeset tooling)

1. Copy all non-optional assets to their destinations. Merge the scripts into
   `package.json`; if a script name collides, show the conflict and ask.
2. If `package.json` has no `version`, set `0.1.0`. If `CHANGELOG.md` is missing, leave it —
   the first release creates it.
3. Create the `skip-changeset` label if missing:
   `gh label create skip-changeset --description "PR does not need a changeset" --color ededed`
4. Check for an existing `on: push: tags` workflow. If none, offer the two optional
   workflows (`release-on-tag.yml` generic GitHub Release; `deploy-on-tag.yml` stub) and
   explain the scope line. Never write a real deploy step yourself.
5. Verify: `node scripts/changesets.mjs help` runs, and `changeset:check` passes.
6. Recommend making the `changeset present` check required in branch protection.

## Mode: migrate (repo has @changesets/cli or a homegrown scheme)

1. Convert any pending notes to the kit's format (`type` / `category` frontmatter +
   summary-first body) before replacing tooling. Show the converted notes.
2. Remove the old tooling (`@changesets/cli` dependency, `.changeset/config.json`, old
   release scripts) and proceed as a fresh install.
3. Never rewrite `CHANGELOG.md` history — the kit only prepends going forward.

## Mode: update (repo already has the kit)

1. Detect via the `release-kit v<N>` header stamp in `scripts/changesets.mjs`.
2. Diff each installed file against the asset. Show the drift. Local edits to kit files are
   a bug by contract — surface them, then overwrite with the canonical copies.
3. Leave `package.json` scripts, `.changeset/*.md` notes, archives, and all tag-triggered
   workflows untouched.

## Finishing

- Land the install as a normal PR on a branch, and give it a changeset (the kit's first!)
  or the `skip-changeset` label per the user's preference.
- Point the user at `/write-changeset` for per-PR notes and `/prepare-release` for cutting
  releases.
- Close by restating the scope line and, if no tag-triggered workflow exists, saying so
  plainly: "pushing a tag currently triggers nothing."

## Boundaries

- Never deploy, publish, or create tags/releases while installing.
- Never edit the canonical assets to add repo-specific behavior; if a repo genuinely needs
  different core behavior, that is a kit version bump in the skills repo, not a fork.

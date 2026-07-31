---
name: docs-check
description: Check the current branch's changes against the repo's documentation and propose updates — edit stale pages, draft missing ones, or confirm no docs are needed. Use before opening a PR, when the user says "docs check", "are the docs up to date", or "what docs does this change need".
license: MIT
metadata:
  version: "0.1.0"
---

# Docs Check

Diff-driven documentation maintenance. Given the work on the current branch,
decide whether existing docs went stale or new docs are needed, and propose
the specific changes.

## First Checks

1. Read repo instructions (`AGENTS.md`, `CLAUDE.md`) and any docs conventions
   they link — folder contract, authoring guide, audience definitions.
2. Locate the docs root. Default `docs/`; honor whatever the repo's
   conventions declare, including audience subfolders (e.g. `docs/editors/`
   for end-user pages, `docs/dev/` for developer/admin pages).
3. Get the diff: `git diff <default-branch>...HEAD` plus untracked files.
   If there is no diff, say so and stop.

## Classify the change

For each logical change in the diff, decide who can observe it:

- **End users / operators** — UI, workflows, settings, content-editor
  behavior → end-user docs folder.
- **Developers / admins** — setup, config, env vars, commands, APIs,
  deployment, schema → developer docs folder.
- **Nobody** — refactors, tests, internal cleanups → no doc change; say so
  explicitly rather than inventing one.

## Find stale pages

Search the docs folders for statements the diff invalidates: renamed
commands or flags, changed defaults, removed settings, altered workflows,
outdated screenshots or examples. Grep for identifiers that the diff touched
(setting keys, command names, route paths, env var names).

## Propose, then apply

Present a short plan before editing:

- pages to **edit**, each with the stale claim and its replacement
- pages to **create**, each with audience, filename, and a one-line scope —
  follow the repo's authoring guide for voice and frontmatter
- changes needing **no docs**, with the reason

Apply only after the user approves. Follow the repo's frontmatter and naming
conventions (kebab-case lowercase filenames unless the repo says otherwise).

## Boundaries

- Derive only from the code and existing text; never invent behavior. Mark
  unverifiable statements with `<!-- TODO: verify -->`.
- Don't restructure the docs tree; that is onboarding work, not PR work.
- Don't touch changelogs or release notes — other workflows own those.
- If the repo has no docs folder at all, point to the repo's onboarding or
  authoring guide instead of scaffolding one from this skill.

# Scaffold Workflow

Use this only when the user has approved installing the workflow into a repo that does not already have one.

## Detection

Before scaffolding, inspect:

- package manager and scripts: `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lockb`
- current version source: `package.json`, project manifest, app config, or release docs
- existing changelog/release files: `CHANGELOG.md`, `RELEASES.md`, `.changeset/`, `.github/release.yml`
- test runner and build command
- PR template and repo instructions

Preserve existing conventions unless they are clearly incomplete.

## Default Install

Install or adapt:

- `.changeset/README.md`
- `.changeset/released/.gitkeep`
- `CHANGELOG.md` baseline when missing
- `scripts/changesets.js`
- `scripts/lib/changesets.js`
- `scripts/lib/changesets.test.js`
- package scripts:
  - `changeset`
  - `changeset:add`
  - `changeset:status`
  - `changeset:check`
  - `changeset:check-pr`
  - `changeset:version`
- contributor docs, usually `docs/changesets.md`
- PR template release/changelog fields

Use `assets/cli/` when a Node-based repo can use the bundled CLI. For non-Node repos, port the same behavior into the repo's language/tooling.

## Required CLI Behavior

The repo-local CLI should:

1. Parse `.changeset/*.md` frontmatter.
2. Validate filename, type, category, and summary.
3. Support branch-local validation for PRs.
4. Preview the next version and changelog entry.
5. Consume pending changesets into `CHANGELOG.md`.
6. Bump the project version.
7. Move consumed files to `.changeset/released/<version>/`.
8. Refuse mutating release commands without an explicit confirmation flag.

## Tests

Add focused tests for:

- valid and invalid parsing
- branch-local detection including committed, staged, unstaged, and untracked files
- highest SemVer bump selection
- changelog generation
- version file update
- archive collision behavior
- dry-run behavior

Run the repo's relevant validation after scaffolding.

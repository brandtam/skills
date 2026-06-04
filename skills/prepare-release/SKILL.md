---
name: prepare-release
description: Prepare a release from pending changesets by previewing the next version, generating the changelog, archiving consumed notes, and preparing tag or GitHub Release steps. Use when the user asks to prepare, cut, publish, or generate a release from pending changesets.
license: MIT
metadata:
  version: "0.1.0"
---

# Prepare Release

Use this skill when the user wants to turn pending changesets into a release.

## First Checks

1. Read repo instructions such as `AGENTS.md`, `CLAUDE.md`, and release docs.
2. Confirm the repo already has a changeset workflow and release command.
3. Confirm pending `.changeset/*.md` files exist.
4. Inspect the current version, changelog, branch, working tree, tags, CI expectations, and deployment model.

If the workflow is missing, stop and say the repo does not have changeset release tooling installed. Do not scaffold it from this skill.

If there are no pending changesets, stop and report that there is nothing to release.

## Release Workflow

1. Run the repo's dry-run or status command first.
2. Summarize the pending changesets, next version, and generated changelog preview.
3. Run required validation, usually tests, lint, build, and relevant browser checks.
4. Run the mutating version/changelog/archive command only when the user has asked to proceed.
5. Review generated files, especially `CHANGELOG.md`.
6. Prepare the release commit, tag, and GitHub Release notes.

## Boundaries

- Do not create missing changeset tooling.
- Do not invent release notes without pending changesets.
- Do not delete consumed changesets; they should move to `.changeset/released/<version>/`.
- Do not create, move, or push tags without explicit approval.
- Do not publish a GitHub Release without explicit approval.
- Treat published tags as immutable. Ship a follow-up patch rather than rewriting a release tag.

## References

- For the command sequence and file behavior, read `references/release-workflow.md`.
- For GitHub Release expectations, read `references/github-releases.md`.
- For prompt and response examples, read `references/examples.md`.

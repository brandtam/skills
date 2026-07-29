---
name: write-changeset
description: Write or update a change set (changeset) file for a pull request or branch. Use when the user says to write, add, update, or run the change set or changeset for a PR/branch before merge. If the repo has no changeset workflow, install it with setup-release-kit first.
license: MIT
metadata:
  version: "0.1.0"
---

# Write Change Set

Use this skill when the user wants the PR or branch to carry a changeset before merge.

## First Checks

1. Read repo instructions such as `AGENTS.md`, `CLAUDE.md`, and release docs.
2. Detect existing workflow files: `.changeset/`, `CHANGELOG.md`, package scripts, release scripts, PR template, and tests.
3. Inspect the branch or PR diff before writing anything.
4. If the workflow already exists, follow the repo's local commands and file format.

## Normal Workflow

1. Find an existing branch-local `.changeset/*.md` file. Update it when it belongs to this PR.
2. If none exists and the PR needs one, create exactly one pending changeset file.
3. Choose the smallest defensible type: `major`, `minor`, or `patch`.
4. Choose the changelog category used by the repo, usually `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, `Migration Notes`, `App Author Notes`, `Known Issues`, or `Upgrade Notes`.
5. Write the note in user-facing language describing the final result of the PR.
6. Run the repo's changeset validation command, such as `pnpm changeset:check-pr`.

## Boundaries

- Do not edit `CHANGELOG.md`.
- Do not bump versions.
- Do not move files into `.changeset/released/`.
- Do not create tags, pushes, or GitHub Releases.
- If the PR does not need a changeset, say that directly and explain the reason.

## Missing Workflow

If the repo does not have a changeset workflow, stop and tell the user to install it with
the `setup-release-kit` skill. That skill owns the canonical scripts, CI gate, and release
tooling; this skill only writes notes into an installed workflow. Do not scaffold from here.

## References

- For file format rules, read `references/changeset-format.md`.
- For prompt and output examples, read `references/examples.md`.

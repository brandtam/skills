---
name: write-pr
description: Generate a structured pull request title and body, then optionally push the branch and open the PR. Uses the repo's PR template if one exists, otherwise a built-in template. Enforces user approval before pushing or creating the PR. Use when user says "open a PR", "write a PR description", "create pull request", or invokes /write-pr.
license: MIT
metadata:
  version: "0.1.0"
---

# Write PR

Generate a pull request description for the current branch, then optionally push and open the PR with user approval.

## Workflow

### Step 1 — Gather fresh state

Run in parallel — never reuse results from earlier in the conversation:

```
git status
git branch --show-current
git remote -v
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
```

Then, using the default branch name from above as `<base>`:

```
git log <base>..HEAD --oneline
git diff <base>...HEAD --stat
git diff <base>...HEAD
gh pr list --head <current-branch> --json number,url,title
```

Stop and tell the user if:

- The current branch **is** the default branch — offer to create a branch first.
- There are no commits between `<base>` and `HEAD` — nothing to open a PR for.
- A PR already exists for this branch — show its number/URL and ask whether to **update its description** or **stop**.

If there are uncommitted changes, say so and ask whether to **commit first** (hand off to `/write-commit`), **proceed anyway** (they won't be in the PR), or **stop**.

### Step 2 — Check for a repo PR template

Check these paths, in order:

```
.github/pull_request_template.md
.github/PULL_REQUEST_TEMPLATE.md
.github/PULL_REQUEST_TEMPLATE/*.md
docs/pull_request_template.md
pull_request_template.md
```

- If a template exists, read it and fill in every section. Keep its headings and order exactly. Delete only comment blocks (`<!-- ... -->`) and checklist items that are clearly inapplicable.
- If multiple templates exist under `PULL_REQUEST_TEMPLATE/`, ask the user which one to use.
- If no template exists, use the **default template** in `references/pr-template.md`.

### Step 3 — Write the PR

**Title** — one line, imperative mood, under 70 characters. If the repo's commits follow Conventional Commits, match that prefix style (`feat:`, `fix:`, …).

**Body** — fill the chosen template. Content rules:

- Describe what the branch **does now**, not the process of getting there. No "fixed after review", no "second attempt at".
- Lead with the *why*. A reviewer should understand the motivation before the mechanics.
- Group changes by capability or subsystem, not by file. Reference files as `path/to/file.ts` only when it aids navigation.
- Call out anything a reviewer would otherwise have to discover: schema/migration changes, breaking API changes, new env vars or secrets, new dependencies, feature flags, performance or security implications.
- State how the change was verified — tests added, manual steps, or explicitly "not verified".
- If `CONTEXT.md` exists in the repo, use its domain terms. If absent, proceed silently.
- Link issues with GitHub closing keywords (`Closes #123`) only when the branch actually closes them.
- Omit sections that genuinely don't apply rather than writing "N/A" everywhere — but never drop a section a repo template requires.

**Never** include `Co-Authored-By`, `Signed-off-by`, `Generated with`, or any other trailer, attribution, or tool-credit line in the title or body.

Display the full title and body to the user in a code block.

### Step 4 — User approval

After displaying, ask the user:

- **Open PR** — push the branch if needed, then create the PR
- **Make changes** — user gives feedback, you revise, then ask again
- **Copy only** — leave the text for the user; don't push or create anything
- **End now** — exit

**NEVER push or create/edit a PR without the user choosing "Open PR".**

### Step 5 — Create the PR

If the branch has no upstream, push it first:

```
git push -u origin <current-branch>
```

Then create the PR with a HEREDOC body:

```
gh pr create --base <base> --title "<title>" --body "$(cat <<'EOF'
<body here>
EOF
)"
```

Ask whether to open as a **draft** (`--draft`) if the user hasn't said.

To update an existing PR instead, use `gh pr edit <number> --body "$(cat <<'EOF' ... EOF
)"`.

After success, show the PR URL.

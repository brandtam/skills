---
name: write-commit
description: Generate structured commit messages and optionally commit for the user. Checks for repo-level commit templates, handles staging decisions, and enforces user approval before any commit. Use when user says "commit", "write a commit message", "stage and commit", or invokes /write-commit.
license: MIT
metadata:
  version: "0.1.0"
---

# Commit

Generate a commit message for the current changes, then optionally execute the commit with user approval.

## Workflow

### Step 1 — Gather fresh state

Run all three in parallel — never reuse results from earlier in the conversation:

```
git status
git diff HEAD
git diff --cached
```

Determine: are there staged files? Unstaged changes? Untracked files?

If there are no changes at all (nothing staged, unstaged, or untracked), tell the user there's nothing to commit and stop.

### Step 2 — Staging decision

If there are already staged files AND unstaged/untracked changes, ask the user:

- **Staged files only** — write commit for what's already staged
- **Stage all changes** — run `git add -A`, then write commit for everything

If everything is already staged, skip this question. If nothing is staged, ask:

- **Stage all changes** — run `git add -A`
- **Select files** — let the user tell you which files to stage

After staging is resolved, re-run `git diff --cached` to see exactly what will be committed.

### Step 3 — Check for commit template

Check for a repo-level commit template:

```
git config --get commit.template
```

Also check for `.gitmessagetemplate` or `.git-commit-template` in the repo root.

- If a template exists, read it and follow its format for the commit message.
- If no template exists, use the **default format** below.

### Step 4 — Write the commit message

#### Default format

1. A single summary line (imperative mood, under 70 characters)
2. A blank line
3. A bulleted list of what the code does NOW

#### Message rules

- Describe the **result**, not the process. No "Fix bug that was introduced when..." or "Refactor after code review found..."
- Each bullet: a discrete capability, integration, or architectural change as it exists in the final code
- Imperative mood ("Add X", "Extract Y", "Update Z")
- If `CONTEXT.md` exists in the repo, use its domain terms. If absent, proceed silently.
- Group related changes into single bullets rather than listing every file
- Omit intermediate steps, failed approaches, iterative fixes — only the current state
- Never describe corrections to things that were never committed. If a value was wrong in the working tree but never in git history, describe the current (correct) state.
- 8–15 bullets for large changes, fewer for small ones

- **Never** append Co-Authored-By, Signed-off-by, or any trailer lines to the commit message

Display the full commit message to the user in a code block.

### Step 5 — User approval

After displaying the message, ask the user:

- **Commit now** — execute `git commit` with the displayed message
- **Make changes** — user provides feedback, you revise the message, then ask again
- **End now** — exit without committing

**NEVER commit without the user choosing "Commit now."**

When committing, use a HEREDOC to pass the message:

```
git commit -m "$(cat <<'EOF'
<message here>
EOF
)"
```

After a successful commit, show the user the commit hash and summary.

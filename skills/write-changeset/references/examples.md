# Examples

## User Prompts

```text
Write the changeset for this PR.
```

```text
Add the changeset for this branch before I merge it.
```

```text
Update the changeset now that the PR is ready.
```

```text
Run the changeset workflow for this PR.
```

## Good Changeset

```markdown
---
type: minor
category: Added
issue: #214
---

Add saved dashboard filters so users can return to common report views.

- Saved filters appear in the report toolbar.
- Existing reports keep their current filter behavior.
```

## Patch Changeset

```markdown
---
type: patch
category: Fixed
pr: #238
---

Keep the settings dialog open after failed validation so users can correct invalid fields.
```

## Skip Response

```text
I did not add a changeset. This branch only updates unit test coverage and does not change shipped behavior or public docs.
```

## Missing Workflow Response

```text
This repo does not have a changeset workflow installed yet. I can scaffold the workflow, docs, CLI, tests, and PR template, then write the first changeset for this branch.
```

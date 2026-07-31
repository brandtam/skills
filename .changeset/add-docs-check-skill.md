---
type: minor
category: Added
---

Add the docs-check skill for diff-driven documentation maintenance

- Diffs the current branch against the default branch and classifies each change by who can observe it: end users, developers, or nobody
- Flags existing doc pages the diff makes stale and proposes new pages per the host repo's docs conventions
- Reports "no docs needed" explicitly with a reason instead of staying silent or inventing pages

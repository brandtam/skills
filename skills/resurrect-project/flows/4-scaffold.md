# Phase 4 — Scaffold

Output phase. Take everything from Phases 1–3 and write it down where it belongs.

## Branch by host project

The Phase 1 detection result determines where things land.

### Wiki host (CLAUDE.md + projects/ + log.md all present)

1. **Read CLAUDE.md** to learn the host wiki's specific schema. Note:
   - Project page frontmatter shape (what fields, what types)
   - Slug convention (kebab-case is common)
   - Whether `status:` uses `active | paused | archived | reference` or different terms
   - The log.md format and accepted action verbs
   - Any References-block / Decisions-block conventions
   - Cross-link convention: wiki-links (`[[basename]]`) vs markdown links

2. **Write the project page** to `projects/<slug>.md` following the host's schema. Base structure (adapt frontmatter and link style to the host):

   ```yaml
   ---
   title: <human title>
   type: project
   status: <per motion decision — see vocabulary.md>
   tags: [<relevant tags>]
   sources: [<source files if any>]
   updated: <today>
   ---
   ```

   Body sections in this order (omit any with no content):

   - **H1 title**
   - **1-paragraph context** — what it is, when last touched, current deployment state
   - **Stack as it stood** — bullets from Phase 1 survey
   - **Sibling / related projects** — repos that share the workspace but aren't part of this resurrection
   - **Reflection** — short version of Phase 2 outputs:
     - Original intent (1 sentence)
     - Why it stalled (1 sentence)
     - Why now (1 sentence)
     - Motion (named explicitly, with link to vocabulary if available)
   - **Decisions (<date>)** — numbered list from Phase 3 output
   - **Open / next** — concrete next steps
   - **Related** — domain pages, account pages, other cross-references

3. **Cross-link siblings**:
   - On each related repo page: add `domains:`, `website:`, or other reference fields that point at this project's outputs. Add the project to its `tags:` or related list.
   - On the domain page (if there is one): note that the project is in resurrection (e.g. "currently down — see [[<project-slug>]]")
   - On the account page(s) implicated (e.g. the LLM-provider account, the hosting account): no edit needed unless something specific changed.

4. **Append to log.md**. Two entries:
   - `## [<date>] create | <project-slug> — <motion>` with a 1-line summary
   - `## [<date>] decision | <project-slug> — <2-4 word decision list>` with the numbered decisions inline as sub-bullets

5. **Update index.md** if the host has one — add the new project to the appropriate section.

### Partial host

Some of `CLAUDE.md` / `projects/` / `log.md` present but not all.

- `projects/` exists, no schema doc → use the base project-page structure above; pick reasonable defaults; flag the schema gap to the user (offer to formalize later).
- `CLAUDE.md` exists, no `projects/` → ask before creating the folder. The host project may not want a `projects/` folder.
- `log.md` exists, nothing else → write the project page to a sensible location (`./RESURRECTION-<slug>.md`) and only log the event.

### No host

Standalone output. Write a single markdown file to the current working directory:

```
./RESURRECTION-<slug>.md
```

Same body structure as the wiki version, but no frontmatter (or minimal frontmatter — `title`, `status`, `motion`, `updated`). Don't invent a wiki around it.

## End-of-phase wrap

Always end with a single sentence telling the user **what just happened** and **the one concrete next step they own**.

Examples:

- "Wrote `projects/chatr-tech-resurrection.md` with 4 decisions and 4 open items. Next concrete step: pick a rewrite branch name on `brandtam-sk-chatr`."
- "Wrote `RESURRECTION-acme-cli.md` standalone. Next concrete step: confirm Anthropic API key is set in the environment."

This sentence is the deliverable. Everything else is supporting evidence.

## What NOT to do

- **Don't write code.** Phase 4 is documentation only.
- **Don't make commits.** Even if the host repo is git-initialized.
- **Don't run `gh repo clone`** to fetch additional repos at this phase. That was Phase 1's job.
- **Don't update unrelated wiki pages** beyond the direct cross-links. Tempting, but it's scope creep.
- **Don't add a TODO without explicit ask.** If something's worth following up on, surface it; let the user decide whether it goes in `TODO.md` or wherever the host captures backlog.

# skills

Brandt's personal collection of authored and customized agent skills. Standalone — no npm, no third-party installer. Install them straight from GitHub or via the Claude Code plugin marketplace.

Every skill conforms to the open [Agent Skills specification](https://agentskills.io/specification), so any compliant agent (Claude Code, Codex, and others) can read these folders. Validated in CI with [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref).

A fuller, illustrated walkthrough lives in [`INSTALL.html`](./INSTALL.html) — open it in a browser.

## Install

### Claude Code (plugin marketplace)

```text
/plugin marketplace add brandtam/skills
/plugin install brandt-skills@brandt
```

Claude Code fetches the repo directly from GitHub. No npm involved.

### Anything that reads `~/.agents/skills` (e.g. Codex) — or Claude, manually

```bash
git clone https://github.com/brandtam/skills.git
cd skills
./install.sh                 # all skills -> ~/.agents/skills
./install.sh write-commit    # or just the ones you want
```

`install.sh` only copies the folders next to it. Nothing is fetched or executed from npm.

### By hand

Each skill is a self-contained folder under `skills/`. Copy any one into your agent's skills directory (`~/.agents/skills/` or `~/.claude/skills/`) and you're done.

## Skills

| Skill | What it does |
|-------|--------------|
| `prepare-release` | Prepare a release from pending changesets — preview the next version, generate the changelog, archive consumed notes, and stage tag/GitHub Release steps. |
| `write-change-set` | Write or update a changeset file for a PR or branch, scaffolding the changeset workflow if it's missing. |
| `write-commit` | Generate structured commit messages and optionally commit, honoring repo-level templates and requiring approval before committing. |
| `uat` | Run a user-acceptance-testing session — collect observations, grill for decisions, then generate a PRD. |
| `resurrect-project` | Revive a dormant project — survey the code as historical signal, interview on today's intent, capture decisions, and scaffold a rewrite plan. |

## Validate

Check every skill against the spec before committing or releasing:

```bash
./validate.sh
```

It installs [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) into a local `.venv` (Python, no npm) and validates each folder under `skills/`. The same check runs in CI on every push and PR.

## Layout

```text
.claude-plugin/
  marketplace.json   # marketplace catalog (lists this repo as one plugin)
  plugin.json        # this repo IS the plugin; skills auto-discovered
skills/
  <name>/SKILL.md    # one self-contained, spec-compliant folder per skill
install.sh           # copy skills into ~/.agents/skills (bash, no npm)
validate.sh          # validate skills against the Agent Skills spec
.github/workflows/   # CI: runs validation on push/PR
INSTALL.html         # illustrated walkthrough
```

## License

[MIT](./LICENSE)

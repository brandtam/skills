# skills

Brandt's authored and customized agent skills.

These skills follow the [Agent Skills specification](https://agentskills.io/specification), so any skills-compatible agent — Claude Code, Codex CLI, and others — can use them. Everything installs straight from GitHub: no npm, no third-party installer. Validated in CI with [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref).

An illustrated walkthrough lives in [`INSTALL.html`](./INSTALL.html).

## Install

### Claude Code marketplace

```
/plugin marketplace add brandtam/skills
/plugin install brandt-skills@brandt
```

### Git + install.sh

```
git clone https://github.com/brandtam/skills.git
cd skills
./install.sh                 # all skills -> ~/.agents/skills
./install.sh write-commit    # or just the ones you want
```

Target a specific agent's skills directory instead:

```
DEST=~/.codex/skills  ./install.sh    # Codex CLI
DEST=~/.claude/skills ./install.sh    # Claude Code
```

### Manually

Each skill is a self-contained folder under `skills/`. Copy any one into your agent's skills directory:

- **Codex CLI** — `~/.codex/skills/`
- **Claude Code** — `~/.claude/skills/`
- **Shared store** (read by both when linked via the `~/.agents/skills` convention) — `~/.agents/skills/`

```
cp -R skills/write-commit ~/.codex/skills/
```

## Skills

| Skill | Description |
|-------|-------------|
| [prepare-release](skills/prepare-release) | Cut a release from pending changesets — version preview, changelog, archived notes, tag / GitHub Release steps. |
| [write-change-set](skills/write-change-set) | Write or update a changeset for a PR or branch, scaffolding the workflow if it's missing. |
| [write-commit](skills/write-commit) | Generate structured commit messages and optionally commit, honoring templates and requiring approval. |
| [uat](skills/uat) | Run a user-acceptance-testing session — collect observations, grill for decisions, generate a PRD. |
| [resurrect-project](skills/resurrect-project) | Revive a dormant project — survey the code, interview on today's intent, scaffold a rewrite plan. |

## Validate

Check every skill against the spec before committing or releasing:

```
./validate.sh
```

It installs [`skills-ref`](https://github.com/agentskills/agentskills/tree/main/skills-ref) into a local `.venv` (Python, no npm) and validates each folder under `skills/`. The same check runs in CI on every push and PR.

## Layout

```
.claude-plugin/
  marketplace.json   # marketplace catalog (lists this repo as one plugin)
  plugin.json        # this repo IS the plugin; skills auto-discovered
skills/
  <name>/SKILL.md    # one self-contained, spec-compliant folder per skill
install.sh           # copy skills into a skills directory (bash, no npm)
validate.sh          # validate skills against the Agent Skills spec
.github/workflows/   # CI: runs validation on push/PR
INSTALL.html         # illustrated walkthrough
```

## License

[MIT](./LICENSE)

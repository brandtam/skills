# hooks

Reference documentation for the Claude Code hooks I run. **Nothing here is
installed by `install.sh` or the plugin** — these are notes and scripts to copy
by hand.

## Why they are documentation, not installables

A skill is a folder you drop into a skills directory; installing one is a copy.
A hook is different: it needs an entry merged into `~/.claude/settings.json`, a
file the plugin does not own and should not rewrite. Shipping hooks as
installable would mean an installer editing your personal settings — more
machinery, more ways to break, for something you wire up once.

So `hooks/` is a place to remember what was built and why. If a third or fourth
hook shows up and hand-wiring gets tedious, that is the moment to add an
installer — not before.

## Why hooks at all

A hook is the only mechanism here the *harness* executes rather than the model.
Instructions in `CLAUDE.md` are a request the model can drift from. A hook fires
whether or not the model cooperates, and a `UserPromptSubmit` hook injects its
text immediately before generation rather than at session start, so it does not
decay as the conversation grows.

That makes hooks the right tool when the goal is a **behavioural constraint**
rather than context. Reach for a hook when a rule has to hold on the hundredth
turn as firmly as the first.

## Layout

Each hook gets a folder matching the `skills/<name>/` convention:

```
hooks/<name>/
  README.md      what it does, why it exists, how to wire it
  <name>.sh      the script itself
```

## Wiring one up

1. Copy the script to `~/.claude/hooks/<name>.sh` and `chmod +x` it.
2. Add it to `~/.claude/settings.json` under the matching event.
3. Restart, or open `/hooks` once — the settings watcher only tracks directories
   that had a settings file when the session started, so a first-ever hooks block
   is invisible to the running session.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {"type": "command", "command": "bash /Users/you/.claude/hooks/name.sh"}
        ]
      }
    ]
  }
}
```

Validate the merge before trusting it — a malformed `settings.json` silently
disables **every** setting in the file, not just the hook:

```sh
jq -e '.hooks' ~/.claude/settings.json >/dev/null && echo ok
```

## Hooks

| Hook | Event | What it does |
|---|---|---|
| [response-shape](./response-shape/) | `UserPromptSubmit` | Caps each reply at one decision and one question |

#!/usr/bin/env bash
#
# install.sh — copy skills from this repo into your agent skills directory.
#
# No npm, no network calls of its own: it only copies the skill folders that
# are already sitting next to it. Works for any agent that reads ~/.agents/skills
# (Codex) or ~/.claude/skills (Claude Code).
#
# Usage:
#   ./install.sh                 # install every skill into ~/.agents/skills
#   ./install.sh write-commit    # install only the named skill(s)
#   DEST=~/.codex/skills  ./install.sh    # Codex CLI's skills directory
#   DEST=~/.claude/skills ./install.sh    # Claude Code's skills directory
#
set -euo pipefail

# Directory this script lives in, so it works no matter where you call it from.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$REPO_DIR/skills"
DEST="${DEST:-$HOME/.agents/skills}"

if [ ! -d "$SRC_DIR" ]; then
  echo "error: no skills/ directory found next to this script ($SRC_DIR)" >&2
  exit 1
fi

mkdir -p "$DEST"

# Build the list of skills to install: the args you passed, or all of them.
if [ "$#" -gt 0 ]; then
  skills=("$@")
else
  skills=()
  for dir in "$SRC_DIR"/*/; do
    skills+=("$(basename "$dir")")
  done
fi

echo "Installing into: $DEST"
for name in "${skills[@]}"; do
  skill_src="$SRC_DIR/$name"
  if [ ! -f "$skill_src/SKILL.md" ]; then
    echo "  skip   $name  (no skills/$name/SKILL.md in this repo)" >&2
    continue
  fi
  rm -rf "${DEST:?}/$name"          # replace any older copy cleanly
  cp -R "$skill_src" "$DEST/$name"  # copy the whole folder, references and all
  echo "  ok     $name"
done

echo "Done. Restart your agent (or reload skills) to pick them up."

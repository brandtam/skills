#!/usr/bin/env bash
#
# validate.sh — check every skill against the Agent Skills spec.
#
# Uses skills-ref (https://agentskills.io), a Python tool — no npm.
# It installs skills-ref into a local .venv the first time, then validates
# each folder under skills/. Run it before committing or releasing.
#
# Usage:
#   ./validate.sh
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$REPO_DIR/.venv"
SKILLS_DIR="$REPO_DIR/skills"
SKILLS_REF_SPEC="git+https://github.com/agentskills/agentskills.git#subdirectory=skills-ref"

# Set up the venv + tool once; reuse it afterward.
if [ ! -x "$VENV/bin/skills-ref" ]; then
  echo "Setting up skills-ref (one-time)…"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet "$SKILLS_REF_SPEC"
fi

fail=0
for dir in "$SKILLS_DIR"/*/; do
  name="$(basename "$dir")"
  if out="$("$VENV/bin/skills-ref" validate "$dir" 2>&1)"; then
    echo "  ok     $name"
  else
    fail=1
    echo "  FAIL   $name"
    echo "$out" | sed 's/^/           /'
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "Validation failed." >&2
  exit 1
fi
echo "All skills conform to the Agent Skills spec."

# Release Workflow

Use the repo's local command names when they differ from these defaults.

## Default Commands

```bash
pnpm changeset:check
pnpm changeset:version -- --dry-run
pnpm test:unit
pnpm build
pnpm changeset:version -- --yes
git add package.json CHANGELOG.md .changeset/
git commit -m "chore: release vX.Y.Z"
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main --follow-tags
```

The only default command above that mutates release files is:

```bash
pnpm changeset:version -- --yes
```

It should:

1. Read pending `.changeset/*.md`.
2. Validate file format.
3. Compute the highest SemVer bump.
4. Prepend the matching version section to `CHANGELOG.md`.
5. Update the project version source.
6. Move consumed changesets into `.changeset/released/<version>/`.

## Review After Mutation

Inspect:

- version file changed to the previewed version
- `CHANGELOG.md` has the new section at the top
- entries are grouped and worded clearly
- consumed notes moved under `.changeset/released/<version>/`
- no unrelated files changed

It is acceptable to edit changelog wording after generation. Keep archived source changesets committed.

## Hotfixes

For urgent patch releases:

1. Branch from the release base.
2. Fix the issue.
3. Add a patch changeset.
4. Merge or apply the fix.
5. Consume that changeset into a patch release.
6. Publish a new tag. Do not move an existing tag.

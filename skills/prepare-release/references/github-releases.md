# GitHub Releases

GitHub Releases are based on Git tags. The changelog is the source note; the GitHub Release is the public announcement.

## Tag Policy

- Use `vX.Y.Z` tags unless the repo already has a different convention.
- Prefer annotated tags for manual releases.
- Do not move published release tags.
- Use prerelease tags such as `vX.Y.Z-alpha.N` only when the user asks for prerelease testing.

## Release Body

Start with the matching `CHANGELOG.md` section, then edit for readability.

Add only useful public context:

- migration notes
- screenshots or short demos
- deployment notes for operators
- known issues
- compare link
- security advisory link when disclosure is appropriate

## Deployment Timing

If production deploys from `main`, verify the deployment before publishing the GitHub Release.

If deployment is handled by GitHub Actions, wait for build, test, and deploy jobs before publishing.

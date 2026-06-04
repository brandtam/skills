# Examples

## User Prompts

```text
Prepare the next release from pending changesets.
```

```text
Turn the pending changesets into the changelog.
```

```text
Cut the release from main, but preview it first.
```

```text
Generate the release notes and archive the changesets.
```

## Missing Workflow Response

```text
This repo does not have changeset release tooling installed. I cannot prepare a changeset-based release until that workflow exists.
```

## No Pending Changesets Response

```text
There are no pending changesets to release. I did not update the changelog, version, tags, or release files.
```

## Approval Boundary

```text
The release files are ready and the next version is 1.4.0. I have not created or pushed a tag yet. Say the word if you want me to tag and prepare the GitHub Release.
```

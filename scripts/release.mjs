#!/usr/bin/env node
// release-kit v1 — canonical source: brandtam/skills (skills/setup-release-kit)
// Copied verbatim into repos by /setup-release-kit. Do not customize per repo.

/**
 * release — open the release PR from accumulated changesets.
 *
 *   <pm> release          # dry run: preview the next version + changelog, change nothing
 *   <pm> release --yes    # create release/vX.Y.Z, bump + changelog, push, open the PR
 *
 * Run this from an up-to-date `main` AFTER every feature PR has merged. It consumes ALL
 * pending changesets into one version bump + CHANGELOG entry.
 *
 * `main` is assumed protected (PR-only), so the version bump goes through a
 * `release/vX.Y.Z` PR (carrying the `skip-changeset` label, since a release PR consumes
 * changesets rather than adding one). After that PR merges, run `release:tag` to tag
 * `main`. The kit's job ends at the pushed tag — anything downstream (deploy, publish,
 * GitHub Release) is this repo's own tag-triggered workflow.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { pmRun, previewVersionBump } from './lib/changesets.mjs';

const APPLY = process.argv.slice(2).includes('--yes');
const PM = pmRun();

function fail(message) {
	console.error(`release: ${message}`);
	process.exit(1);
}

function run(cmd, args) {
	execFileSync(cmd, args, { stdio: 'inherit' });
}

function capture(cmd, args) {
	return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

// ── Guards: a release only happens from a clean, fully-merged `main` ──────────────
const branch = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch !== 'main') {
	fail(`run this from 'main', not '${branch}'. Releases ship what is already merged.`);
}
if (capture('git', ['status', '--porcelain'])) {
	fail('working tree is not clean. Commit or stash first.');
}

run('git', ['fetch', 'origin', 'main']);
const [behind, ahead] = capture('git', [
	'rev-list',
	'--left-right',
	'--count',
	'origin/main...HEAD'
]).split(/\s+/);
if (behind !== '0') {
	fail(`local main is ${behind} commit(s) behind origin/main — 'git pull --ff-only' first.`);
}
if (ahead !== '0') {
	fail(`local main has ${ahead} commit(s) not on origin/main — push or reset before releasing.`);
}

// ── Preview the bump from ALL pending changesets ─────────────────────────────────
const preview = previewVersionBump();
if (!preview.newVersion || !preview.changelogEntry) {
	console.log('No pending changesets — nothing to release.');
	process.exit(0);
}

const version = preview.newVersion;
const tag = `v${version}`;
const releaseBranch = `release/${tag}`;

console.log(`\nPending changesets (${preview.changesets.length}):`);
for (const c of preview.changesets) console.log(`  - [${c.type}/${c.category}] ${c.filename}`);
console.log(`\nVersion: ${preview.currentVersion} → ${version} (${preview.bumpType})\n`);
console.log('Changelog preview:\n');
console.log(preview.changelogEntry.trimEnd());
console.log('');

if (!APPLY) {
	console.log(`Dry run. Re-run \`${PM} release --yes\` to open the ${releaseBranch} PR.`);
	process.exit(0);
}

// ── Apply: branch, consume changesets, commit, push, open the PR ──────────────────
if (capture('git', ['branch', '--list', releaseBranch])) {
	fail(`branch '${releaseBranch}' already exists locally — delete it or finish that release.`);
}
if (capture('git', ['ls-remote', '--heads', 'origin', releaseBranch])) {
	fail(`branch 'origin/${releaseBranch}' already exists — that release is already in flight.`);
}

console.log(`Creating ${releaseBranch}…`);
run('git', ['checkout', '-b', releaseBranch]);

console.log('Consuming changesets (bump + CHANGELOG + archive)…');
run('node', ['scripts/changesets.mjs', 'version', '--yes']);

run('git', ['add', 'package.json', 'CHANGELOG.md', '.changeset']);
run('git', ['commit', '-m', `chore(release): ${tag}`]);

console.log(`Pushing ${releaseBranch}…`);
run('git', ['push', '-u', 'origin', releaseBranch]);

const body =
	`Release **${tag}** — consumes the pending changesets into \`CHANGELOG.md\` and bumps ` +
	`\`package.json\`. Carries \`skip-changeset\` because a release PR consumes changesets ` +
	`rather than adding one.\n\nAfter this merges, run \`${PM} release:tag\` from \`main\` to tag ` +
	`${tag}. The pushed tag is the release — any deploy/publish is this repo's own ` +
	`tag-triggered workflow.\n\n---\n\n` +
	preview.changelogEntry.trimEnd();

// The label normally exists (setup-release-kit creates it), but a missing label would
// fail `gh pr create` AFTER the branch is pushed — stranding the release. Create it
// idempotently; `gh label create` on an existing label fails, which is fine to ignore.
spawnSync(
	'gh',
	['label', 'create', 'skip-changeset', '--description', 'PR does not need a changeset', '--color', 'ededed'],
	{ stdio: 'ignore' }
);

console.log('Opening the release PR…');
run('gh', [
	'pr',
	'create',
	'--base',
	'main',
	'--head',
	releaseBranch,
	'--title',
	`chore(release): ${tag}`,
	'--label',
	'skip-changeset',
	'--body',
	body
]);

console.log(`\n✅ Opened the ${tag} release PR.`);
console.log(`Next: review + merge it, then run \`${PM} release:tag\` from an updated main.`);

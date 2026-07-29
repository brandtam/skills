#!/usr/bin/env node
// release-kit v1 — canonical source: brandtam/skills (skills/setup-release-kit)
// Copied verbatim into repos by /setup-release-kit. Do not customize per repo.

/**
 * release:tag — tag `main` after the release PR merges.
 *
 *   <pm> release:tag         # dry run: show the tag it would create
 *   <pm> release:tag --yes   # create + push the annotated tag vX.Y.Z
 *
 * Run this from an up-to-date `main` once the `release` PR has merged. It reads the
 * version from package.json (the bump the release PR landed) and pushes an annotated tag
 * `vX.Y.Z`.
 *
 * THE KIT ENDS AT THE TAG. If this repo deploys or publishes, that must be a workflow
 * triggered by `on: push: tags: ['v*']` — this script reports whether one exists, but
 * never deploys anything itself. Pushing the tag IS the deliberate act of releasing.
 *
 * Tags are immutable: if `vX.Y.Z` already exists, ship a follow-up patch instead.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pmRun, previewVersionBump, readPackageVersion } from './lib/changesets.mjs';

const APPLY = process.argv.slice(2).includes('--yes');
const PM = pmRun();

function fail(message) {
	console.error(`release:tag: ${message}`);
	process.exit(1);
}

function run(cmd, args) {
	execFileSync(cmd, args, { stdio: 'inherit' });
}

function capture(cmd, args) {
	return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
}

/** Best-effort scan for workflows that fire on pushed tags — the kit's downstream consumers. */
function tagTriggeredWorkflows() {
	const dir = join(process.cwd(), '.github', 'workflows');
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((file) => /\.ya?ml$/.test(file))
		.filter((file) => {
			const text = readFileSync(join(dir, file), 'utf-8');
			// Matches `on: push: tags:` blocks loosely; a false negative only softens the hint.
			return /push:\s*[\s\S]{0,200}?tags:/.test(text);
		});
}

// ── Guards: tag only a clean, up-to-date `main` that has the merged release ───────
const branch = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch !== 'main') {
	fail(`run this from 'main', not '${branch}'.`);
}
if (capture('git', ['status', '--porcelain'])) {
	fail('working tree is not clean. Commit or stash first.');
}

run('git', ['fetch', 'origin', 'main', '--tags']);
const [behind] = capture('git', [
	'rev-list',
	'--left-right',
	'--count',
	'origin/main...HEAD'
]).split(/\s+/);
if (behind !== '0') {
	fail(`local main is ${behind} commit(s) behind origin/main — 'git pull --ff-only' first.`);
}

// The release PR consumes every changeset, so a clean release leaves none pending. If
// some remain, the bump hasn't landed yet — run `release` and merge it first.
let pendingBump;
try {
	pendingBump = previewVersionBump().newVersion;
} catch (error) {
	fail(
		`could not read pending changesets — fix them (or land the release PR) first.\n${
			error instanceof Error ? error.message : String(error)
		}`
	);
}
if (pendingBump) {
	fail(`pending changesets remain — the release PR has not merged. Run \`${PM} release\` first.`);
}

const version = readPackageVersion();
const tag = `v${version}`;

if (
	capture('git', ['tag', '--list', tag]) ||
	capture('git', ['ls-remote', '--tags', 'origin', tag])
) {
	fail(`${tag} already exists — tags are immutable. Ship a follow-up patch instead.`);
}

const sha = capture('git', ['rev-parse', '--short', 'HEAD']);
const watchers = tagTriggeredWorkflows();

console.log(`\nmain @ ${sha} → tag ${tag}`);
if (watchers.length > 0) {
	console.log(`Tag-triggered workflow(s) that will fire: ${watchers.join(', ')}`);
} else {
	console.log(
		'No tag-triggered workflow found — the tag is the end of the line (no deploy will fire).'
	);
}
console.log('');

if (!APPLY) {
	console.log(`Dry run. Re-run \`${PM} release:tag --yes\` to create and push ${tag}.`);
	process.exit(0);
}

console.log(`Tagging ${tag}…`);
run('git', ['tag', '-a', tag, '-m', tag]);
run('git', ['push', 'origin', tag]);

console.log(`\n✅ Pushed ${tag}. The kit's job ends here — the tag is the release.`);
if (watchers.length > 0) {
	console.log(
		`Downstream: ${watchers.join(', ')} triggered. Track with \`gh run watch\` or GitHub → Actions.`
	);
} else {
	console.log(
		'This repo has no tag-triggered workflow. Add one on `on: push: tags` if it should deploy/publish.'
	);
}

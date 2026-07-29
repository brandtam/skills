// Tests for the canonical release-kit library. These live in the skills repo only —
// they are NOT part of the installed kit (see SKILL.md "What gets installed").
// Run with: npm test (node --test 'skills/setup-release-kit/tests/*.test.mjs')

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
	areaHeading,
	assertCanArchiveChangesets,
	bumpVersion,
	consumeChangesetsAndBumpVersion,
	createChangesetFile,
	generateChangelogEntry,
	getHighestBumpType,
	parseChangeset,
	prependToChangelog,
	previewVersionBump,
	readPendingChangesets,
	slugify,
	validatePendingChangesets
} from '../assets/scripts/lib/changesets.mjs';

const createdRoots = [];

function tempRoot() {
	const root = mkdtempSync(join(tmpdir(), 'release-kit-tests-'));
	createdRoots.push(root);
	writeFileSync(
		join(root, 'package.json'),
		JSON.stringify({ name: 'example-project', version: '1.0.0', private: true }, null, '\t') +
			'\n',
		'utf-8'
	);
	return root;
}

afterEach(() => {
	while (createdRoots.length) {
		rmSync(createdRoots.pop(), { recursive: true, force: true });
	}
});

function git(root, args) {
	const result = spawnSync('git', args, {
		cwd: root,
		stdio: 'pipe',
		encoding: 'utf-8'
	});

	if (result.status !== 0) {
		throw new Error(result.stderr || `git ${args.join(' ')} failed`);
	}
}

function initGitRepo(root) {
	git(root, ['init', '--initial-branch=main']);
	git(root, ['config', 'user.email', 'changeset-tests@example.com']);
	git(root, ['config', 'user.name', 'Changeset Tests']);
	git(root, ['add', 'package.json']);
	git(root, ['commit', '-m', 'initial']);
	git(root, ['checkout', '-b', 'feature/changesets']);
}

async function writeChangeset(root, filename, content) {
	await mkdir(join(root, '.changeset'), { recursive: true });
	await writeFile(join(root, '.changeset', filename), content, 'utf-8');
}

describe('parseChangeset', () => {
	it('parses frontmatter, summary, details, and optional refs', () => {
		const result = parseChangeset(
			'add-finder-routing.md',
			`---
type: minor
category: Added
area: platform
issue: "#12"
pr: "#34"
---

Add folder-addressable Finder windows
- Desktop folder aliases preserve their target folder
`
		);

		assert.deepEqual(result.errors, []);
		const { changeset } = result;
		assert.equal(changeset.filename, 'add-finder-routing.md');
		assert.equal(changeset.type, 'minor');
		assert.equal(changeset.category, 'Added');
		assert.equal(changeset.area, 'platform');
		assert.equal(changeset.issue, '#12');
		assert.equal(changeset.pr, '#34');
		assert.equal(changeset.summary, 'Add folder-addressable Finder windows');
		assert.equal(changeset.body, '- Desktop folder aliases preserve their target folder');
	});

	it('defaults the category from the type', () => {
		const type = (content) => parseChangeset('a-change.md', content).changeset.category;
		assert.equal(type('---\ntype: major\n---\n\nBreak things\n'), 'Changed');
		assert.equal(type('---\ntype: minor\n---\n\nAdd things\n'), 'Added');
		assert.equal(type('---\ntype: patch\n---\n\nFix things\n'), 'Fixed');
	});

	it('rejects content without a frontmatter block', () => {
		const result = parseChangeset('no-frontmatter.md', 'Just a summary\n');
		assert.equal(result.changeset, null);
		assert.deepEqual(result.errors, ['no-frontmatter.md: missing frontmatter block']);
	});

	it('reports invalid type, category, filename, and missing summary', () => {
		const result = parseChangeset(
			'Bad Name.md',
			`---
type: feature
category: Misc
---

`
		);

		assert.deepEqual(result.errors, [
			'Bad Name.md: filename must be kebab-case markdown',
			'Bad Name.md: type must be major, minor, or patch',
			'Bad Name.md: category must be one of Added, Changed, Deprecated, Removed, Fixed, Security, Migration Notes, Known Issues, Upgrade Notes',
			'Bad Name.md: body must start with a one-line summary'
		]);
	});

	it('rejects malformed area tokens and over-long summaries', () => {
		const badArea = parseChangeset(
			'bad-area.md',
			`---
type: patch
area: Not A Token
---

Fix something
`
		);
		assert.ok(badArea.errors.some((error) => error.includes('area must be kebab-case')));

		const longSummary = parseChangeset(
			'long-summary.md',
			`---
type: patch
---

${'x'.repeat(121)}
`
		);
		assert.ok(
			longSummary.errors.some((error) => error.includes('120 characters or less'))
		);
	});

	it('accepts namespaced area tokens', () => {
		const result = parseChangeset(
			'add-report.md',
			`---
type: minor
area: addon:report-builder
---

Add report builder
`
		);
		assert.deepEqual(result.errors, []);
		assert.equal(result.changeset.area, 'addon:report-builder');
	});
});

describe('areaHeading', () => {
	it('title-cases plain and namespaced tokens', () => {
		assert.equal(areaHeading('platform'), 'Platform');
		assert.equal(areaHeading('addon:report-builder'), 'Addon: Report Builder');
		assert.equal(areaHeading(''), 'Other');
	});
});

describe('slugify', () => {
	it('kebab-cases arbitrary summaries and caps the length', () => {
		assert.equal(slugify('Fix menu focus after closing windows'), 'fix-menu-focus-after-closing-windows');
		assert.equal(slugify('  Weird -- punctuation!! '), 'weird-punctuation');
		assert.equal(slugify('x'.repeat(100)).length, 70);
	});
});

describe('pending changesets', () => {
	it('reads direct markdown files and ignores README plus released archives', async () => {
		const root = tempRoot();
		await writeChangeset(
			root,
			'fix-alert.md',
			`---
type: patch
---

Fix alert focus order
`
		);
		await writeChangeset(root, 'README.md', '# docs');
		await mkdir(join(root, '.changeset', 'released', '1.0.0'), { recursive: true });
		await writeFile(join(root, '.changeset', 'released', '1.0.0', 'old.md'), 'old', 'utf-8');

		const results = readPendingChangesets({ root });

		assert.equal(results.length, 1);
		assert.equal(results[0].changeset.filename, 'fix-alert.md');
		assert.deepEqual(validatePendingChangesets({ root }), []);
	});

	it('branch-only reads committed, staged, and untracked changesets', async () => {
		const root = tempRoot();
		initGitRepo(root);

		await writeChangeset(
			root,
			'committed-change.md',
			`---
type: minor
---

Add committed change
`
		);
		git(root, ['add', '.changeset/committed-change.md']);
		git(root, ['commit', '-m', 'add committed changeset']);

		await writeChangeset(
			root,
			'staged-change.md',
			`---
type: patch
---

Fix staged change
`
		);
		git(root, ['add', '.changeset/staged-change.md']);

		await writeChangeset(
			root,
			'untracked-change.md',
			`---
type: patch
---

Fix untracked change
`
		);
		await mkdir(join(root, '.changeset', 'released', '1.0.0'), { recursive: true });
		await writeFile(
			join(root, '.changeset', 'released', '1.0.0', 'archived-change.md'),
			'old',
			'utf-8'
		);

		const names = readPendingChangesets({ root, branchOnly: true, since: 'main' }).map(
			(result) => result.changeset.filename
		);

		assert.deepEqual(names, ['committed-change.md', 'staged-change.md', 'untracked-change.md']);
	});

	it('branch-only fails closed when the base ref is invalid', () => {
		const root = tempRoot();
		initGitRepo(root);
		mkdirSync(join(root, '.changeset'), { recursive: true });

		assert.throws(
			() => readPendingChangesets({ root, branchOnly: true, since: 'missing-ref' }),
			/Could not determine branch changesets/
		);
	});

	it('can require at least one pending changeset', () => {
		const root = tempRoot();

		assert.deepEqual(validatePendingChangesets({ root, requirePending: true }), [
			'No pending changesets found.'
		]);
	});
});

describe('version bumping', () => {
	it('selects the highest bump type and bumps SemVer', () => {
		assert.equal(getHighestBumpType([{ type: 'patch' }, { type: 'minor' }]), 'minor');
		assert.equal(getHighestBumpType([{ type: 'patch' }, { type: 'major' }]), 'major');
		assert.equal(getHighestBumpType([]), null);
		assert.equal(bumpVersion('1.2.3', 'patch'), '1.2.4');
		assert.equal(bumpVersion('1.2.3', 'minor'), '1.3.0');
		assert.equal(bumpVersion('1.2.3', 'major'), '2.0.0');
	});

	it('drops prerelease/build suffixes when bumping', () => {
		assert.equal(bumpVersion('1.2.3-beta.1', 'patch'), '1.2.4');
		assert.equal(bumpVersion('1.2.3+build.5', 'minor'), '1.3.0');
	});

	it('rejects non-SemVer versions and unknown bump types', () => {
		assert.throws(() => bumpVersion('not-a-version', 'patch'), /Cannot bump non-SemVer version/);
		assert.throws(() => bumpVersion('1.2.3', 'huge'), /Unknown bump type/);
	});

	it('previews a release without writing files', async () => {
		const root = tempRoot();
		await writeChangeset(
			root,
			'add-store-flow.md',
			`---
type: minor
category: Added
---

Add store install release checks
`
		);

		const preview = previewVersionBump({ root, date: '2026-06-03' });

		assert.equal(preview.currentVersion, '1.0.0');
		assert.equal(preview.newVersion, '1.1.0');
		assert.equal(preview.bumpType, 'minor');
		assert.ok(preview.changelogEntry.includes('## 1.1.0 - 2026-06-03'));
		assert.ok(readFileSync(join(root, 'package.json'), 'utf-8').includes('"version": "1.0.0"'));
	});

	it('preview throws when a pending changeset is invalid', async () => {
		const root = tempRoot();
		await writeChangeset(
			root,
			'broken.md',
			`---
type: enormous
---

Break the parser
`
		);

		assert.throws(() => previewVersionBump({ root }), /Invalid changesets/);
	});
});

describe('changelog generation', () => {
	it('groups entries by changelog category in stable order, with refs and separators', () => {
		const entry = generateChangelogEntry(
			'1.1.0',
			[
				{
					filename: 'fix.md',
					type: 'patch',
					category: 'Fixed',
					area: '',
					summary: 'Fix unknown document alerts',
					body: '',
					issue: '#7',
					pr: ''
				},
				{
					filename: 'fix-2.md',
					type: 'patch',
					category: 'Fixed',
					area: '',
					summary: 'Fix menu focus',
					body: '',
					issue: '',
					pr: ''
				},
				{
					filename: 'add.md',
					type: 'minor',
					category: 'Added',
					area: '',
					summary: 'Add release tooling',
					body: '- Archives consumed changesets',
					issue: '',
					pr: '#12'
				}
			],
			{ date: '2026-06-03' }
		);

		assert.equal(entry, `## 1.1.0 - 2026-06-03

### Added

Add release tooling (#12)

- Archives consumed changesets

### Fixed

Fix unknown document alerts (#7)

---

Fix menu focus
`);
	});

	it('groups by area when any changeset declares one, platform first and Other last', () => {
		const changeset = (overrides) => ({
			filename: 'x.md',
			type: 'patch',
			category: 'Fixed',
			area: '',
			summary: 'Fix something',
			body: '',
			issue: '',
			pr: '',
			...overrides
		});

		const entry = generateChangelogEntry(
			'2.0.0',
			[
				changeset({ area: 'addon:report-builder', summary: 'Fix report builder export' }),
				changeset({ summary: 'Fix stray unscoped bug' }),
				changeset({ area: 'platform', category: 'Added', type: 'minor', summary: 'Add platform login' })
			],
			{ date: '2026-06-05' }
		);

		assert.equal(entry, `## 2.0.0 - 2026-06-05

### Platform

#### Added

Add platform login

### Addon: Report Builder

#### Fixed

Fix report builder export

### Other

#### Fixed

Fix stray unscoped bug
`);
	});

	it('inserts a new entry before existing version sections', () => {
		const root = tempRoot();
		writeFileSync(
			join(root, 'CHANGELOG.md'),
			`# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 - 2026-06-03

### Added

Initial release
`,
			'utf-8'
		);

		prependToChangelog(
			`## 1.1.0 - 2026-06-04

### Fixed

Fix menus`,
			{ root }
		);

		assert.equal(readFileSync(join(root, 'CHANGELOG.md'), 'utf-8'), `# Changelog

All notable changes to this project will be documented in this file.

## 1.1.0 - 2026-06-04

### Fixed

Fix menus

## 1.0.0 - 2026-06-03

### Added

Initial release
`);
	});

	it('creates CHANGELOG.md with a header when missing', () => {
		const root = tempRoot();
		prependToChangelog('## 1.0.1 - 2026-06-04\n\n### Fixed\n\nFix menus', { root });

		const content = readFileSync(join(root, 'CHANGELOG.md'), 'utf-8');
		assert.ok(content.startsWith('# Changelog\n'));
		assert.ok(content.includes('## 1.0.1 - 2026-06-04'));
	});
});

describe('consumeChangesetsAndBumpVersion', () => {
	it('updates package.json, prepends changelog, and archives pending changesets', async () => {
		const root = tempRoot();
		writeFileSync(
			join(root, 'CHANGELOG.md'),
			`# Changelog

All notable changes to this project will be documented in this file.

## 1.0.0 - 2026-06-03

### Added

Initial release
`,
			'utf-8'
		);
		await writeChangeset(
			root,
			'add-release-tooling.md',
			`---
type: minor
category: Added
---

Add archived changeset release tooling
- Keep release-intent files after they are consumed
`
		);

		const result = consumeChangesetsAndBumpVersion({ root, date: '2026-06-04' });

		assert.equal(result.newVersion, '1.1.0');
		assert.equal(JSON.parse(await readFile(join(root, 'package.json'), 'utf-8')).version, '1.1.0');
		assert.ok(
			(await readFile(join(root, 'CHANGELOG.md'), 'utf-8')).includes('## 1.1.0 - 2026-06-04')
		);
		assert.equal(existsSync(join(root, '.changeset', 'add-release-tooling.md')), false);
		assert.equal(
			existsSync(join(root, '.changeset', 'released', '1.1.0', 'add-release-tooling.md')),
			true
		);
		assert.deepEqual(await readdir(join(root, '.changeset', 'released', '1.1.0')), [
			'add-release-tooling.md'
		]);
	});

	it('returns null when nothing is pending', () => {
		const root = tempRoot();
		assert.equal(consumeChangesetsAndBumpVersion({ root }), null);
	});

	it('preserves package.json indentation style on bump', async () => {
		const root = tempRoot();
		writeFileSync(
			join(root, 'package.json'),
			JSON.stringify({ name: 'spaces-project', version: '1.0.0' }, null, 2) + '\n',
			'utf-8'
		);
		await writeChangeset(root, 'fix-thing.md', '---\ntype: patch\n---\n\nFix a thing\n');

		consumeChangesetsAndBumpVersion({ root, date: '2026-06-04' });

		const raw = await readFile(join(root, 'package.json'), 'utf-8');
		assert.ok(raw.includes('  "version": "1.0.1"'));
		assert.ok(!raw.includes('\t"version"'));
	});

	it('preflights archive conflicts before mutating release files', async () => {
		const root = tempRoot();
		writeFileSync(
			join(root, 'CHANGELOG.md'),
			`# Changelog

All notable changes to this project will be documented in this file.
`,
			'utf-8'
		);
		await writeChangeset(
			root,
			'fix-release.md',
			`---
type: patch
---

Fix release flow
`
		);
		await mkdir(join(root, '.changeset', 'released', '1.0.1'), { recursive: true });
		await writeFile(
			join(root, '.changeset', 'released', '1.0.1', 'fix-release.md'),
			'old',
			'utf-8'
		);

		const changesets = previewVersionBump({ root, date: '2026-06-04' }).changesets;

		assert.throws(
			() => assertCanArchiveChangesets('1.0.1', changesets, { root }),
			/Cannot archive changesets/
		);
		assert.throws(
			() => consumeChangesetsAndBumpVersion({ root, date: '2026-06-04' }),
			/Cannot archive changesets/
		);
		assert.equal(JSON.parse(await readFile(join(root, 'package.json'), 'utf-8')).version, '1.0.0');
		assert.equal(await readFile(join(root, 'CHANGELOG.md'), 'utf-8'), `# Changelog

All notable changes to this project will be documented in this file.
`);
		assert.equal(existsSync(join(root, '.changeset', 'fix-release.md')), true);
	});
});

describe('createChangesetFile', () => {
	it('creates a valid changeset file with defaults', async () => {
		const root = tempRoot();
		createChangesetFile(
			{
				filename: 'fix-menu-focus.md',
				type: 'patch',
				summary: 'Fix menu focus after closing windows'
			},
			{ root }
		);

		const content = await readFile(join(root, '.changeset', 'fix-menu-focus.md'), 'utf-8');
		assert.equal(content, `---
type: patch
category: Fixed
---

Fix menu focus after closing windows
`);
	});

	it('writes optional area, issue, and pr fields', async () => {
		const root = tempRoot();
		createChangesetFile(
			{
				filename: 'add-report.md',
				type: 'minor',
				area: 'addon:report-builder',
				issue: '#123',
				pr: '#456',
				summary: 'Add report builder'
			},
			{ root }
		);

		const content = await readFile(join(root, '.changeset', 'add-report.md'), 'utf-8');
		assert.ok(content.includes('area: addon:report-builder'));
		assert.ok(content.includes('issue: #123'));
		assert.ok(content.includes('pr: #456'));
	});

	it('round-trips through parseChangeset', async () => {
		const root = tempRoot();
		createChangesetFile(
			{
				filename: 'add-round-trip.md',
				type: 'minor',
				area: 'platform',
				issue: '#9',
				summary: 'Add round trip',
				body: '- With a detail line'
			},
			{ root }
		);

		const content = await readFile(join(root, '.changeset', 'add-round-trip.md'), 'utf-8');
		const { changeset, errors } = parseChangeset('add-round-trip.md', content);
		assert.deepEqual(errors, []);
		assert.equal(changeset.type, 'minor');
		assert.equal(changeset.area, 'platform');
		assert.equal(changeset.issue, '#9');
		assert.equal(changeset.summary, 'Add round trip');
		assert.equal(changeset.body, '- With a detail line');
	});

	it('rejects invalid input and duplicate filenames', async () => {
		const root = tempRoot();
		assert.throws(
			() => createChangesetFile({ filename: 'bad.md', type: 'huge', summary: 'Nope' }, { root }),
			/Invalid changeset/
		);

		createChangesetFile({ filename: 'fix-once.md', type: 'patch', summary: 'Fix once' }, { root });
		assert.throws(
			() => createChangesetFile({ filename: 'fix-once.md', type: 'patch', summary: 'Fix twice' }, { root }),
			/Changeset already exists/
		);
	});
});

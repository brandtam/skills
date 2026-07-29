// release-kit v1 — canonical source: brandtam/skills (skills/setup-release-kit)
// Copied verbatim into repos by /setup-release-kit. Do not customize per repo —
// repo-specific behavior belongs in package.json scripts and tag-triggered workflows.

import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	renameSync,
	writeFileSync
} from 'node:fs';
import { basename, join } from 'node:path';
import { spawnSync } from 'node:child_process';

export const CHANGESET_DIR = '.changeset';
export const RELEASED_DIR = '.changeset/released';

export const CHANGESET_TYPES = ['major', 'minor', 'patch'];
export const CHANGELOG_CATEGORIES = [
	'Added',
	'Changed',
	'Deprecated',
	'Removed',
	'Fixed',
	'Security',
	'Migration Notes',
	'Known Issues',
	'Upgrade Notes'
];

const DEFAULT_CATEGORY_BY_TYPE = {
	major: 'Changed',
	minor: 'Added',
	patch: 'Fixed'
};

const CHANGESET_FILE_PATTERN = /^[a-z0-9][a-z0-9-]*\.md$/;
const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

// `area` is an OPTIONAL grouping token (kebab-case, may contain one `:` namespace, e.g.
// `platform` or `addon:report-builder`). When any pending changeset declares an area, the
// changelog groups the release by area; when none do, categories render flat.
const AREA_PATTERN = /^[a-z0-9][a-z0-9-]*(:[a-z0-9][a-z0-9-]*)?$/;

/** Human heading for an `area` token: `platform` → "Platform"; `addon:report-builder` → "Addon: Report Builder". */
export function areaHeading(area) {
	if (typeof area !== 'string' || !area) return 'Other';
	const title = (part) =>
		part
			.split('-')
			.filter(Boolean)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	return area.split(':').map(title).join(': ');
}

/** Sort areas `platform`-first (a useful convention), then alphabetically, unscoped ("Other") last. */
function areaSortKey(area) {
	if (area === 'platform') return '0';
	if (area === '') return '2';
	return `1:${area}`;
}

/** Detect the invoking package manager for user-facing hints (falls back to `npm run`). */
export function pmRun() {
	const agent = process.env.npm_config_user_agent ?? '';
	if (agent.startsWith('pnpm')) return 'pnpm';
	if (agent.startsWith('yarn')) return 'yarn';
	if (agent.startsWith('bun')) return 'bun run';
	return 'npm run';
}

function changesetPath(root, ...parts) {
	return join(root, CHANGESET_DIR, ...parts);
}

function releasedPath(root, ...parts) {
	return join(root, RELEASED_DIR, ...parts);
}

function parseFrontmatter(frontmatter) {
	const fields = {};

	for (const line of frontmatter.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const separator = trimmed.indexOf(':');
		if (separator === -1) continue;

		const key = trimmed.slice(0, separator).trim().toLowerCase();
		const value = trimmed
			.slice(separator + 1)
			.trim()
			.replace(/^['"]|['"]$/g, '');

		fields[key] = value;
	}

	return fields;
}

export function parseChangeset(filename, content) {
	const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
	if (!match) {
		return {
			changeset: null,
			errors: [`${filename}: missing frontmatter block`]
		};
	}

	const fields = parseFrontmatter(match[1]);
	const description = match[2].trim();
	const type = fields.type?.toLowerCase();
	const category = fields.category || (type ? DEFAULT_CATEGORY_BY_TYPE[type] : undefined);
	const summary = description.split('\n')[0]?.trim() ?? '';

	const changeset = {
		filename,
		type,
		category,
		area: fields.area || '',
		issue: fields.issue || '',
		pr: fields.pr || '',
		summary,
		body: description.split('\n').slice(1).join('\n').trim(),
		description
	};

	return {
		changeset,
		errors: validateChangeset(changeset)
	};
}

export function validateChangeset(changeset) {
	const errors = [];

	if (!CHANGESET_FILE_PATTERN.test(changeset.filename)) {
		errors.push(`${changeset.filename}: filename must be kebab-case markdown`);
	}

	if (!CHANGESET_TYPES.includes(changeset.type)) {
		errors.push(`${changeset.filename}: type must be major, minor, or patch`);
	}

	if (!CHANGELOG_CATEGORIES.includes(changeset.category)) {
		errors.push(
			`${changeset.filename}: category must be one of ${CHANGELOG_CATEGORIES.join(', ')}`
		);
	}

	if (changeset.area && !AREA_PATTERN.test(changeset.area)) {
		errors.push(
			`${changeset.filename}: area must be kebab-case, optionally namespaced (e.g. platform, addon:report-builder)`
		);
	}

	if (!changeset.summary) {
		errors.push(`${changeset.filename}: body must start with a one-line summary`);
	}

	if (changeset.summary.length > 120) {
		errors.push(`${changeset.filename}: summary should be 120 characters or less`);
	}

	return errors;
}

export function readPendingChangesets({
	root = process.cwd(),
	branchOnly = false,
	since = 'origin/main'
} = {}) {
	const dir = changesetPath(root);
	if (!existsSync(dir)) return [];

	const branchFiles = branchOnly ? getBranchOnlyChangesetFiles({ root, since }) : null;
	const files = readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((file) => file.endsWith('.md') && file !== 'README.md')
		.filter((file) => !branchFiles || branchFiles.has(file))
		.sort((a, b) => a.localeCompare(b));

	return files.map((filename) => {
		const content = readFileSync(changesetPath(root, filename), 'utf-8');
		return parseChangeset(filename, content);
	});
}

export function getValidPendingChangesets(options = {}) {
	const parsed = readPendingChangesets(options);
	const errors = parsed.flatMap((result) => result.errors);
	if (errors.length > 0) {
		const error = new Error(`Invalid changesets:\n${errors.join('\n')}`);
		error.errors = errors;
		throw error;
	}

	return parsed.map((result) => result.changeset).filter(Boolean);
}

export function getBranchOnlyChangesetFiles({ root = process.cwd(), since = 'origin/main' } = {}) {
	const files = [
		...gitChangedFiles(root, ['diff', `${since}...HEAD`, '--name-only', '--', CHANGESET_DIR]),
		...gitChangedFiles(root, ['diff', '--name-only', '--', CHANGESET_DIR]),
		...gitChangedFiles(root, ['diff', '--cached', '--name-only', '--', CHANGESET_DIR]),
		...gitChangedFiles(root, ['ls-files', '--others', '--exclude-standard', '--', CHANGESET_DIR])
	];

	return new Set(files.filter(isPendingChangesetPath).map((file) => basename(file)));
}

export function getHighestBumpType(changesets) {
	if (changesets.length === 0) return null;
	if (changesets.some((changeset) => changeset.type === 'major')) return 'major';
	if (changesets.some((changeset) => changeset.type === 'minor')) return 'minor';
	return 'patch';
}

export function bumpVersion(version, type) {
	const match = version.match(SEMVER_PATTERN);
	if (!match) {
		throw new Error(`Cannot bump non-SemVer version: ${version}`);
	}

	let major = Number(match[1]);
	let minor = Number(match[2]);
	let patch = Number(match[3]);

	if (type === 'major') {
		major += 1;
		minor = 0;
		patch = 0;
	} else if (type === 'minor') {
		minor += 1;
		patch = 0;
	} else if (type === 'patch') {
		patch += 1;
	} else {
		throw new Error(`Unknown bump type: ${type}`);
	}

	return `${major}.${minor}.${patch}`;
}

// A changelog entry is a FAITHFUL COPY of the changeset: its summary line (with any issue/PR
// ref) followed by its body, verbatim. The changeset is the single source of truth — there is
// no transform that drops or rewrites content here. Conciseness is an authoring concern.
function formatEntry(changeset) {
	const refs = [changeset.issue, changeset.pr].filter(Boolean).join(' ');
	const head = refs ? `${changeset.summary} (${refs})` : changeset.summary;
	return changeset.body ? `${head}\n\n${changeset.body}` : head;
}

/** Render the `### Category` (or deeper) sections for a set of changesets, in catalog order. */
function renderCategorySections(changesets, headingLevel) {
	const hashes = '#'.repeat(headingLevel);
	const grouped = new Map();
	for (const category of CHANGELOG_CATEGORIES) {
		grouped.set(category, []);
	}
	for (const changeset of changesets) {
		grouped.get(changeset.category)?.push(changeset);
	}

	const sections = [];
	for (const [category, entries] of grouped) {
		if (entries.length === 0) continue;
		sections.push(`${hashes} ${category}\n\n${entries.map(formatEntry).join('\n\n---\n\n')}`);
	}
	return sections.join('\n\n');
}

export function generateChangelogEntry(version, changesets, { date = currentDate() } = {}) {
	const header = `## ${version} - ${date}`;

	// With no `area` declared anywhere, render flat category sections (### H3).
	if (!changesets.some((changeset) => changeset.area)) {
		return `${header}\n\n${renderCategorySections(changesets, 3)}\n`;
	}

	// Otherwise group the release by area (### H3), with category sections nested beneath (#### H4).
	const byArea = new Map();
	for (const changeset of changesets) {
		const key = changeset.area || '';
		if (!byArea.has(key)) byArea.set(key, []);
		byArea.get(key).push(changeset);
	}

	const areaSections = [...byArea.keys()]
		.sort((a, b) => areaSortKey(a).localeCompare(areaSortKey(b)))
		.map((area) => `### ${areaHeading(area)}\n\n${renderCategorySections(byArea.get(area), 4)}`);

	return `${header}\n\n${areaSections.join('\n\n')}\n`;
}

export function readPackageVersion({ root = process.cwd() } = {}) {
	const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'));
	return packageJson.version;
}

export function writePackageVersion(version, { root = process.cwd() } = {}) {
	const packagePath = join(root, 'package.json');
	const raw = readFileSync(packagePath, 'utf-8');
	const packageJson = JSON.parse(raw);
	packageJson.version = version;
	// Preserve the file's existing indentation (tabs or spaces).
	const indent = raw.match(/^(\t| {2,4})"/m)?.[1] ?? '\t';
	writeFileSync(packagePath, `${JSON.stringify(packageJson, null, indent)}\n`, 'utf-8');
}

export function prependToChangelog(entry, { root = process.cwd() } = {}) {
	const changelogPath = join(root, 'CHANGELOG.md');
	const normalizedEntry = entry.trimEnd();

	if (!existsSync(changelogPath)) {
		writeFileSync(
			changelogPath,
			`# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n${normalizedEntry}\n`,
			'utf-8'
		);
		return;
	}

	const existing = readFileSync(changelogPath, 'utf-8').trimEnd();
	const firstVersionHeader = existing.search(/^## /m);

	if (firstVersionHeader === -1) {
		writeFileSync(changelogPath, `${existing}\n\n${normalizedEntry}\n`, 'utf-8');
		return;
	}

	const before = existing.slice(0, firstVersionHeader).trimEnd();
	const after = existing.slice(firstVersionHeader).trimStart();
	writeFileSync(changelogPath, `${before}\n\n${normalizedEntry}\n\n${after}\n`, 'utf-8');
}

export function archiveChangesets(version, changesets, { root = process.cwd() } = {}) {
	if (changesets.length === 0) return [];

	const archiveDir = releasedPath(root, version);
	mkdirSync(archiveDir, { recursive: true });

	const archived = [];
	for (const changeset of changesets) {
		const source = changesetPath(root, changeset.filename);
		const destination = join(archiveDir, changeset.filename);

		if (existsSync(destination)) {
			throw new Error(`Archived changeset already exists: ${destination}`);
		}

		renameSync(source, destination);
		archived.push(destination);
	}

	return archived;
}

export function assertCanArchiveChangesets(version, changesets, { root = process.cwd() } = {}) {
	const errors = [];

	for (const changeset of changesets) {
		const source = changesetPath(root, changeset.filename);
		const destination = releasedPath(root, version, changeset.filename);

		if (!existsSync(source)) {
			errors.push(`Pending changeset is missing: ${source}`);
		}

		if (existsSync(destination)) {
			errors.push(`Archived changeset already exists: ${destination}`);
		}
	}

	if (errors.length > 0) {
		throw new Error(`Cannot archive changesets:\n${errors.join('\n')}`);
	}
}

export function previewVersionBump({ root = process.cwd(), branchOnly = false, since, date } = {}) {
	const changesets = getValidPendingChangesets({ root, branchOnly, since });
	const currentVersion = readPackageVersion({ root });
	const bumpType = getHighestBumpType(changesets);
	const newVersion = bumpType ? bumpVersion(currentVersion, bumpType) : null;
	const changelogEntry = newVersion
		? generateChangelogEntry(newVersion, changesets, { date })
		: null;

	return {
		currentVersion,
		newVersion,
		bumpType,
		changesets,
		changelogEntry
	};
}

export function consumeChangesetsAndBumpVersion({ root = process.cwd(), date } = {}) {
	const preview = previewVersionBump({ root, date });
	if (preview.changesets.length === 0 || !preview.newVersion || !preview.changelogEntry) {
		return null;
	}

	assertCanArchiveChangesets(preview.newVersion, preview.changesets, { root });
	prependToChangelog(preview.changelogEntry, { root });
	writePackageVersion(preview.newVersion, { root });
	const archived = archiveChangesets(preview.newVersion, preview.changesets, { root });

	return {
		...preview,
		archived
	};
}

export function validatePendingChangesets(options = {}) {
	const pending = readPendingChangesets(options);
	const errors = pending.flatMap((result) => result.errors);

	if (options.requirePending && pending.length === 0) {
		errors.push('No pending changesets found.');
	}

	return errors;
}

export function createChangesetFile(
	{
		filename,
		type,
		category = DEFAULT_CATEGORY_BY_TYPE[type],
		area = '',
		issue = '',
		pr = '',
		summary,
		body = ''
	},
	{ root = process.cwd() } = {}
) {
	const changeset = {
		filename,
		type,
		category,
		area,
		issue,
		pr,
		summary,
		body,
		description: [summary, body].filter(Boolean).join('\n')
	};
	const errors = validateChangeset(changeset);
	if (errors.length > 0) {
		const error = new Error(`Invalid changeset:\n${errors.join('\n')}`);
		error.errors = errors;
		throw error;
	}

	mkdirSync(changesetPath(root), { recursive: true });
	const filePath = changesetPath(root, filename);
	if (existsSync(filePath)) {
		throw new Error(`Changeset already exists: ${filename}`);
	}

	const optionalFields = [
		`type: ${type}`,
		`category: ${category}`,
		area ? `area: ${area}` : '',
		issue ? `issue: ${issue}` : '',
		pr ? `pr: ${pr}` : ''
	].filter(Boolean);

	const content = `---\n${optionalFields.join('\n')}\n---\n\n${changeset.description.trim()}\n`;
	writeFileSync(filePath, content, 'utf-8');
	return filePath;
}

export function slugify(input) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 70);
}

function currentDate() {
	return new Date().toISOString().slice(0, 10);
}

function gitChangedFiles(root, args) {
	const result = spawnSync('git', args, {
		cwd: root,
		stdio: 'pipe',
		encoding: 'utf-8'
	});

	if (result.error || result.status !== 0) {
		const stderr = result.stderr?.trim();
		throw new Error(
			`Could not determine branch changesets: git ${args.join(' ')} failed${stderr ? `: ${stderr}` : ''}`
		);
	}

	return result.stdout
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

function isPendingChangesetPath(file) {
	const parts = file.split('/');
	return (
		parts.length === 2 &&
		parts[0] === CHANGESET_DIR &&
		parts[1].endsWith('.md') &&
		parts[1] !== 'README.md'
	);
}

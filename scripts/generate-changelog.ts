import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { stringify } from 'yaml';

type Commit = {
	hash: string;
	fullHash: string;
	date: string;
	subject: string;
	author: string;
	type: string;
	tag?: string;
};

type Release = {
	tag: string;
	hash: string;
	date: string;
	subject: string;
	author: string;
	commits: Omit<Commit, 'fullHash' | 'tag'>[];
};

type ChangelogData = {
	releases: Release[];
	commits: Omit<Commit, 'fullHash'>[];
	by_type: Record<string, Omit<Commit, 'fullHash'>[]>;
};

function getCommits(): Commit[] {
	try {
		const output = execSync('git log --pretty=format:"%H|%h|%ad|%s|%an" --date=short', {
			encoding: 'utf-8'
		});

		return output
			.trim()
			.split('\n')
			.filter((line) => line)
			.map((line) => {
				const [fullHash, hash, date, subject, author] = line.split('|');
				return {
					fullHash,
					hash,
					date,
					subject,
					author,
					type: extractCommitType(subject)
				};
			});
	} catch {
		console.error('Error getting commits');
		return [];
	}
}

function getTags(): Map<string, string> {
	try {
		const output = execSync('git tag -l --format="%(refname:short)|%(*objectname)"', {
			encoding: 'utf-8'
		});

		const tags = new Map<string, string>();
		output
			.trim()
			.split('\n')
			.filter((line) => line)
			.forEach((line) => {
				const [tagName, commitHash] = line.split('|');
				if (commitHash) {
					tags.set(commitHash, tagName);
				}
			});

		return tags;
	} catch {
		console.error('Error getting tags');
		return new Map();
	}
}

function extractCommitType(subject: string): string {
	// Extract commit type from conventional commit format (type: description)
	const match = subject.match(/^([a-zA-Z]+)(\([^)]+\))?:\s*(.*)/);
	if (match) {
		return match[1];
	}

	// Fallback to categorizing by keywords
	const subjectLower = subject.toLowerCase();

	if (subjectLower.includes('feat') || subjectLower.includes('add')) return 'feat';
	if (subjectLower.includes('fix') || subjectLower.includes('bug')) return 'fix';
	if (subjectLower.includes('doc')) return 'docs';
	if (subjectLower.includes('style') || subjectLower.includes('format')) return 'style';
	if (subjectLower.includes('refactor')) return 'refactor';
	if (subjectLower.includes('perf')) return 'perf';
	if (subjectLower.includes('test')) return 'test';
	if (subjectLower.includes('chore')) return 'chore';
	if (subjectLower.includes('ci')) return 'ci';

	return 'other';
}

function getCommitsSince(tag: string): Commit[] {
	try {
		const output = execSync(
			`git log --pretty=format:"%H|%h|%ad|%s|%an" --date=short ${tag}..HEAD`,
			{
				encoding: 'utf-8'
			}
		);

		if (!output.trim()) return [];

		return output
			.trim()
			.split('\n')
			.filter((line) => line)
			.map((line) => {
				const [fullHash, hash, date, subject, author] = line.split('|');
				return {
					fullHash,
					hash,
					date,
					subject,
					author,
					type: extractCommitType(subject)
				};
			});
	} catch {
		return [];
	}
}

function getCommitsBetween(oldTag: string, newTag: string): Commit[] {
	try {
		const output = execSync(
			`git log --pretty=format:"%H|%h|%ad|%s|%an" --date=short ${oldTag}..${newTag}`,
			{
				encoding: 'utf-8'
			}
		);

		if (!output.trim()) return [];

		return output
			.trim()
			.split('\n')
			.filter((line) => line)
			.map((line) => {
				const [fullHash, hash, date, subject, author] = line.split('|');
				return {
					fullHash,
					hash,
					date,
					subject,
					author,
					type: extractCommitType(subject)
				};
			});
	} catch {
		return [];
	}
}

function getCommitsUpTo(tag: string): Commit[] {
	try {
		const output = execSync(`git log --pretty=format:"%H|%h|%ad|%s|%an" --date=short ${tag}`, {
			encoding: 'utf-8'
		});

		if (!output.trim()) return [];

		return output
			.trim()
			.split('\n')
			.filter((line) => line)
			.map((line) => {
				const [fullHash, hash, date, subject, author] = line.split('|');
				return {
					fullHash,
					hash,
					date,
					subject,
					author,
					type: extractCommitType(subject)
				};
			});
	} catch {
		return [];
	}
}

function groupCommitsByRelease(commits: Commit[], tags: Map<string, string>): Release[] {
	const releases: Release[] = [];

	// Get all tagged commits
	const taggedCommits = commits.filter((c) => tags.has(c.fullHash));

	// Associate tags with commits
	taggedCommits.forEach((commit) => {
		commit.tag = tags.get(commit.fullHash);
	});

	// Check for unversioned commits (commits since the most recent tag)
	if (taggedCommits.length > 0) {
		const mostRecentTag = taggedCommits[0];
		const unversionedCommits = getCommitsSince(mostRecentTag.tag!);
		if (unversionedCommits.length > 0) {
			releases.push({
				tag: 'unversioned',
				hash: unversionedCommits[0].hash,
				date: unversionedCommits[0].date,
				subject: 'Unversioned changes',
				author: '',
				commits: unversionedCommits.map((c) => ({
					hash: c.hash,
					date: c.date,
					subject: c.subject,
					author: c.author,
					type: c.type
				}))
			});
		}
	}

	// Process each tagged release
	taggedCommits.forEach((taggedCommit, i) => {
		let releaseCommits: Commit[];

		if (i === taggedCommits.length - 1) {
			// This is the oldest tag, get all commits up to and including this tag
			releaseCommits = getCommitsUpTo(taggedCommit.tag!);
		} else {
			// Get commits between this tag and the previous tag
			const previousTag = taggedCommits[i + 1];
			releaseCommits = getCommitsBetween(previousTag.tag!, taggedCommit.tag!);
		}

		releases.push({
			tag: taggedCommit.tag!,
			hash: taggedCommit.hash,
			date: taggedCommit.date,
			subject: taggedCommit.subject,
			author: taggedCommit.author,
			commits: releaseCommits.map((c) => ({
				hash: c.hash,
				date: c.date,
				subject: c.subject,
				author: c.author,
				type: c.type
			}))
		});
	});

	return releases;
}

function groupCommitsByType(commits: Commit[]): Record<string, Omit<Commit, 'fullHash'>[]> {
	const groups: Record<string, Omit<Commit, 'fullHash'>[]> = {};

	commits.forEach((commit) => {
		if (!groups[commit.type]) {
			groups[commit.type] = [];
		}
		groups[commit.type].push({
			hash: commit.hash,
			date: commit.date,
			subject: commit.subject,
			author: commit.author,
			type: commit.type,
			tag: commit.tag
		});
	});

	return groups;
}

function generateChangelog() {
	const outputFile = 'src/lib/data/changelog.yaml';

	console.log('Getting commits...');
	const commits = getCommits();

	console.log('Getting tags...');
	const tags = getTags();

	// Associate tags with commits
	commits.forEach((commit) => {
		if (tags.has(commit.fullHash)) {
			commit.tag = tags.get(commit.fullHash);
		}
	});

	console.log('Grouping commits by release...');
	const releases = groupCommitsByRelease(commits, tags);

	console.log('Grouping commits by type...');
	const commitsByType = groupCommitsByType(commits);

	// Prepare data structure
	const changelogData: ChangelogData = {
		releases,
		commits: commits.map((c) => ({
			hash: c.hash,
			date: c.date,
			subject: c.subject,
			author: c.author,
			type: c.type,
			tag: c.tag
		})),
		by_type: commitsByType
	};

	// Generate YAML with comment header
	const now = new Date();
	const header = `# Generated by changelog-generator
# Generated on: ${now.toISOString().replace('T', ' ').split('.')[0]}

`;

	const yamlContent = stringify(changelogData);
	writeFileSync(outputFile, header + yamlContent, 'utf-8');

	console.log(`Wrote ${releases.length} releases and ${commits.length} commits to ${outputFile}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	generateChangelog();
}

export { generateChangelog };

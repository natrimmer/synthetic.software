import { readFileSync } from 'fs';
import { parse } from 'yaml';
import type { PageServerLoad } from './$types';

type Commit = {
	hash: string;
	date: string;
	subject: string;
	author: string;
	type: string;
};

type Release = {
	tag: string;
	hash: string;
	date: string;
	subject: string;
	author: string;
	commits: Commit[];
};

type ChangelogData = {
	releases: Release[];
};

export const load: PageServerLoad = async () => {
	const changelogPath = 'src/lib/data/changelog.yaml';
	const changelogYaml = readFileSync(changelogPath, 'utf-8');
	const changelogData = parse(changelogYaml) as ChangelogData;

	return {
		releases: changelogData.releases || []
	};
};

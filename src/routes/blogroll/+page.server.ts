import { readFileSync } from 'fs';
import { parse } from 'yaml';
import type { PageServerLoad } from './$types';

type BlogrollItem = {
	title: string;
	url: string;
	date: string;
	domain: string;
	feed_url: string;
};

export const load: PageServerLoad = async () => {
	const blogrollPath = 'src/lib/data/blogroll.yaml';
	const blogrollYaml = readFileSync(blogrollPath, 'utf-8');
	const blogrollData = parse(blogrollYaml) as BlogrollItem[];

	return {
		posts: blogrollData || []
	};
};

import { readFileSync } from 'fs';
import { parse } from 'yaml';
import type { PageServerLoad } from './$types';

type BlogrollPost = {
	title: string;
	url: string;
	date: string;
	domain: string;
	feed_url: string;
};

export const load: PageServerLoad = async () => {
	const blogrollPath = 'src/lib/data/blogroll.yaml';
	const blogrollYaml = readFileSync(blogrollPath, 'utf-8');
	const blogrollData = parse(blogrollYaml) as BlogrollPost[];

	// Get unique posts by domain (first post from each domain), limit to 3
	const seenDomains = new Set<string>();
	const uniquePosts: BlogrollPost[] = [];

	for (const post of blogrollData) {
		if (!seenDomains.has(post.domain) && uniquePosts.length < 3) {
			seenDomains.add(post.domain);
			uniquePosts.push(post);
		}
	}

	return {
		blogrollPosts: uniquePosts
	};
};

import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { loadPosts } from '$lib/utils/content';
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

	const articleFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

	const articles = await loadPosts(articleFiles, '/articles');
	const latestArticle = articles[0] ?? null;

	return {
		blogrollPosts: uniquePosts,
		latestArticle: latestArticle ? { title: latestArticle.title, url: latestArticle.url } : null
	};
};

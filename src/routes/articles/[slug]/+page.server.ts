import { getAdjacentPosts, loadPosts } from '$lib/utils/content';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

// This function tells SvelteKit which slugs to prerender at build time
export const entries: EntryGenerator = async () => {
	console.log('[entries] Starting entries function for articles');
	const articleFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string } }>;

	console.log('[entries] Found article files:', Object.keys(articleFiles));

	const posts = await loadPosts(articleFiles, '/articles');

	console.log('[entries] Posts loaded:', posts.length);
	const slugs = posts.map((post) => ({
		slug: post.slug
	}));
	console.log('[entries] Returning slugs:', slugs);

	return slugs;
};

export const load: PageServerLoad = async ({ params }) => {
	const articleFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: { title: string; date: string; updated?: string; tags?: string[] };
			default: unknown;
		}
	>;

	const posts = await loadPosts(articleFiles, '/articles');
	const article = posts.find((p) => p.slug === params.slug);

	if (!article) {
		throw error(404, 'Article not found');
	}

	const { prev, next } = getAdjacentPosts(posts, params.slug);

	return {
		article: {
			slug: params.slug,
			title: article.title,
			date: article.date,
			updated: article.updated,
			tags: article.tags,
			prev: prev
				? {
						title: prev.title,
						url: prev.url
					}
				: null,
			next: next
				? {
						title: next.title,
						url: next.url
					}
				: null
		}
	};
};

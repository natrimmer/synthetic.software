import { loadPosts } from '$lib/utils/content';
import { aggregateTags, getPostsByTag } from '$lib/utils/tags';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

// Generate all tag pages at build time for static prerendering
export const entries: EntryGenerator = async () => {
	console.log('[entries] Starting entries function for tags');

	// Load all content types
	const articleFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

	const noteFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

	const articles = await loadPosts(articleFiles, '/articles');
	const notes = await loadPosts(noteFiles, '/notes');
	const feed = await loadPosts(feedFiles, '/feed');

	// Get all unique tags
	const tags = aggregateTags(articles, notes, feed);

	console.log(
		'[entries] Found tags:',
		tags.map((t) => t.tag)
	);

	// Return tag slugs for prerendering
	return tags.map((tag) => ({
		tag: tag.slug
	}));
};

export const load: PageServerLoad = async ({ params }) => {
	// Load all content types
	const articleFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: { title: string; date: string; updated?: string; tags?: string[] };
			default: unknown;
		}
	>;

	const noteFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: { title: string; date: string; updated?: string; tags?: string[] };
			default: unknown;
		}
	>;

	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: { title: string; date: string; updated?: string; tags?: string[] };
			default: unknown;
		}
	>;

	const articles = await loadPosts(articleFiles, '/articles');
	const notes = await loadPosts(noteFiles, '/notes');
	const feed = await loadPosts(feedFiles, '/feed');

	// Get all posts with this tag
	const posts = getPostsByTag(params.tag, articles, notes, feed);

	if (posts.length === 0) {
		throw error(404, 'Tag not found');
	}

	return {
		tag: params.tag,
		posts: posts.map((post) => ({
			title: post.title,
			url: post.url,
			date: post.date,
			updated: post.updated,
			tags: post.tags,
			slug: post.slug,
			// Determine content type from URL for different rendering
			type: post.url.startsWith('/feed/')
				? 'feed'
				: post.url.startsWith('/notes/')
					? 'notes'
					: 'articles'
		})),
		totalItems: posts.length
	};
};

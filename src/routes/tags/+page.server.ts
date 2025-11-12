import { loadPosts } from '$lib/utils/content';
import { aggregateTags } from '$lib/utils/tags';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Load all content types that have tags
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

	// Aggregate all tags from all content sources
	const tags = aggregateTags(articles, notes, feed);

	return {
		tags: tags.map((tag) => ({
			tag: tag.tag,
			count: tag.count,
			url: `/tags/${tag.slug}/`
		}))
	};
};

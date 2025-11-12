import { getAdjacentPosts, loadPosts } from '$lib/utils/content';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => {
	const noteFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string } }>;

	const posts = await loadPosts(noteFiles, '/notes');

	return posts.map((post) => ({
		slug: post.slug
	}));
};

export const load: PageServerLoad = async ({ params }) => {
	const noteFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: { title: string; date: string; updated?: string; tags?: string[] };
			default: unknown;
		}
	>;

	const posts = await loadPosts(noteFiles, '/notes');
	const note = posts.find((p) => p.slug === params.slug);

	if (!note) {
		throw error(404, 'Note not found');
	}

	const { prev, next } = getAdjacentPosts(posts, params.slug);

	return {
		note: {
			slug: params.slug,
			title: note.title,
			date: note.date,
			updated: note.updated,
			tags: note.tags,
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

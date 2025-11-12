import { loadPosts, paginatePosts } from '$lib/utils/content';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const noteFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

	const posts = await loadPosts(noteFiles, '/notes');
	const paginated = paginatePosts(posts, 1, 10);

	return {
		posts: paginated.posts.map((post) => ({
			title: post.title,
			url: post.url,
			date: post.date,
			updated: post.updated,
			tags: post.tags
		})),
		currentPage: paginated.currentPage,
		totalPages: paginated.totalPages,
		totalItems: paginated.totalPosts
	};
};

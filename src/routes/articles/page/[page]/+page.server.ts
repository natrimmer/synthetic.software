import { redirect } from '@sveltejs/kit';
import { loadPosts, paginatePosts } from '$lib/utils/content';
import type { EntryGenerator, PageServerLoad } from './$types';

const PER_PAGE = 10;

const getArticleFiles = () =>
	import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<string, { metadata: { title: string; date: string; tags?: string[] } }>;

export const entries: EntryGenerator = async () => {
	const posts = await loadPosts(getArticleFiles(), '/articles');
	const totalPages = Math.ceil(posts.length / PER_PAGE);
	return Array.from({ length: totalPages - 1 }, (_, i) => ({ page: String(i + 2) }));
};

export const load: PageServerLoad = async ({ params }) => {
	const page = parseInt(params.page);

	if (isNaN(page) || page < 1) {
		redirect(301, '/articles/');
	}

	if (page === 1) {
		redirect(301, '/articles/');
	}

	const posts = await loadPosts(getArticleFiles(), '/articles');
	const paginated = paginatePosts(posts, page, PER_PAGE);

	if (paginated.posts.length === 0) {
		redirect(301, '/articles/');
	}

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

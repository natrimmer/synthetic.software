/**
 * Content loading utilities for build-time static site generation
 * Uses import.meta.glob to load markdown files at build time
 */

import { compareDatesDesc } from '$lib/utils/date';

export type PostMetadata = {
	title: string;
	date: string;
	updated?: string;
	tags?: string[];
	draft?: boolean;
	[key: string]: unknown;
};

export type Post = {
	slug: string;
	title: string;
	date: string;
	updated?: string;
	tags?: string[];
	content: string;
	url: string;
	metadata: PostMetadata;
};

/**
 * Extract slug from file path
 * @param path - File path like '/content/articles/my-post.svx'
 * @returns slug like 'my-post'
 */
export function getSlugFromPath(path: string): string {
	return (
		path
			.split('/')
			.pop()
			?.replace(/\.svx$/, '') || ''
	);
}

/**
 * Load all posts from a glob pattern
 * @param files - Result from import.meta.glob (with eager: true)
 * @param urlPrefix - URL prefix for posts (e.g., '/articles')
 * @returns Array of posts sorted by date (newest first)
 */
export async function loadPosts(
	files: Record<string, { metadata?: PostMetadata; default?: unknown }>,
	urlPrefix: string
): Promise<Post[]> {
	const posts: Post[] = [];

	for (const [path, module] of Object.entries(files)) {
		const { metadata } = module;

		// Skip if no metadata (file wasn't processed correctly)
		if (!metadata) {
			console.warn(`[loadPosts] Skipping ${path} - no metadata found`);
			continue;
		}

		const slug = getSlugFromPath(path);

		// Skip drafts
		if (metadata.draft) continue;

		// Determine URL based on content type
		let url: string;
		if (urlPrefix === '/feed') {
			// Feed items use date hierarchy: /feed/YYYY/MM/DD/N/
			const match = path.match(/feed\/(.+)\.svx$/);
			const itemPath = match ? match[1] : slug;
			url = `/feed/${itemPath}/`;
		} else {
			// Articles/notes use simple slug-based URLs
			url = `${urlPrefix}/${slug}/`;
		}

		posts.push({
			slug,
			title: metadata.title || slug,
			date: metadata.date || '',
			updated: metadata.updated,
			tags: metadata.tags || [],
			content: '',
			url,
			metadata
		});
	}

	// Sort by date, newest first
	return posts.sort((a, b) => compareDatesDesc(a.date, b.date));
}

/**
 * Paginate an array of posts
 * @param posts - Array of posts
 * @param page - Current page number (1-indexed)
 * @param perPage - Posts per page
 * @returns Paginated posts with metadata
 */
export function paginatePosts(posts: Post[], page: number = 1, perPage: number = 10) {
	const totalPages = Math.ceil(posts.length / perPage);
	const start = (page - 1) * perPage;
	const end = start + perPage;

	return {
		posts: posts.slice(start, end),
		currentPage: page,
		totalPages,
		totalPosts: posts.length,
		hasNext: page < totalPages,
		hasPrev: page > 1
	};
}

/**
 * Get previous and next posts in a collection
 * @param posts - Array of all posts
 * @param currentSlug - Current post slug
 * @returns Previous and next post
 */
export function getAdjacentPosts(posts: Post[], currentSlug: string) {
	const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
	if (currentIndex === -1) return { prev: null, next: null };

	return {
		// In reverse chronological order, prev is newer (lower index)
		prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
		// Next is older (higher index)
		next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
	};
}

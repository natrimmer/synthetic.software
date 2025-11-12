/**
 * Tag utilities for aggregating and managing tags across content types
 */

import type { Post } from './content';
import { compareDatesDesc } from './date';

export type TagInfo = {
	tag: string;
	count: number;
	slug: string;
};

/**
 * Extract all unique tags from multiple content sources
 * @param contentSources - Array of post arrays from different content types
 * @returns Array of tag info sorted alphabetically
 */
export function aggregateTags(...contentSources: Post[][]): TagInfo[] {
	const tagMap = new Map<string, number>();

	for (const posts of contentSources) {
		for (const post of posts) {
			if (post.tags) {
				for (const tag of post.tags) {
					const normalized = tag.toLowerCase().trim();
					tagMap.set(normalized, (tagMap.get(normalized) || 0) + 1);
				}
			}
		}
	}

	return Array.from(tagMap.entries())
		.map(([tag, count]) => ({
			tag,
			count,
			slug: tag
		}))
		.sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * Filter posts by tag
 * @param posts - Array of posts
 * @param tag - Tag to filter by (case-insensitive)
 * @returns Posts that have the specified tag
 */
export function filterPostsByTag(posts: Post[], tag: string): Post[] {
	const normalizedTag = tag.toLowerCase().trim();
	return posts.filter(
		(post) => post.tags?.some((t) => t.toLowerCase().trim() === normalizedTag) || false
	);
}

/**
 * Get all posts from multiple sources filtered by tag
 * @param tag - Tag to filter by
 * @param contentSources - Array of post arrays from different content types
 * @returns All posts with the tag, sorted by date (newest first)
 */
export function getPostsByTag(tag: string, ...contentSources: Post[][]): Post[] {
	const allPosts = contentSources.flat();
	const filtered = filterPostsByTag(allPosts, tag);

	// Sort by date, newest first
	return filtered.sort((a, b) => compareDatesDesc(a.date, b.date));
}

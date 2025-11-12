import { getAdjacentPosts, getSlugFromPath } from '$lib/utils/content';
import { compareDatesDesc } from '$lib/utils/date';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';

type FeedMetadata = {
	title: string;
	date: string;
	tags?: string[];
	draft?: boolean;
};

type IndexMetadata = {
	title: string;
	description?: string;
	type?: string;
};

// This function tells SvelteKit which paths to prerender
export const entries: EntryGenerator = async () => {
	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<string, { metadata: FeedMetadata | IndexMetadata }>;

	const entries = Object.keys(feedFiles)
		.map((path) => {
			const match = path.match(/feed\/(.+)\.svx$/);
			if (!match) return null;

			const itemPath = match[1];

			// Skip _index files - they're handled by directory listings
			if (itemPath.endsWith('/_index') || itemPath === '_index') {
				return null;
			}

			// Only include individual feed items (YYYY/MM/DD/N pattern)
			if (!itemPath.match(/^\d{4}\/\d{2}\/\d{2}\/\d+$/)) {
				return null;
			}

			return {
				path: itemPath // e.g., "2025/07/31/1"
			};
		})
		.filter((entry): entry is { path: string } => entry !== null);

	console.log('[feed entries]', entries.length, 'paths found');
	return entries;
};

export const load: PageServerLoad = async ({ params }) => {
	const path = params.path || '';

	// Check if this is a directory listing (_index page)
	// Directories: empty, YYYY, YYYY/MM, YYYY/MM/DD (0-3 parts)
	// Items: YYYY/MM/DD/N (4 parts)
	const parts = path ? path.split('/') : [];
	const isDirectory = parts.length < 4;

	// Load all feed files
	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<
		string,
		{
			metadata: FeedMetadata | IndexMetadata;
			default: unknown;
		}
	>;

	if (isDirectory) {
		// This is a directory listing page
		const indexFile = Object.entries(feedFiles).find(([filePath]) => {
			if (path === '') {
				return filePath.match(/feed\/_index\.svx$/);
			}
			return filePath.match(new RegExp(`feed/${path}/_index\\.svx$`));
		});

		if (!indexFile) {
			throw error(404, 'Directory listing not found');
		}

		const [, indexModule] = indexFile;
		const indexMetadata = indexModule.metadata as IndexMetadata;

		// Get all feed items in this directory
		const items = Object.entries(feedFiles)
			.filter(([filePath]) => {
				// Exclude _index files
				if (filePath.includes('_index')) return false;
				// Check if file is in this directory
				const match = filePath.match(/feed\/(.+)\.svx$/);
				if (!match) return false;

				const itemPath = match[1];
				// For root, show only direct children (YYYY level)
				if (path === '') {
					return itemPath.match(/^\d{4}\/\d{2}\/\d{2}\/\d+$/);
				}
				// For year level (2025), show all items in that year
				if (path.match(/^\d{4}$/)) {
					return itemPath.startsWith(`${path}/`) && itemPath.match(/^\d{4}\/\d{2}\/\d{2}\/\d+$/);
				}
				// For month level (2025/07), show all items in that month
				if (path.match(/^\d{4}\/\d{2}$/)) {
					return itemPath.startsWith(`${path}/`) && itemPath.match(/^\d{4}\/\d{2}\/\d{2}\/\d+$/);
				}
				// For day level (2025/07/31), show all items on that day
				if (path.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
					return itemPath.startsWith(`${path}/`) && itemPath.match(/^\d{4}\/\d{2}\/\d{2}\/\d+$/);
				}

				return false;
			})
			.map(([filePath, module]) => {
				const metadata = module.metadata as FeedMetadata;
				const match = filePath.match(/feed\/(.+)\.svx$/);
				const itemPath = match![1];
				const slug = getSlugFromPath(filePath);

				return {
					slug,
					title: metadata.title || slug,
					date: metadata.date || '',
					tags: metadata.tags || [],
					url: `/feed/${itemPath}/`,
					path: itemPath
				};
			})
			.sort((a, b) => compareDatesDesc(a.date, b.date));

		return {
			type: 'directory',
			directory: {
				title: indexMetadata.title,
				description: indexMetadata.description,
				path: path || '',
				items: items.map((item) => ({
					title: item.title,
					url: item.url,
					date: item.date,
					tags: item.tags
				}))
			}
		};
	} else {
		// This is an individual feed item
		const posts = Object.entries(feedFiles)
			.filter(([filePath]) => !filePath.includes('_index'))
			.map(([filePath, module]) => {
				const metadata = module.metadata as FeedMetadata;
				if (metadata.draft) return null;

				const match = filePath.match(/feed\/(.+)\.svx$/);
				if (!match) return null;

				const itemPath = match[1];
				const slug = getSlugFromPath(filePath);

				return {
					slug,
					title: metadata.title || slug,
					date: metadata.date || '',
					tags: metadata.tags || [],
					url: `/feed/${itemPath}/`,
					path: itemPath,
					content: '',
					updated: undefined,
					metadata
				};
			})
			.filter((post): post is NonNullable<typeof post> => post !== null)
			.sort((a, b) => compareDatesDesc(a.date, b.date));

		const feedItem = posts.find((p) => p.path === path);

		if (!feedItem) {
			throw error(404, 'Feed item not found');
		}

		const { prev, next } = getAdjacentPosts(posts, feedItem.slug);

		return {
			type: 'item',
			feedItem: {
				slug: feedItem.slug,
				path: feedItem.path,
				title: feedItem.title,
				date: feedItem.date,
				tags: feedItem.tags,
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
	}
};

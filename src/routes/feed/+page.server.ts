import { getSlugFromPath } from '$lib/utils/content';
import { compareDatesDesc } from '$lib/utils/date';
import type { PageServerLoad } from './$types';

type FeedMetadata = {
	title: string;
	date: string;
	tags?: string[];
	draft?: boolean;
};

export const load: PageServerLoad = async () => {
	// Load all feed files
	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<string, { metadata: FeedMetadata }>;

	const posts = Object.entries(feedFiles)
		.map(([filePath, module]) => {
			const { metadata } = module;
			if (!metadata || metadata.draft) return null;

			// Extract the path pattern: YYYY/MM/DD/N
			const match = filePath.match(/feed\/(.+)\.svx$/);
			if (!match) return null;

			const itemPath = match[1];

			// Skip _index files (these are directory listings, not feed items)
			if (itemPath.includes('_index')) return null;
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
		.filter((post): post is NonNullable<typeof post> => post !== null)
		.sort((a, b) => compareDatesDesc(a.date, b.date));

	return {
		posts: posts.map((post) => ({
			title: post.title,
			url: post.url,
			date: post.date,
			tags: post.tags
		})),
		totalItems: posts.length
	};
};

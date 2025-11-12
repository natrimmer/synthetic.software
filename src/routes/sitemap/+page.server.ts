import { getSlugFromPath } from '$lib/utils/content';
import { compareDatesDesc } from '$lib/utils/date';
import type { PageServerLoad } from './$types';

type PageMetadata = {
	title: string;
	date?: string;
};

export const load: PageServerLoad = async () => {
	// Load all content
	const articlesFiles = import.meta.glob('$content/articles/*.svx', {
		eager: true
	}) as Record<string, { metadata: PageMetadata }>;

	const notesFiles = import.meta.glob('$content/notes/*.svx', {
		eager: true
	}) as Record<string, { metadata: PageMetadata }>;

	const feedFiles = import.meta.glob('$content/feed/**/*.svx', {
		eager: true
	}) as Record<string, { metadata: PageMetadata }>;

	// Get articles
	const articles = Object.entries(articlesFiles)
		.map(([path, module]) => ({
			title: module.metadata.title || getSlugFromPath(path),
			slug: getSlugFromPath(path)
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	// Get notes
	const notes = Object.entries(notesFiles)
		.map(([path, module]) => ({
			title: module.metadata.title || getSlugFromPath(path),
			slug: getSlugFromPath(path)
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	// Get feed items (excluding _index files)
	const feedItems = Object.entries(feedFiles)
		.filter(([path]) => !path.includes('_index'))
		.map(([path, module]) => {
			const match = path.match(/feed\/(.+)\.svx$/);
			const itemPath = match ? match[1] : '';
			return {
				title: module.metadata.title || getSlugFromPath(path),
				path: itemPath,
				date: module.metadata.date || ''
			};
		})
		.sort((a, b) => compareDatesDesc(a.date, b.date));

	// Group feed by year/month
	const feedByYear = new Map<string, Map<string, typeof feedItems>>();
	feedItems.forEach((item) => {
		if (!item.date) return;
		const date = new Date(item.date);
		const year = date.getFullYear().toString();
		const month = String(date.getMonth() + 1).padStart(2, '0');

		if (!feedByYear.has(year)) {
			feedByYear.set(year, new Map());
		}
		const yearMap = feedByYear.get(year)!;
		if (!yearMap.has(month)) {
			yearMap.set(month, []);
		}
		yearMap.get(month)!.push(item);
	});

	// Main pages
	const mainPages = [
		{ title: 'about', url: '/about/' },
		{ title: 'blogroll', url: '/blogroll/' },
		{ title: 'changelog', url: '/changelog/' },
		{ title: 'contact', url: '/contact/' },
		{ title: 'sitemap', url: '/sitemap/' }
	];

	return {
		mainPages,
		articles,
		notes,
		feedByYear: Array.from(feedByYear.entries()).map(([year, months]) => ({
			year,
			months: Array.from(months.entries()).map(([month, items]) => ({
				month,
				items
			}))
		})),
		totalFeedItems: feedItems.length
	};
};

import { getSlugFromPath } from '$lib/utils/content';
import type { PageServerLoad } from './$types';

type PageMetadata = {
	title: string;
	date?: string;
};

export const load: PageServerLoad = async () => {
	// Load all content
	const articlesFiles = import.meta.glob('$content/articles/*.org', {
		eager: true
	}) as Record<string, { metadata: PageMetadata }>;

	const notesFiles = import.meta.glob('$content/notes/*.org', {
		eager: true
	}) as Record<string, { metadata: PageMetadata }>;

	const isDraft = (path: string) => path.split('/').pop()?.startsWith('draft.') ?? false;

	// Get articles
	const articles = Object.entries(articlesFiles)
		.filter(([path]) => !isDraft(path))
		.map(([path, module]) => ({
			title: module.metadata.title || getSlugFromPath(path),
			slug: getSlugFromPath(path)
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

	// Get notes
	const notes = Object.entries(notesFiles)
		.filter(([path]) => !isDraft(path))
		.map(([path, module]) => ({
			title: module.metadata.title || getSlugFromPath(path),
			slug: getSlugFromPath(path)
		}))
		.sort((a, b) => a.title.localeCompare(b.title));

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
		notes
	};
};

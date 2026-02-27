import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({
			fallback: '404.html',
			pages: 'build',
			assets: 'build',
			strict: true
		}),
		paths: {
			relative: false
		},
		alias: {
			$content: './src/content'
		},
		prerender: {
			// Explicitly list routes to prerender
			entries: ['*', '/articles', '/notes', '/feed'],
			// Handle routes that aren't linked from the homepage
			handleMissingId: 'warn',
			handleUnseenRoutes: 'ignore',
			handleHttpError: ({ status, path, message }) => {
				// Ignore 404s for tag pages that don't exist yet
				if (status === 404 && path.startsWith('/tags/')) {
					return;
				}
				console.error(`[handleHttpError] ${status} ${path}${message ? `: ${message}` : ''}`);
				throw new Error(`${status} ${path}`);
			}
		}
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;

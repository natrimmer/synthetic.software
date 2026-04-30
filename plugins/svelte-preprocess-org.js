/**
 * Svelte preprocessor for Org-mode files.
 * Converts .org files into Svelte modules exposing:
 *   - `metadata` (extracted from #+TITLE, #+DATE, #+UPDATED, #+FILETAGS, #+DRAFT)
 *   - a default component that renders the org content as HTML
 *
 * Plug into svelte.config.js preprocess array and add '.org' to extensions.
 */

import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import uniorgRehype from 'uniorg-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Strip org timestamp brackets and return only the date portion (YYYY-MM-DD).
 * Handles: "2026-03-20", "<2026-03-20 Thu>", "[2026-03-20 Thu]"
 * @param {string} value
 * @returns {string}
 */
function parseOrgDate(value) {
	return value
		.replace(/[<>[\]]/g, '')
		.trim()
		.split(' ')[0];
}

/**
 * Walk a uniorg AST and extract file-level keyword values.
 * Parses once; both metadata extraction and hast conversion use the same tree.
 * @param {import('uniorg').OrgData} tree
 * @returns {{ title?: string, date?: string, updated?: string, tags?: string[], draft?: boolean }}
 */
function extractKeywords(tree) {
	const meta = {};

	function walk(node) {
		if (node.type === 'keyword') {
			switch (node.key.toUpperCase()) {
				case 'TITLE':
					meta.title = node.value;
					break;
				case 'DATE':
					meta.date = parseOrgDate(node.value);
					break;
				case 'UPDATED':
					meta.updated = parseOrgDate(node.value);
					break;
				case 'FILETAGS':
					// :tag1:tag2:tag3: → ['tag1', 'tag2', 'tag3']
					meta.tags = node.value.split(':').filter(Boolean);
					break;
				case 'DRAFT':
					meta.draft = node.value.toLowerCase() === 'true';
					break;
			}
		}
		if (Array.isArray(node.children)) {
			node.children.forEach(walk);
		}
	}

	walk(tree);
	return meta;
}

/**
 * @returns {import('@sveltejs/kit').Preprocessor}
 */
export function orgPreprocessor() {
	// Both pipelines share the same parser instance.
	// The toHast transformer accepts a pre-parsed tree directly,
	// so we parse once and branch: keywords from the tree, HTML from the tree.
	const parser = unified().use(uniorgParse);
	const toHast = unified().use(uniorgRehype);
	const stringify = unified().use(rehypeStringify);

	return {
		name: 'svelte-preprocess-org',
		async markup({ content, filename }) {
			if (!filename?.endsWith('.org')) return;

			// Parse once.
			const tree = parser.parse(content);

			// Branch 1: extract metadata from keyword nodes.
			const metadata = extractKeywords(tree);

			// Branch 2: org AST → hast → HTML string.
			// Run as a two-step pipeline so we can pass the already-parsed tree.
			const hast = toHast.runSync(tree);
			const html = stringify.stringify(hast);

			// Escape </script> to prevent Svelte's template parser from closing
			// the module script block early (e.g. in code examples showing HTML).
			const safeHtml = html.replace(/<\/script>/gi, '<\\/script>');

			// JSON.stringify produces valid JS string literals — safe embedding
			// regardless of quotes, backticks, or dollar signs in content.
			const code = `<script module>
  export const metadata = ${JSON.stringify(metadata)};
</script>

{@html ${JSON.stringify(safeHtml)}}
`;

			return { code };
		}
	};
}

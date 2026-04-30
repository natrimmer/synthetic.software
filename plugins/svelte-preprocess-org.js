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

// Single pipeline: parse → hast → HTML.
// allowDangerousHtml required for #+BEGIN_EXPORT html blocks to pass through unescaped.
const processor = unified()
	.use(uniorgParse)
	.use(uniorgRehype)
	.use(rehypeStringify, { allowDangerousHtml: true });

// Separate parser for metadata extraction (avoids touching the hast pipeline).
const metaParser = unified().use(uniorgParse);

/**
 * @returns {import('@sveltejs/kit').Preprocessor}
 */
export function orgPreprocessor() {
	return {
		name: 'svelte-preprocess-org',
		async markup({ content, filename }) {
			if (!filename?.endsWith('.org')) return;

			// Extract metadata from keyword nodes.
			const tree = metaParser.parse(content);
			const metadata = extractKeywords(tree);

			// org → HTML via full pipeline.
			// Using processor.process() (not runSync+stringify) — the only
			// documented path that guarantees raw nodes from #+BEGIN_EXPORT html
			// are passed through correctly by rehype-stringify.
			const result = await processor.process(content);
			const html = String(result.value);

			// Escape </script> to prevent Svelte's template parser from treating
			// it as the end of the module script block.
			const safeHtml = html.replace(/<\/script>/gi, '<\\/script>');

			// JSON.stringify produces a valid JS string literal regardless of
			// quotes, backticks, or dollar signs in the content.
			const code = `<script module>
  export const metadata = ${JSON.stringify(metadata)};
</script>

{@html ${JSON.stringify(safeHtml)}}
`;

			return { code };
		}
	};
}

import { readFileSync } from 'fs';
import { resolve } from 'path';

async function lintProse(filePath: string) {
	const harper = await import('harper.js');

	// Construct the linter to consume American English
	const linter = new harper.LocalLinter({
		binary: harper.binary,
		dialect: harper.Dialect.American
	});

	console.log(`\nLinting: ${filePath}\n`);

	// Read the file
	const absolutePath = resolve(filePath);
	let content: string;

	try {
		content = readFileSync(absolutePath, 'utf-8');
	} catch (error) {
		console.error(`Error reading file: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	}

	// Extract content from frontmatter if it's a .svx file
	let textToLint = content;
	if (filePath.endsWith('.svx') || filePath.endsWith('.md')) {
		const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n([\s\S]*)$/;
		const match = content.match(frontmatterRegex);
		if (match) {
			textToLint = match[1];
		}
	}

	// Strip HTML tags for cleaner linting
	const cleanText = textToLint
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (!cleanText) {
		console.log('No content to lint (file may be empty or only contain frontmatter).\n');
		return;
	}

	// Lint the content
	const lints = await linter.lint(cleanText);

	if (lints.length === 0) {
		console.log('✓ No issues found!\n');
		return;
	}

	console.log(`Found ${lints.length} issue(s):\n`);

	for (const lint of lints) {
		const span = lint.span();
		const contextStart = Math.max(0, span.start - 20);
		const contextEnd = Math.min(cleanText.length, span.end + 20);
		const context = cleanText.substring(contextStart, contextEnd);
		const issue = cleanText.substring(span.start, span.end);

		console.log(`📍 Position ${span.start}:${span.end}`);
		console.log(`   Issue: "${issue}"`);
		console.log(`   Message: ${lint.message()}`);
		console.log(`   Context: ...${context}...`);

		if (lint.suggestion_count() !== 0) {
			console.log('   Suggestions:');
			for (const sug of lint.suggestions()) {
				const action = sug.kind() === 1 ? 'Remove' : 'Replace with';
				console.log(`     - ${action}: "${sug.get_replacement_text()}"`);
			}
		}

		console.log('');
	}

	console.log(`Summary: ${lints.length} issue(s) found\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	const filePath = process.argv[2];

	if (!filePath) {
		console.error('Usage: lint-prose <file-path>');
		console.error('Example: lint-prose src/content/articles/blogroll.svx');
		process.exit(1);
	}

	lintProse(filePath);
}

export { lintProse };

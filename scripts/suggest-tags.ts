import { readFileSync } from 'fs';
import { parse } from 'yaml';

type Post = {
	path: string;
	title: string;
	current_tags: string[];
	needs_tagging: boolean;
	content_preview: string;
};

type TagsData = {
	all_tags: string[];
	posts: Post[];
};

async function callClaudeAPI(
	content: string,
	title: string,
	existingTags: string[]
): Promise<string[]> {
	const apiKey = process.env.ANTHROPIC_API_KEY;

	if (!apiKey) {
		throw new Error('ANTHROPIC_API_KEY environment variable not set');
	}

	const prompt = `You are a content tagging assistant. Your job is to suggest relevant tags for blog posts and articles.

I have a post titled "${title}" with the following content:

${content}

Here are all the existing tags used across the blog:
${existingTags.join(', ')}

Please suggest 3-6 relevant tags for this post. Follow these guidelines:
1. STRONGLY prefer reusing existing tags from the list above to maintain consistency
2. Only suggest new tags if the existing tags genuinely don't capture important topics
3. Tags should be lowercase, hyphenated (e.g., "web-development", not "Web Development")
4. Keep tags concise and specific
5. Prioritize technical topics, frameworks, and key concepts

Respond with ONLY a comma-separated list of tags, nothing else.`;

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-haiku-4-5-20251001',
			max_tokens: 200,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Claude API error: ${response.status} - ${errorText}`);
	}

	const data = await response.json();
	const suggestedTagsText = data.content[0].text.trim();

	// Parse comma-separated tags
	const tags = suggestedTagsText
		.split(',')
		.map((tag) => tag.trim().toLowerCase())
		.filter((tag) => tag.length > 0);

	return tags;
}

async function suggestTags() {
	const tagsFile = 'src/lib/data/tags.yaml';

	console.log('Reading tags analysis...');
	const yamlContent = readFileSync(tagsFile, 'utf-8');
	const data = parse(yamlContent) as TagsData;

	const untaggedPosts = data.posts.filter((post) => post.needs_tagging);

	if (untaggedPosts.length === 0) {
		console.log('\n✓ All posts are already tagged!');
		return;
	}

	console.log(`\nFound ${untaggedPosts.length} untagged posts\n`);
	console.log('Generating tag suggestions...\n');

	for (const post of untaggedPosts) {
		console.log(`📄 ${post.path}`);
		console.log(`   Title: ${post.title}`);

		// Skip posts with no content
		if (!post.content_preview || post.content_preview.trim().length === 0) {
			console.log(`   ⚠ Skipped: No content available`);
			console.log('');
			continue;
		}

		try {
			const suggestedTags = await callClaudeAPI(post.content_preview, post.title, data.all_tags);

			console.log(`   ✓ Suggested tags: ${suggestedTags.join(', ')}`);
			console.log(`   Copy-paste format: tags: [${suggestedTags.map((t) => `"${t}"`).join(', ')}]`);
		} catch (error) {
			console.log(`   ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
		}

		console.log('');
	}

	console.log('Done!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	suggestTags();
}

export { suggestTags };

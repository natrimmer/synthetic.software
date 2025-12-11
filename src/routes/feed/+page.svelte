<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Dynamically import all feed content components
	const contentModules = import.meta.glob('$content/feed/**/*.svx', { eager: true }) as Record<
		string,
		{ default: Component }
	>;

	function getContentComponent(url: string): Component | null {
		// Extract path from URL (e.g., /feed/2025/07/31/1/ -> 2025/07/31/1)
		const match = url.match(/\/feed\/(.+?)\/?$/);
		if (!match) return null;

		const path = match[1];
		const contentPath = Object.keys(contentModules).find((p) => p.includes(`/${path}.svx`));
		return contentPath ? contentModules[contentPath].default : null;
	}
</script>

{#if data.posts.length === 0}
	<p class="text-mondrian_dark_gray">No feed items yet.</p>
{:else}
	<div class="overflow-x-auto font-mono text-xs sm:text-sm">
		{#each data.posts as post (post.url)}
			{@const ContentComponent = getContentComponent(post.url)}
			<article class="mb-4 last:mb-0">
				<!-- Log header line -->
				<div class="mb-1 flex flex-wrap items-start gap-1">
					<span class="text-mondrian_red">[{post.date}]</span>
					<a
						href={resolve(post.url as '/')}
						class="text-mondrian_blue transition-colors hover:text-mondrian_yellow hover:underline"
					>
						entry={post.title}
					</a>
					{#if post.tags && post.tags.length > 0}
						<span>tags=[</span>
						{#each post.tags as tag, i (tag)}
							{#if i > 0}<span>,</span>{/if}
							<a
								href={resolve(`/tags/${tag}/` as '/')}
								class="decoration-mondrian_yellow transition-colors hover:text-mondrian_yellow hover:underline"
							>
								{tag}
							</a>
						{/each}
						<span>]</span>
					{/if}
				</div>
				<!-- Content inline display -->
				{#if ContentComponent}
					<div class="flex items-start gap-2">
						<span class="shrink-0 font-bold text-mondrian_dark_gray">›</span>
						<div class="flex-1">
							<ContentComponent />
						</div>
					</div>
				{/if}
			</article>
		{/each}
	</div>
{/if}

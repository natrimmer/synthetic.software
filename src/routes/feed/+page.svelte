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

<div>
	<div
		class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_black decoration-6 sm:text-3xl sm:decoration-8"
		>
			Feed
		</h3>
		<div class="text-left sm:text-right">
			<span class="h-max">
				<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
					{data.totalItems}
					{data.totalItems === 1 ? 'item' : 'items'}
				</p>
			</span>
		</div>
	</div>
</div>

{#if data.posts.length === 0}
	<p class="mt-4 text-mondrian_dark_gray">No feed items yet.</p>
{:else}
	<section class="mt-4">
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
	</section>
{/if}

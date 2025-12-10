<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDate } from '$lib/utils/date';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Dynamically import all feed content components
	const contentModules = import.meta.glob('$content/feed/**/*.svx', { eager: true }) as Record<
		string,
		{ default: Component }
	>;

	const Content = $derived(
		data.type === 'item' && data.feedItem
			? (() => {
					const contentPath = Object.keys(contentModules).find((p) =>
						p.includes(`/${data.feedItem!.path}.svx`)
					);
					return contentPath ? contentModules[contentPath].default : null;
				})()
			: null
	);

	function getContentComponent(url: string): Component | null {
		// Extract path from URL (e.g., /feed/2025/07/31/1/ -> 2025/07/31/1)
		const match = url.match(/\/feed\/(.+?)\/?$/);
		if (!match) return null;

		const path = match[1];
		const contentPath = Object.keys(contentModules).find((p) => p.includes(`/${path}.svx`));
		return contentPath ? contentModules[contentPath].default : null;
	}
</script>

{#if data.type === 'directory' && data.directory}
	{#if data.directory.items.length === 0}
		<p class="mt-4 text-mondrian_dark_gray">No feed items in this period.</p>
	{:else}
		<section class="mt-4 mb-4">
			<div class="overflow-x-auto font-mono text-xs sm:text-sm">
				{#each data.directory.items as post (post.url)}
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
{:else if data.type === 'item' && data.feedItem}
	<!-- Individual feed item page -->
	<div
		class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3 class="text-2xl font-semibold sm:text-3xl">{data.feedItem.title}</h3>
		<span class="h-max">
			<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
				posted: {formatDate(data.feedItem.date)}
			</p>
		</span>
	</div>
	<hr />
	<article class="mt-4 border-b border-mondrian_light_gray">
		<div class="mb-4 text-base leading-relaxed sm:text-sm">
			{#if Content}
				<Content />
			{:else}
				<p>Content not available</p>
			{/if}
		</div>
		{#if data.feedItem.tags && data.feedItem.tags.length > 0}
			<footer class="mb-4 flex flex-wrap gap-2">
				{#each data.feedItem.tags as tag (tag)}
					<a
						href={resolve(`/tags/${tag}/` as '/')}
						class="border border-mondrian_black bg-mondrian_white px-2 py-1 font-mono text-sm shadow-mondrian transition-colors hover:border-mondrian_black hover:bg-mondrian_yellow focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:text-xs"
					>
						#{tag}</a
					>
				{/each}
			</footer>
		{/if}
	</article>
	<nav class="mt-4">
		<div class="flex items-center justify-between">
			<div>
				{#if data.feedItem.prev}
					<a
						href={resolve(data.feedItem.prev.url as '/')}
						class="border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
					>
						← {data.feedItem.prev.title}</a
					>
				{/if}
			</div>
			<div>
				{#if data.feedItem.next}
					<a
						href={resolve(data.feedItem.next.url as '/')}
						class="border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
					>
						{data.feedItem.next.title} →</a
					>
				{/if}
			</div>
		</div>
	</nav>
{/if}

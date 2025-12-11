<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDate } from '$lib/utils/date';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const article = data.article;

	// Dynamically import the content component based on slug
	const contentModules = import.meta.glob('$content/articles/*.svx', { eager: true }) as Record<
		string,
		{ default: Component }
	>;

	const contentPath = Object.keys(contentModules).find((p) => p.includes(`/${article.slug}.svx`));
	const Content = contentPath ? contentModules[contentPath].default : null;
</script>

<div class="w-full">
	<div
		class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3 class="max-w-2/3 text-2xl font-semibold sm:text-3xl">{article.title}</h3>
		<span class="h-max">
			<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
				posted: {formatDate(article.date)}
			</p>
			{#if article.updated && article.updated !== article.date}
				<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
					updated: {formatDate(article.updated)}
				</p>
			{/if}
		</span>
	</div>
	<hr />
	<article class="mt-4">
		<div class="prose prose-sm mb-4 max-w-none text-base leading-relaxed sm:text-sm">
			{#if Content}
				<Content />
			{:else}
				<p>Content not available</p>
			{/if}
		</div>
		{#if article.tags && article.tags.length > 0}
			<footer class="flex flex-wrap gap-2">
				{#each article.tags as tag (tag)}
					<a
						href={resolve(`/tags/${tag}/` as '/')}
						class="border border-mondrian_black bg-mondrian_white px-2 py-1 font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_yellow focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:text-xs"
					>
						#{tag}</a
					>
				{/each}
			</footer>
		{/if}
	</article>
	<nav class="mt-4 border-t border-gray-300 pt-4">
		<h2 class="mb-2 text-lg font-bold sm:text-xl">Other articles:</h2>
		<div class="grid grid-cols-2 gap-4">
			<div class="min-w-0">
				{#if article.prev}
					<a
						href={resolve(article.prev.url as '/')}
						class="flex min-w-0 items-center gap-1 border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
						title={article.prev.title}
					>
						<span class="shrink-0">←</span>
						<span class="min-w-0 truncate">{article.prev.title}</span></a
					>
				{/if}
			</div>
			<div class="flex min-w-0 justify-end">
				{#if article.next}
					<a
						href={resolve(article.next.url as '/')}
						class="flex max-w-full min-w-0 items-center gap-1 border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
						title={article.next.title}
					>
						<span class="min-w-0 truncate">{article.next.title}</span>
						<span class="shrink-0">→</span></a
					>
				{/if}
			</div>
		</div>
	</nav>
</div>

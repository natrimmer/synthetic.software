<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDate } from '$lib/utils/date';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const note = data.note;

	// Dynamically import the content component based on slug
	const contentModules = import.meta.glob('$content/notes/*.svx', { eager: true }) as Record<
		string,
		{ default: Component }
	>;

	const contentPath = Object.keys(contentModules).find((p) => p.includes(`/${note.slug}.svx`));
	const Content = contentPath ? contentModules[contentPath].default : null;
</script>

<div
	class="mb-4 w-full border border-mondrian_white p-4 transition-colors hover:border-mondrian_black hover:bg-mondrian_white"
>
	<div
		class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3 class="text-2xl font-semibold sm:text-3xl">{note.title}</h3>
		<span class="h-max">
			<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
				posted: {formatDate(note.date)}
			</p>
			{#if note.updated && note.updated !== note.date}
				<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
					updated: {formatDate(note.updated)}
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
		{#if note.tags && note.tags.length > 0}
			<footer class="flex flex-wrap gap-2">
				{#each note.tags as tag (tag)}
					<a
						href={resolve(`/tags/${tag}/` as '/')}
						class="border border-mondrian_black bg-mondrian_white px-2 py-1 font-mono text-sm text-mondrian_black shadow-mondrian transition-colors hover:bg-mondrian_yellow focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:text-xs"
					>
						#{tag}</a
					>
				{/each}
			</footer>
		{/if}
	</article>
	<nav class="mt-4 border-t border-gray-300 pt-4">
		<div class="flex items-center justify-between">
			<div>
				{#if note.prev}
					<a
						href={resolve(note.prev.url as '/')}
						class="border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm text-mondrian_black shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
					>
						← {note.prev.title}</a
					>
				{/if}
			</div>
			<div>
				{#if note.next}
					<a
						href={resolve(note.next.url as '/')}
						class="border border-mondrian_black bg-mondrian_white px-3 py-2 font-mono text-sm text-mondrian_black shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue sm:px-2 sm:py-1 sm:text-xs"
					>
						{note.next.title} →</a
					>
				{/if}
			</div>
		</div>
	</nav>
</div>

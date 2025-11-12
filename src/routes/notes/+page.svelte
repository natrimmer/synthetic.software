<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const notes = data.posts;
	const currentPage = data.currentPage;
	const totalPages = data.totalPages;
	const totalItems = data.totalItems;
</script>

<svelte:head>
	<title>Notes - synthetic.software</title>
	<meta name="description" content="Curated links, observations, and quick thoughts" />
</svelte:head>

<div>
	<div class="flex w-full items-end justify-between">
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_blue decoration-6 sm:text-3xl sm:decoration-8"
		>
			Notes
		</h3>
		<div class="mb-1 text-right">
			<span class="h-max pb-1">
				<p class="font-mono text-xs text-mondrian_dark_gray">
					{totalItems}
					{totalItems === 1 ? 'item' : 'items'}
				</p>
			</span>
		</div>
	</div>
</div>

{#if notes.length > 0}
	<section class="mt-4">
		{#each notes as note (note.url)}
			<ArticleCard article={note} />
		{/each}

		<Pagination {currentPage} {totalPages} baseUrl="/notes/" />
	</section>
{:else}
	<p class="mt-4 text-mondrian_dark_gray">No notes yet.</p>
{/if}

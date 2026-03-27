<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const notes = data.posts;
	const currentPage = data.currentPage;
	const totalPages = data.totalPages;
</script>

{#if notes.length > 0}
	{#each notes as note, i (note.url)}
		<ArticleCard article={note} isLast={i === notes.length - 1} />
	{/each}

	<Pagination {currentPage} {totalPages} baseUrl="/notes/" />
{:else}
	<p class="mt-4 text-mondrian_dark_gray">No notes yet.</p>
{/if}

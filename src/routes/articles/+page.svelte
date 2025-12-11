<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const articles = data.posts;
	const currentPage = data.currentPage;
	const totalPages = data.totalPages;
</script>

{#if articles.length > 0}
	{#each articles as article, i (article.url)}
		<ArticleCard {article} isLast={i === articles.length - 1} />
	{/each}

	<Pagination {currentPage} {totalPages} baseUrl="/articles/" />
{:else}
	<p class="mt-4 text-mondrian_dark_gray">No articles yet.</p>
{/if}

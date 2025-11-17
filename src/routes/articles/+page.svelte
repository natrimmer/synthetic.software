<script lang="ts">
	import ArticleCard from '$lib/components/ArticleCard.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const articles = data.posts;
	const currentPage = data.currentPage;
	const totalPages = data.totalPages;
	const totalItems = data.totalItems;
</script>

<svelte:head>
	<meta name="description" content="Technical articles and long-form writing" />
</svelte:head>

<div>
	<div class="flex w-full items-end justify-between">
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_red decoration-6 sm:text-3xl sm:decoration-8"
		>
			Articles
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

{#if articles.length > 0}
	<section class="mt-4">
		{#each articles as article, i (article.url)}
			<ArticleCard {article} isLast={i === articles.length - 1} />
		{/each}

		<Pagination {currentPage} {totalPages} baseUrl="/articles/" />
	</section>
{:else}
	<p class="mt-4 text-mondrian_dark_gray">No articles yet.</p>
{/if}

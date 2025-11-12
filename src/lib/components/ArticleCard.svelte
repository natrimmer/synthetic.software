<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDate } from '$lib/utils/date';

	type Article = {
		title: string;
		url: string;
		date: string;
		updated?: string;
		tags?: string[];
	};

	let { article }: { article: Article } = $props();
</script>

<article
	class="mb-2 border border-mondrian_white p-2 transition-colors hover:border-mondrian_black hover:bg-mondrian_bright_white"
>
	<div class="flex flex-col">
		<div class="mb-1 flex items-center gap-3">
			<h4 class="text-lg font-medium">{article.title}</h4>
			<div
				class="hidden flex-1 border-b border-dotted border-mondrian_black opacity-40 md:flex"
			></div>
			<a
				href={resolve(article.url as '/')}
				class="shrink-0 border border-mondrian_black bg-mondrian_white px-2 py-1 text-center font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_bright_white"
			>
				read →
			</a>
		</div>
		<footer class="font-mono text-xs text-mondrian_dark_gray">
			<div class="flex flex-wrap items-center gap-2">
				<span class="whitespace-nowrap">posted: {formatDate(article.date)}</span>
				{#if article.updated && article.updated !== article.date}
					<span class="whitespace-nowrap">updated: {formatDate(article.updated)}</span>
				{/if}
				{#if article.tags}
					{#each article.tags as tag (tag)}
						<a
							href={resolve(`/tags/${tag}/` as '/')}
							class="whitespace-nowrap decoration-mondrian_yellow transition-colors hover:text-mondrian_black hover:underline"
						>
							#{tag}
						</a>
					{/each}
				{/if}
			</div>
		</footer>
	</div>
</article>

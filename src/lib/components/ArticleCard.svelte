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

	let { article, isLast = false }: { article: Article; isLast?: boolean } = $props();

	// Generate a long string of dots that will be clipped by CSS
	const dotString = '.'.repeat(300);
</script>

<article
	class="group relative mb-1 overflow-hidden p-0 font-mono text-sm leading-relaxed uppercase"
	class:border-b={!isLast}
	class:border-mondrian_dark_gray={!isLast}
>
	<div class="relative">
		<div class="article-grid">
			<a
				href={resolve(article.url as '/')}
				class="article-title transition-colors hover:text-mondrian_yellow"
			>
				{article.title}
			</a>
			<span class="dot-leader" aria-hidden="true">
				{dotString}
			</span>
			<a
				href={resolve(article.url as '/')}
				class="article-date tabular-nums transition-colors hover:text-mondrian_yellow"
			>
				{formatDate(article.date)}
			</a>
		</div>

		<!-- Optional metadata footer (subdued) -->
		{#if (article.updated && article.updated !== article.date) || article.tags}
			<footer class="py-1 font-mono text-xs text-mondrian_dark_gray normal-case">
				<div class="flex items-start justify-between">
					<!-- Left side: Tags -->
					{#if article.tags}
						<div class="flex flex-wrap items-center gap-2">
							<span class="text-mondrian_blue">tags:</span>
							{#each article.tags as tag (tag)}
								<a
									href={resolve(`/tags/${tag}/` as '/')}
									class="whitespace-nowrap text-mondrian_yellow transition-colors hover:text-mondrian_bright_white hover:underline"
								>
									{tag}
								</a>
							{/each}
						</div>
					{/if}

					<!-- Right side: Updated date -->
					{#if article.updated && article.updated !== article.date}
						<span class="shrink-0 whitespace-nowrap tabular-nums">
							<span class="text-mondrian_blue">upd:</span>
							{formatDate(article.updated)}
						</span>
					{/if}
				</div>
			</footer>
		{/if}
	</div>
</article>

<style>
	.article-grid {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 0.5rem;
		align-items: baseline;
	}

	.article-title {
		white-space: nowrap;
	}

	.dot-leader {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: clip;
		letter-spacing: 0.15em;
	}

	.article-date {
		white-space: nowrap;
	}
</style>

<script lang="ts">
	import { formatDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.posts && data.posts.length > 0}
	{#each data.posts as post (post.url)}
		<article
			class="mb-1 border-b border-mondrian_dark_gray pb-2 transition-colors last:border-b-0 last:pb-0"
		>
			<div class="flex items-baseline justify-between gap-4">
				<a
					href={post.url}
					class="font-mono text-sm font-semibold transition-colors hover:text-mondrian_blue hover:underline"
				>
					{post.title}
				</a>
				<div class="flex shrink-0 flex-col text-right font-mono text-xs text-mondrian_dark_gray">
					<span>
						{formatDate(post.date)}
					</span>
					{#if post.updated && post.updated !== post.date}
						<span class="mt-1">
							updated: {formatDate(post.updated)}
						</span>
					{/if}
				</div>
			</div>
		</article>
	{/each}
{:else}
	<p class="text-sm text-mondrian_dark_gray">No items found with this tag.</p>
{/if}

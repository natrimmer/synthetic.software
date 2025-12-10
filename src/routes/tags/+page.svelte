<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.tags && data.tags.length > 0}
	<div class="flex flex-wrap gap-2 font-mono">
		{#each data.tags as { tag, count, url } (tag)}
			<a
				href={url}
				class="w-max border border-mondrian_black bg-mondrian_white px-1 py-1 text-center font-mono text-sm transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue"
			>
				#{tag}
				<span class="text-sm">
					[{count}
					{count === 1 ? 'item' : 'items'}]
				</span>
			</a>
		{/each}
	</div>
{:else}
	<p class="text-sm text-mondrian_dark_gray">No tags found.</p>
{/if}

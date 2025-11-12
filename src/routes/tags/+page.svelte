<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<meta name="description" content="All tags used on this site" />
</svelte:head>

<div>
	<div class="mb-4 flex w-full items-end justify-between">
		<h3 class="text-3xl font-semibold underline decoration-mondrian_blue decoration-8">Tags</h3>
		<div class="mb-1 text-right">
			<span class="h-max pb-1">
				<p class="font-mono text-xs text-mondrian_dark_gray">all tags used on this site</p>
			</span>
		</div>
	</div>
	{#if data.tags && data.tags.length > 0}
		<div class="mb-4 flex flex-wrap gap-2">
			{#each data.tags as { tag, count, url } (tag)}
				<a
					href={url}
					class="w-max border border-mondrian_black bg-mondrian_white px-1 py-1 text-center font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue"
				>
					#{tag}
					<span class="text-xs opacity-75">
						[{count}
						{count === 1 ? 'item' : 'items'}]
					</span>
				</a>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-mondrian_dark_gray">No tags found.</p>
	{/if}
</div>

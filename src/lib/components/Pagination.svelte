<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		currentPage,
		totalPages,
		baseUrl
	}: { currentPage: number; totalPages: number; baseUrl: string } = $props();

	function getPageUrl(page: number): string {
		if (page === 1) return baseUrl;
		return `${baseUrl}page/${page}/`;
	}
</script>

{#if totalPages > 1}
	<nav class="mt-8 flex justify-center">
		<div class="flex items-center gap-1">
			{#if currentPage > 1}
				<a
					href={resolve(getPageUrl(currentPage - 1) as '/')}
					class="border border-mondrian_black bg-mondrian_white px-3 py-1 font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white"
				>
					← NEWER
				</a>
			{/if}
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page (page)}
				{#if page === currentPage}
					<span
						class="border border-mondrian_black bg-mondrian_red px-3 py-1 font-mono text-xs text-mondrian_white"
					>
						{page}
					</span>
				{:else}
					<a
						href={resolve(getPageUrl(page) as '/')}
						class="border border-mondrian_black bg-mondrian_white px-3 py-1 font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_yellow"
					>
						{page}
					</a>
				{/if}
			{/each}
			{#if currentPage < totalPages}
				<a
					href={resolve(getPageUrl(currentPage + 1) as '/')}
					class="border border-mondrian_black bg-mondrian_white px-3 py-1 font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white"
				>
					OLDER →
				</a>
			{/if}
		</div>
	</nav>
{/if}

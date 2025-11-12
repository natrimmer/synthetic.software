<script lang="ts">
	import { formatDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<meta name="description" content="Posts tagged with {data.tag}" />
</svelte:head>

<div class="mb-4">
	<div class="flex w-full items-end justify-between">
		<h3 class="text-3xl font-semibold">#{data.tag}</h3>
		<div class="mb-1 text-right">
			<span class="h-max pb-1">
				<p class="font-mono text-xs text-mondrian_dark_gray">
					{data.totalItems}
					{data.totalItems === 1 ? 'item' : 'items'}
				</p>
			</span>
		</div>
	</div>
	<hr />

	{#if data.posts && data.posts.length > 0}
		<section class="mt-4">
			{#each data.posts as post (post.url)}
				{#if post.type === 'notes'}
					<!-- Notes rendering - matches Hugo notes/list.html structure -->
					<article
						class="mb-2 border border-mondrian_white p-2 transition-colors hover:border-mondrian_black hover:bg-mondrian_bright_white"
					>
						<div class="flex flex-col">
							<a
								href={post.url}
								class="mb-4 w-full border border-mondrian_black bg-mondrian_white px-1 py-0.5 text-center font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_red hover:text-mondrian_white"
							>
								{post.title} →
							</a>
							<div class="w-full flex-col">
								<footer
									class="flex flex-wrap items-center gap-3 font-mono text-xs text-mondrian_dark_gray"
								>
									<div class="flex flex-col gap-0.5">
										<span>posted: {formatDate(post.date)}</span>
										{#if post.updated && post.updated !== post.date}
											<span>updated: {formatDate(post.updated)}</span>
										{/if}
									</div>
									{#if post.tags && post.tags.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each post.tags as tag (tag)}
												<a
													href="/tags/{tag.toLowerCase()}/"
													class="decoration-mondrian_yellow transition-colors hover:text-mondrian_black hover:underline"
												>
													#{tag}
												</a>
											{/each}
										</div>
									{/if}
								</footer>
							</div>
						</div>
					</article>
				{:else if post.type === 'feed'}
					<!-- Feed rendering - matches Hugo feed/list.html structure -->
					<article
						class="mb-2 border border-mondrian_white p-1 transition-colors hover:border-mondrian_black hover:bg-mondrian_bright_white"
					>
						<div class="flex">
							<div class="mr-4 w-8">
								<a
									href={post.url}
									class="h-min border border-mondrian_black bg-mondrian_white px-1 py-0.5 font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_red hover:text-mondrian_white"
								>
									{post.title}
								</a>
							</div>
							<div class="w-full flex-col">
								<footer
									class="flex flex-wrap items-center gap-3 font-mono text-xs text-mondrian_dark_gray"
								>
									<span>{formatDate(post.date)}</span>
									{#if post.tags && post.tags.length > 0}
										<div class="flex flex-wrap gap-1">
											{#each post.tags as tag (tag)}
												<a
													href="/tags/{tag.toLowerCase()}/"
													class="decoration-mondrian_yellow transition-colors hover:text-mondrian_black hover:underline"
												>
													#{tag}
												</a>
											{/each}
										</div>
									{/if}
								</footer>
							</div>
						</div>
					</article>
				{:else}
					<!-- Articles/default rendering -->
					<article
						class="mb-4 border-b border-b-gray-300 pb-4 transition-colors hover:bg-mondrian_white"
					>
						<div class="mb-2 flex items-start justify-between">
							<div class="flex-1">
								<h4 class="mb-1 text-lg font-semibold">
									<a href={post.url} class="hover:underline">{post.title}</a>
								</h4>
							</div>
							<div class="ml-4 text-right">
								<span class="font-mono text-xs text-mondrian_dark_gray"
									>{formatDate(post.date)}</span
								>
							</div>
						</div>
						<footer class="flex flex-wrap items-center gap-2 text-xs">
							{#if post.tags && post.tags.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each post.tags as tag (tag)}
										<a
											href="/tags/{tag.toLowerCase()}/"
											class="border border-gray-400 bg-mondrian_white px-1 py-0.5 font-mono text-xs transition-colors hover:border-mondrian_black hover:bg-mondrian_yellow"
										>
											#{tag}
										</a>
									{/each}
								</div>
							{/if}
							<a
								href={post.url}
								class="border border-mondrian_black bg-mondrian_white px-2 py-0.5 font-mono text-xs transition-colors hover:bg-mondrian_red hover:text-mondrian_white"
							>
								READ MORE
							</a>
						</footer>
					</article>
				{/if}
			{/each}
		</section>
	{:else}
		<div class="mt-6">
			<p class="text-sm text-mondrian_dark_gray">No items found with this tag.</p>
		</div>
	{/if}
</div>

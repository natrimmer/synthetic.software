<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<h2 class="pb-4 text-xl font-semibold">I'm Nick, a platform engineer.</h2>
<p class="pb-4">
	I aspire to write about infrastructure, design, and how simplicity & aestheticism can make better
	software.
</p>
<section class="mb-4 border-b border-dashed border-mondrian_black pb-4">
	<p>
		This site has three main sections. The
		<a
			href={resolve('/feed/')}
			class="underline transition-colors hover:text-mondrian_blue"
			aria-label="Feed section - brief thoughts and updates">feed</a
		>
		captures brief thoughts and updates. The
		<a
			href={resolve('/notes/')}
			class="underline transition-colors hover:text-mondrian_blue"
			aria-label="Notes section - evolving ideas and explorations">notes</a
		>
		section contains ideas, lists. The
		<a
			href={resolve('/articles/')}
			class="underline transition-colors hover:text-mondrian_blue"
			aria-label="Articles section - in-depth writing">articles</a
		>
		section features in-depth writing.
	</p>
</section>

{#if data.blogrollPosts.length > 0}
	<section class="border border-mondrian_black bg-mondrian_light_gray p-3">
		<div class="mb-2 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<span>
					<div class="relative h-3 w-3">
						<div class="absolute h-3 w-3 animate-ping rounded-full bg-mondrian_red"></div>
						<div
							class="absolute h-3 w-3 rounded-full border border-mondrian_black bg-mondrian_red"
						></div>
					</div>
				</span>
				<h3 class="text-sm font-semibold">Recent posts from blogs I follow</h3>
			</div>
			<a
				href={resolve('/blogroll/')}
				class="font-mono text-xs underline transition-colors hover:text-mondrian_red"
				aria-label="View all blogroll posts"
				title="View all blogroll posts">view all →</a
			>
		</div>
		<ul class="space-y-1">
			{#each data.blogrollPosts as post (post.url)}
				<li
					class="flex items-start justify-between gap-2 border-b border-b-mondrian_dark_gray text-xs"
				>
					<div class="flex-1">
						<span class="inline-flex items-center gap-1">
							<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_red"
							></span>
							<span class="font-mono font-bold">{post.domain}</span>
						</span>
						<a
							href={post.url}
							class="ml-1 decoration-mondrian_yellow transition-colors hover:text-mondrian_yellow hover:underline"
							target="_blank"
							rel="noopener noreferrer external">{post.title} →</a
						>
					</div>
					<time datetime={post.date} class="shrink-0 font-mono">
						{formatDate(post.date)}
					</time>
				</li>
			{/each}
		</ul>
	</section>
{/if}

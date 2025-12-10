<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="w-full">
	{#if data.posts.length > 0}
		<!-- Desktop table view -->
		<div class="mb-4 hidden overflow-x-auto md:block">
			<table class="w-full border-collapse border border-mondrian_white">
				<thead>
					<tr class="border-b border-b-mondrian_black bg-mondrian_white text-left font-sans">
						<th class="w-1/12 pl-1" scope="col">Date</th>
						<th class="w-1/2 pl-1" scope="col">Post</th>
						<th class="w-1/6 pl-1" scope="col">Source</th>
						<th class="w-1/12 pl-1" scope="col">Link</th>
					</tr>
				</thead>
				<tbody>
					{#each data.posts as post (post.url)}
						<tr class="border-b border-b-mondrian_light_gray hover:bg-mondrian_light_gray">
							<td class="pt-1 pl-1 text-left align-top font-mono text-xs">
								<time datetime={post.date}>
									{formatDate(post.date)}
								</time>
							</td>
							<th class="py-1 pl-1 text-left align-top text-sm font-normal" scope="row">
								{post.title}
							</th>
							<td class="pt-1 pl-1 text-left align-top font-mono text-xs">
								<a
									href="https://{post.domain}"
									class="inline-flex items-center gap-2 transition-colors hover:text-mondrian_blue hover:underline"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Visit {post.domain}"
								>
									<span class="h-2 w-2 rounded-full border border-mondrian_black bg-mondrian_red">
									</span>
									{post.domain}
								</a>
							</td>
							<td class="p-1 align-top">
								<a
									href={post.url}
									class="inline-block w-full border border-mondrian_black bg-mondrian_white px-1 py-1 text-center font-mono text-xs shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Open {post.title} in a new tab"
								>
									LINK →
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Mobile card view -->
		<div class="mb-4 space-y-4 md:hidden">
			{#each data.posts as post (post.url)}
				<div
					class="border border-mondrian_black bg-mondrian_white p-4 shadow-mondrian hover:bg-mondrian_white"
				>
					<div class="mb-3 flex items-start justify-between">
						<a
							href="https://{post.domain}"
							class="flex items-center gap-2 transition-colors hover:text-mondrian_blue hover:underline"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Visit {post.domain}"
						>
							<span class="h-2 w-2 rounded-full border border-mondrian_black bg-mondrian_red"
							></span>
							<span class="font-mono text-xs text-mondrian_dark_gray">{post.domain}</span>
						</a>
						<time datetime={post.date} class="font-mono text-xs text-mondrian_dark_gray">
							{formatDate(post.date)}
						</time>
					</div>

					<h4 class="mb-3 text-sm leading-relaxed font-medium">
						{post.title}
					</h4>

					<a
						href={post.url}
						class="block w-full border border-mondrian_black bg-mondrian_white px-3 py-2 text-center font-mono text-sm shadow-mondrian transition-colors hover:bg-mondrian_blue hover:text-mondrian_white focus:outline focus:outline-offset-2 focus:outline-mondrian_blue"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Open {post.title} in a new tab"
					>
						READ POST →
					</a>
				</div>
			{/each}
		</div>

		<section class="mb-4 flex items-center gap-2">
			<span>
				<div class="relative h-4 w-4">
					<div class="absolute h-4 w-4 animate-ping rounded-full bg-mondrian_red"></div>
					<div
						class="absolute h-4 w-4 rounded-full border border-mondrian_black bg-mondrian_red"
					></div>
				</div>
			</span>
			<p>
				You can learn more about this page
				<a
					href={resolve('/articles/blogroll/' as '/')}
					class="underline transition-colors hover:text-mondrian_blue"
					aria-label="Visit my article about this blogroll"
					title="Visit my article about this blogroll"
				>
					here
				</a>.
			</p>
		</section>
	{/if}
</div>

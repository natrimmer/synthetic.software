<script lang="ts">
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

{#if data.releases.length > 0}
	<!-- Desktop table view -->
	<table
		class="hidden w-full border-collapse border border-mondrian_white md:block"
		aria-describedby="changelog-note"
	>
		<caption class="sr-only">List of software releases and their changes</caption>
		<thead>
			<tr class="border-b border-b-mondrian_black bg-mondrian_white text-left font-sans">
				<th class="w-1/8 pl-1" scope="col">Version</th>
				<th class="w-1/8 pl-1" scope="col">Date</th>
				<th class="w-1/8 pl-1" scope="col">Commits</th>
				<th scope="col">Changes</th>
			</tr>
		</thead>
		<tbody>
			{#each data.releases as release (release.tag)}
				<tr class="border-b border-b-mondrian_light_gray hover:bg-mondrian_light_gray">
					<th class="pt-1 pl-1 text-left align-top font-mono text-xs font-normal" scope="row">
						{#if release.tag === 'unversioned'}
							<span class="text-mondrian_dark_gray">UNVERSIONED</span>
						{:else}
							<a
								href="https://github.com/natrimmer/synthetic.software/releases/tag/{release.tag}"
								class="underline transition-colors hover:text-mondrian_blue"
								target="_blank"
								rel="noopener noreferrer"
							>
								{release.tag}
							</a>
						{/if}
					</th>
					<td class="pt-1 pl-1 align-top font-mono text-xs text-mondrian_dark_gray">
						{formatDate(release.date)}
					</td>
					<td class="pt-1 pl-1 text-center align-top font-mono text-xs">
						{release.commits.length}
					</td>
					<td class="py-1 pl-1 align-top text-sm">
						{#if release.commits.length > 0}
							<div class="space-y-1">
								{#each release.commits as commit (commit.hash)}
									<div class="flex items-start gap-2">
										<span class="flex-1">{commit.subject}</span>
										<a
											href="https://github.com/natrimmer/synthetic.software/commit/{commit.hash}"
											class="font-mono text-xs text-mondrian_dark_gray transition-colors hover:text-mondrian_yellow"
											target="_blank"
											rel="noopener noreferrer"
										>
											{commit.hash}
										</a>
									</div>
								{/each}
							</div>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Mobile card view -->
	<div class="mb-4 space-y-2 md:hidden">
		{#each data.releases as release (release.tag)}
			<details class="group">
				<summary
					class="flex cursor-pointer items-center justify-between border border-mondrian_black p-2 transition-colors [&::-webkit-details-marker]:hidden [&::marker]:hidden"
				>
					<div class="flex items-center gap-2">
						<svg
							class="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
						{#if release.tag === 'unversioned'}
							<span class="font-mono text-sm font-semibold">UNVERSIONED</span>
						{:else}
							<span class="font-mono text-sm font-semibold">{release.tag}</span>
						{/if}
						<span class="font-mono text-xs text-mondrian_black">
							{formatDate(release.date)}
						</span>
					</div>
					<div
						class="border border-mondrian_black bg-mondrian_light_gray px-2 py-1 font-mono text-xs"
					>
						{release.commits.length} commit{release.commits.length !== 1 ? 's' : ''}
					</div>
				</summary>

				<div class="border-x border-b border-mondrian_black bg-mondrian_white p-4">
					{#if release.commits.length > 0}
						<div class="space-y-2">
							{#each release.commits as commit (commit.hash)}
								<div class="flex items-start">
									<div class="flex flex-col sm:flex-row sm:items-start sm:gap-2">
										<a
											href="https://github.com/natrimmer/synthetic.software/commit/{commit.hash}"
											class="mr-2 font-mono text-sm underline transition-colors hover:text-mondrian_yellow"
											target="_blank"
											rel="noopener noreferrer"
										>
											{commit.hash}
										</a>
										<span class="flex-1 text-sm">{commit.subject}</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</details>
		{/each}
	</div>
{/if}

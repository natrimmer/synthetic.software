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

<div class="w-full">
	<div class="mb-4 flex w-full items-end justify-between">
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_red decoration-6 sm:text-3xl sm:decoration-8"
		>
			Changelog
		</h3>
		<span class="h-max">
			<p class="font-mono text-xs text-mondrian_dark_gray">
				{#if data.releases.length > 0}
					{data.releases.length} releases
				{:else}
					version history
				{/if}
			</p>
		</span>
	</div>

	{#if data.releases.length > 0}
		<!-- Desktop table view -->
		<div
			class="mb-4 hidden border border-mondrian_white p-4 hover:border-mondrian_black hover:bg-mondrian_bright_white md:block"
		>
			<table
				class="w-full border-collapse border border-mondrian_white"
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
												<span
													class="inline-block min-w-12 bg-mondrian_light_gray px-1 py-0.5 font-mono text-xs text-mondrian_dark_gray"
												>
													{commit.type}
												</span>
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
				<tfoot id="changelog-note">
					<tr>
						<th colspan="4" class="p-1 text-left text-xs text-mondrian_dark_gray">Notes:</th>
					</tr>
					<tr>
						<td colspan="4" class="p-1 text-xs text-mondrian_dark_gray">
							Changes are grouped by release version, showing all commits included in each version.
						</td>
					</tr>
					<tr>
						<td colspan="4" class="p-1 text-xs text-mondrian_dark_gray">
							Commit types: <code class="font-mono">feat</code> (new features),
							<code class="font-mono">fix</code> (bug fixes),
							<code class="font-mono">docs</code> (documentation),
							<code class="font-mono">style</code> (formatting),
							<code class="font-mono">refactor</code> (code improvements),
							<code class="font-mono">perf</code> (performance),
							<code class="font-mono">ci</code> (build/deploy),
							<code class="font-mono">chore</code> (maintenance).
						</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Mobile card view -->
		<div class="mb-4 space-y-4 md:hidden">
			{#each data.releases as release (release.tag)}
				<details class="group">
					<summary
						class="flex cursor-pointer items-center justify-between border border-mondrian_black bg-mondrian_yellow p-4 shadow-mondrian transition-colors hover:bg-mondrian_bright_white [&::-webkit-details-marker]:hidden [&::marker]:hidden"
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
									<div class="flex items-start gap-3">
										<div
											class="mt-1 h-3 w-3 shrink-0 rounded-full border border-mondrian_black bg-mondrian_blue"
										></div>
										<div class="flex-1">
											<div class="flex flex-col sm:flex-row sm:items-start sm:gap-2">
												<span
													class="mb-1 inline-block w-fit bg-mondrian_light_gray px-1 py-0.5 font-mono text-xs text-mondrian_dark_gray sm:mb-0"
												>
													{commit.type}
												</span>
												<span class="flex-1 text-sm">{commit.subject}</span>
											</div>
											<div class="mt-1">
												<a
													href="https://github.com/natrimmer/synthetic.software/commit/{commit.hash}"
													class="font-mono text-xs text-mondrian_dark_gray transition-colors hover:text-mondrian_yellow"
													target="_blank"
													rel="noopener noreferrer"
												>
													{commit.hash}
												</a>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</details>
			{/each}
		</div>

		<!-- Mobile notes -->
		<div class="mb-4 border border-mondrian_black bg-mondrian_light_gray p-4 md:hidden">
			<h4 class="mb-2 text-xs font-semibold text-mondrian_dark_gray">Notes:</h4>
			<p class="mb-2 text-xs text-mondrian_dark_gray">
				Changes are grouped by release version, showing all commits included in each version.
			</p>
			<p class="text-xs text-mondrian_dark_gray">
				Commit types: <code class="font-mono">feat</code> (new features),
				<code class="font-mono">fix</code> (bug fixes),
				<code class="font-mono">docs</code> (documentation),
				<code class="font-mono">style</code> (formatting),
				<code class="font-mono">refactor</code> (code improvements),
				<code class="font-mono">perf</code> (performance),
				<code class="font-mono">ci</code> (build/deploy),
				<code class="font-mono">chore</code> (maintenance).
			</p>
		</div>

		<details class="group mb-4">
			<summary
				class="flex cursor-pointer items-center gap-2 border border-mondrian_black bg-mondrian_white p-4 transition-colors hover:bg-mondrian_bright_white [&::-webkit-details-marker]:hidden [&::marker]:hidden"
			>
				<svg
					class="h-4 w-4 transition-transform group-[[open]]:rotate-90"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
				<span class="text-sm font-semibold">About Versioning & Commit Messages</span>
				<span class="ml-auto hidden font-mono text-xs text-mondrian_dark_gray sm:inline"
					>Click to expand</span
				>
			</summary>

			<div class="space-y-2 border-x border-b border-mondrian_black bg-mondrian_bright_white p-4">
				<p class="mb-2 text-sm">
					This site uses
					<a
						href="https://semver.org/"
						class="underline transition-colors hover:text-mondrian_red"
						target="_blank"
						rel="noopener noreferrer"
						title="Semantic Versioning"
						aria-label="Learn more about Semantic Versioning"
					>
						Semantic Versioning (SemVer)
					</a>
					to track changes. Unlike traditional software, this site combines both code and content, so
					the versioning reflects the overall user experience rather than just technical changes.
				</p>
				<p class="mb-2 text-sm">
					I use
					<a
						href="https://github.com/natrimmer/claude_commit"
						class="underline transition-colors hover:text-mondrian_red"
						target="_blank"
						rel="noopener noreferrer"
						title="Claude Commit"
						aria-label="Visit the Claude Commit repository"
					>
						Claude Commit
					</a>
					to generate commit messages using the
					<span class="code-inline">git diff</span> output and the Claude API.
				</p>

				<div
					class="mb-2 overflow-x-auto bg-mondrian_black p-4 font-mono text-xs text-mondrian_yellow"
				>
					<p class="mb-2 text-mondrian_yellow">[nick@web ~]$ bat semver.md</p>
					<div class="text-mondrian_dark_gray">
						<div class="text-mondrian_yellow">
							───────┬──────────────────────────────────────────────────────
						</div>
						<div class="text-mondrian_yellow">
							&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ File: semver.md
						</div>
						<div class="text-mondrian_yellow">
							───────┼──────────────────────────────────────────────────────
						</div>
						<div class="text-mondrian_yellow">
							&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;&nbsp;│&nbsp;<span class="text-mondrian_yellow"
								>## MAJOR</span
							>
							(2.0.0) - Breaking changes
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;│&nbsp;• Complete visual redesigns
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;3&nbsp;&nbsp;&nbsp;│&nbsp;• URL structure changes (old bookmarks
							break)
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;4&nbsp;&nbsp;&nbsp;│&nbsp;• Removing major sections or features
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;5&nbsp;&nbsp;&nbsp;│&nbsp;• Navigation overhauls
						</div>
						<div class="text-mondrian_dark_gray">&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;│&nbsp;</div>
						<div class="text-mondrian_yellow">
							&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;│&nbsp;<span class="text-mondrian_yellow"
								>## MINOR</span
							>
							(1.3.0) - New features
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;8&nbsp;&nbsp;&nbsp;│&nbsp;• New content sections (blogroll, notes)
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;&nbsp;9&nbsp;&nbsp;&nbsp;│&nbsp;• New functionality (search, RSS,
							commenting)
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;10&nbsp;&nbsp;&nbsp;│&nbsp;• Significant content additions
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;│&nbsp;• New interactive features
						</div>
						<div class="text-mondrian_dark_gray">&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;│&nbsp;</div>
						<div class="text-mondrian_yellow">
							&nbsp;&nbsp;13&nbsp;&nbsp;&nbsp;│&nbsp;<span class="text-mondrian_yellow"
								>## PATCH</span
							>
							(1.2.1) - Small fixes
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;│&nbsp;• Bug fixes and styling tweaks
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;│&nbsp;• Individual blog posts or notes
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;16&nbsp;&nbsp;&nbsp;│&nbsp;• Typo corrections
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;17&nbsp;&nbsp;&nbsp;│&nbsp;• Performance improvements
						</div>
						<div class="text-mondrian_dark_gray">
							&nbsp;&nbsp;18&nbsp;&nbsp;&nbsp;│&nbsp;• Minor design adjustments
						</div>
						<div class="text-mondrian_yellow">
							───────┴──────────────────────────────────────────────────────
						</div>
					</div>
				</div>
			</div>
		</details>
	{/if}
</div>

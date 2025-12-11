<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '$lib/components/Logo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full">
	<div class="mb-4 flex items-start gap-3">
		<p class="leading-relaxed">
			This site was originally written using a custom SSG, first in TypeScript, then in Go. After
			realizing I was reinventing the wheel, I transitioned to Hugo. Eventually, Hugo's Go
			templating became too restrictive—the lack of type safety and immature tooling made
			development frustrating. I migrated to SvelteKit for TypeScript throughout, better component
			ergonomics, and mature developer tooling. You can read more about the migration
			<a
				href={resolve('/articles/hugo_to_sveltekit' as '/')}
				class="underline transition-colors hover:text-mondrian_blue"
				aria-label="Link to Hugo to SvelteKit migration article"
			>
				here
			</a>.
		</p>
		<Logo class="size-36 shrink-0" />
	</div>

	<div class="mb-4 space-y-3 leading-relaxed">
		<p>
			I'm a
			<span
				class="underline decoration-dotted hover:cursor-help"
				title="It means I write software to support the writing of software."
			>
				Platform Engineer
			</span>
			at the
			<a
				href="https://www.mcgovern.org/"
				class="underline transition-colors hover:text-mondrian_blue"
				aria-label="Link to Patrick J. McGovern Foundation website"
				target="_blank"
				rel="noopener noreferrer"
			>
				Patrick J. McGovern Foundation
			</a>.
		</p>
		<p>
			Most of my time is spent working on infrastructure with some fullstack work as well. My
			interests include application performance, observability, reliability, and the developer
			experience.
		</p>
	</div>

	<div class="border-t border-dashed border-mondrian_black pt-4">
		<h5 class="mb-3 text-base font-semibold">Currently</h5>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<!-- Reading -->
			{#if data.reading.length > 0}
				<div class="border border-mondrian_black bg-mondrian_white shadow-mondrian">
					<h5
						class="flex items-center border-b-2 border-dashed border-mondrian_black p-3 font-mono text-sm font-bold tracking-wide uppercase"
					>
						Reading
					</h5>
					<ul class="space-y-2.5 p-3">
						{#each data.reading as item (item.title)}
							<li class="flex items-start gap-1.5 text-xs leading-relaxed">
								<span
									class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-mondrian_black bg-mondrian_yellow"
								></span>
								<div class="flex-1">
									<span class="font-semibold italic">{item.title}</span>
									{#if item.authors}
										<span class="text-mondrian_dark_gray">
											, {item.authors.join(', ')}
										</span>
									{/if}
									{#if item.notes}
										<div
											class="mt-1 border-l-2 border-mondrian_light_gray pl-2 text-xs text-mondrian_dark_gray italic"
										>
											{item.notes}
										</div>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Listening -->
			{#if data.podcasts.length > 0 || data.music.length > 0}
				<div class="border border-mondrian_black bg-mondrian_white shadow-mondrian">
					<h5
						class="flex items-center border-b-2 border-dashed border-mondrian_black p-3 font-mono text-sm font-bold tracking-wide uppercase"
					>
						Listening
					</h5>

					<div class="space-y-3 p-3">
						{#if data.podcasts.length > 0}
							<div>
								<div class="mb-1.5 text-xs font-bold text-mondrian_dark_gray">PODCASTS</div>
								<ul class="space-y-1.5">
									{#each data.podcasts as item (item.title)}
										<li class="flex items-start gap-1.5 text-xs leading-relaxed">
											<span
												class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-mondrian_black bg-mondrian_yellow"
											></span>
											<div class="flex-1">
												{item.title}
												{#if item.notes}
													<div
														class="mt-1 border-l-2 border-mondrian_light_gray pl-2 text-xs text-mondrian_dark_gray italic"
													>
														{item.notes}
													</div>
												{/if}
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						{#if data.music.length > 0}
							<div>
								<div class="mb-1.5 text-xs font-bold text-mondrian_dark_gray">MUSIC</div>
								<ul class="space-y-1.5">
									{#each data.music as item (item.title)}
										<li class="flex items-start gap-1.5 text-xs leading-relaxed">
											<span
												class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-mondrian_black bg-mondrian_yellow"
											></span>
											<div class="flex-1">
												<span class="font-semibold italic">{item.title}</span>
												{#if item.artist}
													<span class="text-mondrian_dark_gray">, {item.artist}</span>
												{/if}
												{#if item.notes}
													<div
														class="mt-1 border-l-2 border-mondrian_light_gray pl-2 text-xs text-mondrian_dark_gray italic"
													>
														{item.notes}
													</div>
												{/if}
											</div>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- Watching -->
			{#if data.watching.length > 0}
				<div class="border border-mondrian_black bg-mondrian_white shadow-mondrian">
					<h5
						class="flex items-center border-b-2 border-dashed border-mondrian_black p-3 font-mono text-sm font-bold tracking-wide uppercase"
					>
						Watching
					</h5>
					<ul class="space-y-2.5 p-3">
						{#each data.watching as item (item.title)}
							<li class="flex items-start gap-1.5 text-xs leading-relaxed">
								<span
									class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full border border-mondrian_black bg-mondrian_yellow"
								></span>
								<div class="flex-1">
									<span class="font-semibold italic">{item.title}</span>
									{#if item.notes}
										<div
											class="mt-1 border-l-2 border-mondrian_light_gray pl-2 text-xs text-mondrian_dark_gray italic"
										>
											{item.notes}
										</div>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>

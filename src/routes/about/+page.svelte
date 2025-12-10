<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full">
	<div
		class="mb-4 flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_red decoration-6 sm:text-3xl sm:decoration-8"
		>
			About
		</h3>
		<span class="h-max">
			<p class="font-mono text-xs text-mondrian_dark_gray">me, myself, and this site</p>
		</span>
	</div>

	<!-- This Site Section -->
	<section class="mb-4 border border-mondrian_black bg-mondrian_white p-4 shadow-mondrian">
		<div class="mb-3 flex items-center gap-2">
			<span class="h-4 w-4 rounded-full border border-mondrian_black bg-mondrian_blue"></span>
			<h4 class="text-lg font-semibold">This Site</h4>
		</div>
		<div class="mb-4 space-y-3 text-sm leading-relaxed">
			<p>
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
		</div>
	</section>

	<!-- Me Section -->
	<section class="mb-4 border border-mondrian_black bg-mondrian_white p-4 shadow-mondrian">
		<div class="mb-3 flex items-center gap-2">
			<span class="h-4 w-4 rounded-full border border-mondrian_black bg-mondrian_red"></span>
			<h4 class="text-lg font-semibold">Me</h4>
		</div>
		<div class="mb-4 space-y-3 text-sm leading-relaxed">
			<p>
				I'm a
				<span
					class="border border-mondrian_black bg-mondrian_yellow px-1 hover:cursor-help"
					title="This essentially means junior engineer."
				>
					Products and Services Associate
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
				Most of my time is spent working on infrastructure with some fullstack work as well. As for
				the misleading home page, it's more of an aspirational title. My interests include
				application observability, reliability, and the developer experience.
			</p>
			<p>
				I have a
				<abbr
					class="border-b border-dashed border-mondrian_black hover:cursor-help"
					title="Bachelor of Science"
				>
					B.S.
				</abbr>
				degree in Computer Science from North Seattle College. Aside from technology I like reading,
				cycling, playing music, playing video games, and spending time with my partner and our two pups.
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
	</section>
</div>

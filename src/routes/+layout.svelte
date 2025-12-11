<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '$lib/components/Footer.svelte';
	import { VERSION } from '$lib/version';
	import type { Snippet } from 'svelte';
	import '../app.css';

	let { children, data }: { children: Snippet; data: { pathname: string } } = $props();

	// Build breadcrumb path from current URL
	function buildBreadcrumbs(pathname: string) {
		if (pathname === '/') return [];

		const parts = pathname.split('/').filter(Boolean);
		const breadcrumbs = [];
		let path = '';

		for (const part of parts) {
			path += `/${part}`;
			breadcrumbs.push({
				name: decodeURIComponent(part).replace(/-/g, '_'),
				url: path
			});
		}

		return breadcrumbs;
	}

	const breadcrumbs = $derived(buildBreadcrumbs(data.pathname));
	const isHome = $derived(data.pathname === '/');
	const pageTitle = $derived(
		isHome ? 'synthetic.software' : `~${breadcrumbs.map((b) => `/${b.name}`).join('')}`
	);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="relative md:m-12 lg:m-20">
	<div class="pointer-events-none absolute top-0 left-0 -z-10 hidden h-full w-full md:block">
		<div class="absolute h-32 w-48 bg-mondrian_blue" style="top: -10%; left: -2%"></div>
		<div class="absolute h-96 w-64 bg-mondrian_red" style="bottom: -20%; right: -10%"></div>
		<div class="absolute h-24 w-1/2 bg-mondrian_yellow" style="bottom: -5%; right: 33%"></div>
	</div>
	<div class="mx-auto max-w-6xl">
		<header class="border-b-2 border-b-mondrian_black p-6">
			<div
				class="flex h-full w-full flex-col justify-start gap-4 pt-6 md:flex-row md:items-end md:justify-between md:gap-0 md:pt-10"
			>
				<a
					href={resolve('/')}
					aria-label="Go to the homepage of SYNTHETIC.SOFTWARE"
					class="md:text-md w-min border border-mondrian_black bg-mondrian_red px-2 py-1 font-mono text-sm tracking-[0.275em] text-mondrian_white hover:cursor-pointer"
				>
					SYNTHETIC.SOFTWARE
				</a>
				<div class="flex items-end justify-start gap-2 font-mono text-xs md:justify-end">
					<span class="border border-mondrian_black bg-mondrian_blue px-2 py-1 text-mondrian_white"
						>PROD</span
					>
					<a
						href={resolve('/changelog')}
						aria-label="Visit the changelog"
						class="border border-mondrian_black bg-mondrian_white px-2 py-1 hover:cursor-pointer"
					>
						{VERSION}
					</a>
				</div>
			</div>
		</header>

		<main class="mx-auto flex max-w-5xl flex-1 flex-col p-6 md:p-18">
			{#if !isHome}
				<!-- Breadcrumb navigation -->
				<nav class="mb-6 overflow-x-auto font-mono text-sm font-semibold">
					<div class="whitespace-nowrap">
						<a href={resolve('/')} class="hover:underline">~</a
						>{#each breadcrumbs.slice(0, -1) as crumb (crumb.url)}/<a
								href={resolve(crumb.url as '/')}
								class="hover:underline">{crumb.name}</a
							>{/each}{#if breadcrumbs.length > 0}/<span
								>{breadcrumbs[breadcrumbs.length - 1].name}</span
							>{/if}
					</div>
				</nav>
			{/if}
			{@render children()}
		</main>

		<Footer pathname={data.pathname} />
	</div>
</div>

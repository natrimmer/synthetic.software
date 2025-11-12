<script lang="ts">
	import { resolve } from '$app/paths';

	let { pathname }: { pathname: string } = $props();

	const navigation = [
		{ name: 'HOME', url: '/', color: 'mondrian_yellow' },
		{ name: 'FEED', url: '/feed/', color: 'mondrian_black' },
		{ name: 'NOTES', url: '/notes/', color: 'mondrian_blue' },
		{ name: 'ARTICLES', url: '/articles/', color: 'mondrian_red' },
		{ name: 'BLOGROLL', url: '/blogroll/', color: 'mondrian_yellow' },
		{ name: 'ABOUT', url: '/about/', color: 'mondrian_blue' }
	];

	const baseClasses =
		'text-xl md:text-2xl lg:text-3xl block hover:underline decoration-4 md:decoration-6 lg:decoration-8';

	function isCurrentPage(url: string, currentPath: string): boolean {
		if (url === currentPath) return true;
		if (url !== '/' && currentPath.startsWith(url)) return true;
		return false;
	}
</script>

<nav class="w-full font-mono">
	<ul class="flex flex-col gap-2 lg:gap-2 lg:px-0">
		{#each navigation as item (item.name)}
			<li class="lg:flex lg:justify-end">
				<a
					class="{baseClasses} decoration-{item.color}{isCurrentPage(item.url, pathname)
						? ' underline'
						: ''}"
					href={resolve(item.url as '/')}
					aria-current={isCurrentPage(item.url, pathname) ? 'page' : undefined}
				>
					{item.name}
				</a>
			</li>
		{/each}
	</ul>
</nav>

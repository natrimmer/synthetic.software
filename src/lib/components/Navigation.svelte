<script lang="ts">
	import { resolve } from '$app/paths';

	let { pathname }: { pathname: string } = $props();

	const navigation = [
		{ name: 'HOME', url: '/', color: 'mondrian_yellow', description: 'home is where you make it' },
		{
			name: 'FEED',
			url: '/feed/',
			color: 'mondrian_black',
			description: 'short-form thoughts and updates organized chronologically'
		},
		{
			name: 'NOTES',
			url: '/notes/',
			color: 'mondrian_blue',
			description:
				"curated links, observations, and quick thoughts that don't warrant full articles but are worth sharing either for posterity or future exploration"
		},
		{
			name: 'ARTICLES',
			url: '/articles/',
			color: 'mondrian_red',
			description:
				"long-form writing and more in-depth posts on topics I'm exploring or have learned about"
		},
		{
			name: 'BLOGROLL',
			url: '/blogroll/',
			color: 'mondrian_yellow',
			description:
				'an automatically updated collection of blogs and sites I follow, generated from RSS feeds'
		},
		{
			name: 'ABOUT',
			url: '/about/',
			color: 'mondrian_blue',
			description: 'about me, myself, and this site'
		}
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
					title={item.description}
				>
					{item.name}
				</a>
			</li>
		{/each}
	</ul>
</nav>

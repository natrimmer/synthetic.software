<script lang="ts">
	import { resolve } from '$app/paths';

	let { pathname }: { pathname: string } = $props();

	const navItems = [
		{ name: 'HOME', path: '/', description: 'home is where you make it' },
		{
			name: 'FEED',
			path: '/feed/',
			description: 'short-form thoughts and updates organized chronologically'
		},
		{
			name: 'NOTES',
			path: '/notes/',
			description:
				"curated links, observations, and quick thoughts that don't warrant full articles but are worth sharing either for posterity or future exploration"
		},
		{
			name: 'ARTICLES',
			path: '/articles/',
			description:
				"long-form writing and more in-depth posts on topics I'm exploring or have learned about"
		},
		{
			name: 'BLOGROLL',
			path: '/blogroll/',
			description:
				'an automatically updated collection of blogs and sites I follow, generated from RSS feeds'
		},
		{
			name: 'ABOUT',
			path: '/about/',
			description: 'about me, myself, and this site'
		}
	];

	function isActive(itemPath: string, currentPath: string): boolean {
		// Exact match
		if (itemPath === currentPath) return true;
		// For non-home paths, check if current path starts with the item path
		if (itemPath !== '/') {
			// Handle both with and without trailing slashes
			const normalizedItemPath = itemPath.endsWith('/') ? itemPath.slice(0, -1) : itemPath;
			const normalizedCurrentPath = currentPath.endsWith('/')
				? currentPath.slice(0, -1)
				: currentPath;
			if (normalizedCurrentPath === normalizedItemPath) return true;
			if (normalizedCurrentPath.startsWith(normalizedItemPath + '/')) return true;
		}
		return false;
	}
</script>

<footer class="w-full border-t-2 border-t-mondrian_black p-6 font-mono">
	<!-- Main navigation -->
	<nav class="mb-4">
		<ul class="flex flex-wrap items-center gap-4 text-base font-bold">
			{#each navItems as item (item.name)}
				<li class="flex items-center gap-2">
					{#if isActive(item.path, pathname)}
						<span class="size-2 rounded-full border border-mondrian_black bg-mondrian_red"></span>
					{/if}
					<a
						href={resolve(item.path as '/')}
						class="transition-colors hover:text-mondrian_blue"
						title={item.description}
						aria-current={isActive(item.path, pathname) ? 'page' : undefined}
					>
						{item.name}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Meta links -->
	<div class="flex flex-wrap items-baseline gap-2 text-xs text-mondrian_black">
		<span>© 1994 nick</span>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_light_gray"
		></span>
		<a
			href="https://github.com/natrimmer/synthetic.software"
			aria-label="View source code on GitHub"
			rel="noopener noreferrer"
			target="_blank"
			class="transition-colors hover:text-mondrian_blue"
		>
			source
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_light_gray"
		></span>
		<a href={resolve('/changelog/')} class="transition-colors hover:text-mondrian_red">
			changelog
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_light_gray"
		></span>
		<a href={resolve('/sitemap/')} class="transition-colors hover:text-mondrian_blue"> sitemap </a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_light_gray"
		></span>
		<a href={resolve('/contact/')} class="transition-colors hover:text-mondrian_yellow">
			contact
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_light_gray"
		></span>
		<a href="mailto:info@synthetic.software" class="transition-colors hover:text-mondrian_blue">
			info@synthetic.software
		</a>
	</div>
</footer>

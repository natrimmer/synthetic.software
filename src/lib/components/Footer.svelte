<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="w-full border-t border-t-mondrian_black pt-4 font-mono text-xs text-mondrian_black">
	<div class="flex flex-wrap items-baseline gap-2">
		<span>© 1994 nick</span>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_gray"></span>
		<a
			href="https://github.com/natrimmer/synthetic.software"
			aria-label="View source code on GitHub"
			rel="noopener noreferrer"
			target="_blank"
			class="transition-colors hover:text-mondrian_blue"
		>
			source
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_gray"></span>
		<a href={resolve('/changelog/')} class="transition-colors hover:text-mondrian_red">
			changelog
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_gray"></span>
		<a href={resolve('/sitemap/')} class="transition-colors hover:text-mondrian_blue"> sitemap </a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_gray"></span>
		<a href={resolve('/contact/')} class="transition-colors hover:text-mondrian_yellow">
			contact
		</a>
		<span class="h-1.5 w-1.5 rounded-full border border-mondrian_black bg-mondrian_gray"></span>
		<a href="mailto:info@synthetic.software" class="transition-colors hover:text-mondrian_blue">
			info@synthetic.software
		</a>
	</div>
</footer>

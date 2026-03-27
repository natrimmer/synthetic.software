<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div
	class="overflow-hidden bg-mondrian_black py-4 font-mono text-sm text-mondrian_yellow md:py-8 md:text-lg lg:py-16 lg:text-xl xl:text-2xl"
>
	<p class="px-4 md:px-8 lg:px-16">
		[nick@web ~]$ tree -P "*.html" --prune -d --noreport --sort=size -r
	</p>
	<pre
		class="max-w-full overflow-x-auto px-4 md:px-8 lg:px-16">.{#each data.mainPages as page (page.url)}{`
├── ${page.title}`}{/each}{#if data.articles.length > 0}{`
├── articles/ (${data.articles.length} total items)`}{#each data.articles as article, index (article.slug)}{#if index === data.articles.length - 1}{`
│   └── ${article.title.toLowerCase()}`}{:else}{`
│   ├── ${article.title.toLowerCase()}`}{/if}{/each}{/if}{`
└── notes/`}{#each data.notes as note, index (note.slug)}{#if index === data.notes.length - 1}{`
    └── ${note.title.toLowerCase()}`}{:else}{`
    ├── ${note.title.toLowerCase()}`}{/if}{/each}</pre>
</div>

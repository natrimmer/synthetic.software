<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mb-4">
	<div
		class="mb-4 flex w-full flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-0"
	>
		<h3
			class="text-2xl font-semibold underline decoration-mondrian_blue decoration-6 sm:text-3xl sm:decoration-8"
		>
			Sitemap
		</h3>
		<span class="h-max">
			<p class="font-mono text-sm text-mondrian_dark_gray sm:text-xs">
				everything in its right place
			</p>
		</span>
	</div>
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
│   ├── ${article.title.toLowerCase()}`}{/if}{/each}{/if}{#if data.totalFeedItems > 0}{`
├── feed/ (${data.totalFeedItems} total items)`}{#each data.feedByYear as yearData, yearIndex (yearData.year)}{#if yearIndex === data.feedByYear.length - 1}{`
│   └── ${yearData.year}/ (${yearData.months.reduce((sum, m) => sum + m.items.length, 0)} items)`}{#each yearData.months as monthData, monthIndex (monthData.month)}{#if monthIndex === yearData.months.length - 1}{`
│       └── ${monthData.month}/ (${monthData.items.length} items)`}{:else}{`
│       ├── ${monthData.month}/ (${monthData.items.length} items)`}{/if}{/each}{:else}{`
│   ├── ${yearData.year}/ (${yearData.months.reduce((sum, m) => sum + m.items.length, 0)} items)`}{#each yearData.months as monthData, monthIndex (monthData.month)}{#if monthIndex === yearData.months.length - 1}{`
│   │   └── ${monthData.month}/ (${monthData.items.length} items)`}{:else}{`
│   │   ├── ${monthData.month}/ (${monthData.items.length} items)`}{/if}{/each}{/if}{/each}{/if}{#if data.notes.length > 0}{`
└── notes/`}{#each data.notes as note, index (note.slug)}{#if index === data.notes.length - 1}{`
    └── ${note.title.toLowerCase()}`}{:else}{`
    ├── ${note.title.toLowerCase()}`}{/if}{/each}{/if}</pre>
	</div>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<div class="flex flex-1 flex-col items-center justify-center text-center font-mono">
	<h1 class="text-[20vh] font-bold">{page.status}</h1>
	<p class="text-lg italic">{page.error?.message}</p>
	<a href={resolve('/')} class="underline hover:no-underline">go home</a>
</div>

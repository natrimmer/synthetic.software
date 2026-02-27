<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<div class="flex flex-1 flex-col items-center justify-center text-center font-mono">
	<h1 class="text-[20vh] font-bold">404</h1>
	<p class="text-lg italic">Not Found</p>
	<a href={resolve('/')} class="underline hover:no-underline">go home</a>
</div>

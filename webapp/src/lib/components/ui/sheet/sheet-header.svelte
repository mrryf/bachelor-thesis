<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		class: className,
		children,
	}: {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div class={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
	{@render children?.()}
</div>

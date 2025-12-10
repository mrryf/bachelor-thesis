<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";
	import { fade } from "svelte/transition";

	let {
		ref = $bindable(null),
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: {
		ref?: HTMLDivElement | null;
		class?: string;
		sideOffset?: number;
		children?: Snippet;
	} = $props();
</script>

<TooltipPrimitive.Content
	bind:ref
	{sideOffset}
	transition={fade}
	transitionConfig={{ duration: 100 }}
	class={cn(
		"z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground",
		"shadow-md animate-in fade-in-0 zoom-in-95",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</TooltipPrimitive.Content>

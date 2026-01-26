<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import { cn } from "$lib/utils";
	import Scrollbar from "./scroll-area-scrollbar.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		class?: string;
		orientation?: "vertical" | "horizontal" | "both";
		scrollbarXClasses?: string;
		scrollbarYClasses?: string;
		children?: Snippet;
	}

	let {
		class: className,
		children,
		orientation = "vertical",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
	}: Props = $props();
</script>

<ScrollAreaPrimitive.Root class={cn("relative overflow-hidden", className)}>
	<ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>

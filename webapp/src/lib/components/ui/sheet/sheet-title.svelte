<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		level = 2,
		children,
		...restProps
	}: {
		ref?: HTMLHeadingElement | null;
		class?: string;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		children?: Snippet;
	} = $props();
</script>

<SheetPrimitive.Title
	bind:ref
	{level}
	class={cn("text-lg font-semibold text-foreground", className)}
	{...restProps}
>
	{@render children?.()}
</SheetPrimitive.Title>

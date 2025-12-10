<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";

	let {
		class: className,
		child,
		children,
		...restProps
	}: {
		class?: string;
		child?: Snippet;
		children?: Snippet;
	} = $props();
</script>

{#if child}
	<SheetPrimitive.Trigger {child} class={cn(className)} {...restProps} />
{:else}
	<SheetPrimitive.Trigger class={cn(className)} {...restProps}>
		{@render children?.()}
	</SheetPrimitive.Trigger>
{/if}

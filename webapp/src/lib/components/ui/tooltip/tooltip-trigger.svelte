<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		child,
		children,
		...restProps
	}: {
		child?: Snippet<[any]>;
		children?: Snippet;
	} = $props();
</script>

{#if child}
	<TooltipPrimitive.Trigger {child} {...restProps} />
{:else}
	<TooltipPrimitive.Trigger {...restProps}>
		{@render children?.()}
	</TooltipPrimitive.Trigger>
{/if}

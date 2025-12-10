<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		delayDuration = 200,
		disableHoverableContent = false,
		children,
		...restProps
	}: {
		delayDuration?: number;
		disableHoverableContent?: boolean;
		children?: Snippet;
	} = $props();
</script>

<TooltipPrimitive.Root
	{delayDuration}
	{disableHoverableContent}
	{...restProps}
>
	{@render children?.()}
</TooltipPrimitive.Root>

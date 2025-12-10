<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		open = $bindable(false),
		children,
		...restProps
	}: {
		open?: boolean;
		children?: Snippet;
	} = $props();
</script>

<SheetPrimitive.Root bind:open {...restProps}>
	{@render children?.()}
</SheetPrimitive.Root>

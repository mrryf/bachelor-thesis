<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type InputProps = WithElementRef<HTMLInputAttributes>;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		class: className,
		type = "text",
		ref = $bindable(null),
		value = $bindable(""),
		...restProps
	}: InputProps = $props();
</script>

<input
	bind:this={ref}
	bind:value
	class={cn(
		"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	{type}
	{...restProps}
/>

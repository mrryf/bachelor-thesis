<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import Check from "@lucide/svelte/icons/check";
	import { cn } from "$lib/utils";
	import type { Snippet } from "svelte";

	interface Props extends Omit<SelectPrimitive.ItemProps, 'children'> {
		class?: string;
		children?: Snippet;
	}

	let {
		ref = $bindable(null),
		class: className,
		children: itemChildren,
		...restProps
	}: Props = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	class={cn(
		"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
		className
	)}
	{...restProps}
>
	{#snippet children({ selected })}
		<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			{#if selected}
				<Check class="h-4 w-4" />
			{/if}
		</span>
		{@render itemChildren?.()}
	{/snippet}
</SelectPrimitive.Item>

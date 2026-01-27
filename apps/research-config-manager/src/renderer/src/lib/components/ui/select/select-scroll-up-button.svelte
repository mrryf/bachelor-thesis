<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import ChevronUp from "@lucide/svelte/icons/chevron-up";
	import { cn } from "$lib/utils";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SelectPrimitive.ScrollUpButtonProps = $props();
</script>

<SelectPrimitive.ScrollUpButton
	bind:ref
	class={cn(
		"flex cursor-default items-center justify-center py-1",
		className
	)}
	{...restProps}
>
	<ChevronUp class="h-4 w-4" />
</SelectPrimitive.ScrollUpButton>

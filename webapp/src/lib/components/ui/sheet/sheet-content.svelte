<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { X } from "lucide-svelte";
	import type { Snippet } from "svelte";
	import { cn } from "$lib/utils";
	import { fly, fade } from "svelte/transition";

	let {
		ref = $bindable(null),
		class: className,
		side = "bottom",
		children,
		...restProps
	}: {
		ref?: HTMLDivElement | null;
		class?: string;
		side?: "top" | "bottom" | "left" | "right";
		children?: Snippet;
	} = $props();

	const sideClasses = {
		top: "inset-x-0 top-0 border-b",
		bottom: "inset-x-0 bottom-0 border-t",
		left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
	};

	const transitions = {
		top: { y: -500, duration: 300 },
		bottom: { y: 500, duration: 300 },
		left: { x: -500, duration: 300 },
		right: { x: 500, duration: 300 },
	};
</script>

<SheetPrimitive.Portal>
	<SheetPrimitive.Overlay
		transition={fade}
		transitionConfig={{ duration: 150 }}
		class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
	/>
	<SheetPrimitive.Content
		bind:ref
		transition={fly}
		transitionConfig={transitions[side]}
		class={cn(
			"fixed z-50 gap-4 bg-background p-6 shadow-lg",
			sideClasses[side],
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<SheetPrimitive.Close
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
		>
			<X class="h-4 w-4" />
			<span class="sr-only">Close</span>
		</SheetPrimitive.Close>
	</SheetPrimitive.Content>
</SheetPrimitive.Portal>

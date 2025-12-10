<script lang="ts">
	import { fade } from "svelte/transition";

	let {
		visible = false,
		x = 0,
		y = 0,
		term = "",
		definition = "",
	}: {
		visible?: boolean;
		x?: number;
		y?: number;
		term?: string;
		definition?: string;
	} = $props();

	// Adjust position to keep tooltip on screen
	const adjustedX = $derived.by(() => {
		if (typeof window === 'undefined') return x;
		const tooltipWidth = 320; // max-w-xs ~= 320px
		const padding = 16;
		const maxX = window.innerWidth - tooltipWidth - padding;
		return Math.min(x, maxX);
	});

	const adjustedY = $derived.by(() => {
		if (typeof window === 'undefined') return y;
		const tooltipHeight = 100; // approximate
		const padding = 16;

		// If tooltip would go off bottom of screen, show above instead
		if (y + tooltipHeight + padding > window.innerHeight) {
			return y - tooltipHeight - 8;
		}
		return y + 8;
	});
</script>

{#if visible}
	<div
		class="fixed z-50 max-w-xs rounded-lg border border-border bg-popover p-3 shadow-lg"
		style="left: {adjustedX}px; top: {adjustedY}px; pointer-events: none;"
		transition:fade={{ duration: 150 }}
		role="tooltip"
	>
		<div class="font-semibold text-sm text-foreground mb-1">
			{term}
		</div>
		<div class="text-xs text-muted-foreground leading-relaxed">
			{definition}
		</div>
	</div>
{/if}

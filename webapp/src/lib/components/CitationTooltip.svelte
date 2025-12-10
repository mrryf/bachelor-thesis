<script lang="ts">
	import { fade } from "svelte/transition";
	import type { Reference } from "$lib/data/references";
	import { ExternalLink } from "lucide-svelte";

	let {
		visible = false,
		x = 0,
		y = 0,
		reference,
	}: {
		visible?: boolean;
		x?: number;
		y?: number;
		reference?: Reference | null;
	} = $props();

	// Adjust position to keep tooltip on screen
	const adjustedX = $derived.by(() => {
		if (typeof window === 'undefined') return x;
		const tooltipWidth = 384; // max-w-sm ~= 384px
		const padding = 16;
		const maxX = window.innerWidth - tooltipWidth - padding;
		return Math.min(x, maxX);
	});

	const adjustedY = $derived.by(() => {
		if (typeof window === 'undefined') return y;
		const tooltipHeight = 120; // approximate
		const padding = 16;

		// If tooltip would go off bottom of screen, show above instead
		if (y + tooltipHeight + padding > window.innerHeight) {
			return y - tooltipHeight - 8;
		}
		return y + 8;
	});

	const formattedAuthors = $derived.by(() => {
		if (!reference) return '';
		if (reference.authors.length === 1) return reference.authors[0];
		if (reference.authors.length === 2) return `${reference.authors[0]} & ${reference.authors[1]}`;
		if (reference.authors.length <= 3) {
			return reference.authors.slice(0, -1).join(', ') + ' & ' + reference.authors[reference.authors.length - 1];
		}
		return `${reference.authors[0]} et al.`;
	});
</script>

{#if visible && reference}
	<div
		class="fixed z-50 max-w-sm rounded-lg border border-border bg-popover shadow-xl"
		style="left: {adjustedX}px; top: {adjustedY}px; pointer-events: none;"
		transition:fade={{ duration: 150 }}
		role="tooltip"
	>
		<div class="p-3 space-y-2">
			<!-- Authors -->
			<div class="text-xs font-medium text-foreground">
				{formattedAuthors}
			</div>

			<!-- Year -->
			<div class="text-xs text-muted-foreground">
				({reference.year})
			</div>

			<!-- Title -->
			<div class="text-xs text-foreground leading-relaxed">
				<em>{reference.title}</em>
			</div>

			<!-- Journal/Publisher -->
			{#if reference.journal}
				<div class="text-xs text-muted-foreground">
					{reference.journal}
					{#if reference.volume}
						<span>, {reference.volume}</span>
					{/if}
					{#if reference.issue}
						<span>({reference.issue})</span>
					{/if}
					{#if reference.pages}
						<span>, {reference.pages}</span>
					{/if}
				</div>
			{:else if reference.publisher}
				<div class="text-xs text-muted-foreground">
					{reference.publisher}
				</div>
			{/if}

			<!-- DOI -->
			{#if reference.doi}
				<div class="text-xs text-primary flex items-center gap-1 pt-1 border-t border-border/50">
					<ExternalLink class="h-3 w-3" />
					<span>DOI: {reference.doi}</span>
				</div>
			{/if}
		</div>
	</div>
{/if}

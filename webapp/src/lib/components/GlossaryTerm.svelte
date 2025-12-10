<script lang="ts">
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { glossaryTerms } from "$lib/data/content";

	let { term }: { term: string } = $props();

	// Find the glossary entry for this term
	const glossaryEntry = $derived(
		glossaryTerms.find((entry) => entry.term === term),
	);

	// If term not found in glossary, just render plain text
	$effect(() => {
		if (!glossaryEntry) {
			console.warn(`Glossary term "${term}" not found in glossary data`);
		}
	});
</script>

{#if glossaryEntry}
	<Tooltip.Root delayDuration={200}>
		<Tooltip.Trigger>
			<span
				class="border-b border-dotted border-primary cursor-help text-primary font-medium hover:border-solid transition-all"
			>
				{term}
			</span>
		</Tooltip.Trigger>
		<Tooltip.Content class="max-w-xs">
			<p class="text-sm">{glossaryEntry.definition}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<span class="text-muted-foreground italic">{term}</span>
{/if}

<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import type { ModelPreference } from "@shared/types";

	interface Props {
		onclick?: () => void;
	}

	let { onclick }: Props = $props();

	// Get current preferences from store
	const preferences = $derived(documentStore.state.config?.preferences);
	const currentModel = $derived(preferences?.defaultModel ?? 'sonnet');
	const showIndicator = $derived(preferences?.showModelIndicator ?? true);

	// Model display names
	const modelLabels: Record<ModelPreference, string> = {
		haiku: 'Haiku',
		sonnet: 'Sonnet',
		opus: 'Opus'
	};

	// Model badge colors
	const modelColors: Record<ModelPreference, string> = {
		haiku: 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400',
		sonnet: 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400',
		opus: 'border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-400'
	};
</script>

{#if showIndicator}
	<button
		type="button"
		class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-muted/50 transition-colors"
		onclick={onclick}
		title="Current model - click to change"
	>
		<Badge
			variant="outline"
			class="text-[10px] px-1.5 py-0 {modelColors[currentModel]}"
		>
			{modelLabels[currentModel]}
		</Badge>
	</button>
{/if}

<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";

	const { isMobile } = useBreakpoint();
	const isLoading = $derived(documentStore.state.isLoading);
	const stats = $derived(documentStore.stats);
</script>

{#if isMobile}
	<div class="fixed bottom-0 left-0 right-0 border-t bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/95 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 safe-area-inset-bottom">
		<div class="px-4 py-3 flex items-center gap-2">
			<Button
				size="sm"
				variant="default"
				class="flex-1 h-11 touch-manipulation font-medium"
				onclick={() => documentStore.enableAll()}
				disabled={isLoading || stats.enabled === stats.total}
			>
				Enable All
			</Button>
			<Button
				size="sm"
				variant="outline"
				class="flex-1 h-11 touch-manipulation font-medium"
				onclick={() => documentStore.disableAll()}
				disabled={isLoading || stats.disabled === stats.total}
			>
				Disable All
			</Button>
		</div>
	</div>
{/if}

<style>
	/* iOS safe area support */
	.safe-area-inset-bottom {
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>

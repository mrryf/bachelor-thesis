<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";

	const { isMobile } = useBreakpoint();
	const isLoading = $derived(documentStore.state.isLoading);
</script>

{#if isMobile}
	<div class="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 flex items-center gap-2 z-20 safe-area-inset-bottom">
		<Button
			size="sm"
			variant="default"
			class="flex-1 h-11 touch-manipulation"
			onclick={() => documentStore.enableAll()}
			disabled={isLoading}
		>
			Enable All
		</Button>
		<Button
			size="sm"
			variant="outline"
			class="flex-1 h-11 touch-manipulation"
			onclick={() => documentStore.disableAll()}
			disabled={isLoading}
		>
			Disable All
		</Button>
	</div>
{/if}

<style>
	/* iOS safe area support */
	.safe-area-inset-bottom {
		padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
	}
</style>

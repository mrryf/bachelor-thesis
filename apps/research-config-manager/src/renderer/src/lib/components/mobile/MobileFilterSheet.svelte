<script lang="ts">
	import { slide } from "svelte/transition";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";
	import QuickFilters from "../documents/QuickFilters.svelte";

	const { isMobile } = useBreakpoint();
	let open = $state(false);

	// Auto-collapse when switching to mobile
	$effect(() => {
		if (isMobile) {
			open = false;
		} else {
			open = true;
		}
	});
</script>

{#if isMobile}
	<!-- Collapsible filter section for mobile -->
	<button
		class="w-full border-b px-4 py-3 flex items-center justify-between bg-card/30 hover:bg-card/50 transition-colors touch-manipulation"
		onclick={() => open = !open}
		type="button"
	>
		<span class="text-sm font-medium">Filters</span>
		<ChevronDown class="h-4 w-4 transition-transform duration-200 {open ? 'rotate-180' : ''}" />
	</button>
	{#if open}
		<div transition:slide={{ duration: 200 }}>
			<QuickFilters />
		</div>
	{/if}
{:else}
	<!-- Always visible on desktop -->
	<QuickFilters />
{/if}

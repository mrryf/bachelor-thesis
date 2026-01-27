<script lang="ts">
	import { documentStore } from "$lib/stores/document-store.svelte";
	import CompactHeader from "$lib/components/layout/CompactHeader.svelte";
	import MobileActionBar from "$lib/components/mobile/MobileActionBar.svelte";
	import DocumentGrid from "$lib/components/documents/DocumentGrid.svelte";
	import { Toaster } from "svelte-sonner";

	function handleKeyDown(e: KeyboardEvent): void {
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		const modKey = isMac ? e.metaKey : e.ctrlKey;

		// Cmd/Ctrl + F: Focus search input
		if (modKey && e.key === 'f') {
			e.preventDefault();
			// Find the visible search input (could be mobile, tablet, or desktop)
			const searchInput = document.querySelector('.search-input:not([style*="display: none"])') as HTMLInputElement;
			if (searchInput) {
				searchInput.focus();
				searchInput.select();
			}
		}

		// Cmd/Ctrl + R: Refresh
		if (modKey && e.key === 'r') {
			e.preventDefault();
			// Find the visible refresh button and click it
			const refreshButton = document.querySelector('.refresh-button:not([style*="display: none"]):not(:disabled)') as HTMLButtonElement;
			if (refreshButton) {
				refreshButton.click();
			}
		}

		// Escape: Clear search and filters
		if (e.key === 'Escape') {
			// If search has content, clear it
			if (documentStore.state.searchQuery) {
				documentStore.setSearchQuery('');
				return;
			}
			// If category filter is active, clear it
			if (documentStore.state.selectedCategory) {
				documentStore.setSelectedCategory(null);
				return;
			}
			// If a search input is focused, blur it
			const activeElement = document.activeElement as HTMLElement;
			if (activeElement?.classList.contains('search-input')) {
				activeElement.blur();
			}
		}
	}

	$effect(() => {
		documentStore.loadDocuments();
		documentStore.loadConfig();
		documentStore.loadEnrichedCatalog();
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<main class="flex flex-col h-screen bg-background text-foreground">
	<CompactHeader />
	<DocumentGrid />
	<MobileActionBar />
	<Toaster position="bottom-right" />
</main>

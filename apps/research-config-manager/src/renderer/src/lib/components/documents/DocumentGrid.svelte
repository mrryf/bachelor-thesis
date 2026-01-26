<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import DocumentCard from "./DocumentCard.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import FileSearch from "@lucide/svelte/icons/file-search";

	const isLoading = $derived(documentStore.state.isLoading);
	const error = $derived(documentStore.state.error);
	const documents = $derived(documentStore.state.documents);
	const filteredDocs = $derived(documentStore.filteredDocuments);
	const searchQuery = $derived(documentStore.state.searchQuery);
	const selectedCategory = $derived(documentStore.state.selectedCategory);

	// Build filter description for empty state
	const filterDesc = $derived(() => {
		const parts = [];
		if (searchQuery) parts.push(`"${searchQuery}"`);
		if (selectedCategory) parts.push(`category "${selectedCategory}"`);
		return parts.length > 0 ? parts.join(' and ') : '';
	});
</script>

<ScrollArea class="flex-1">
	{#if isLoading}
		<!-- Loading state -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<RefreshCw class="h-8 w-8 text-muted-foreground animate-spin mb-4" />
			<p class="text-muted-foreground">Loading documents...</p>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<AlertCircle class="h-8 w-8 text-destructive mb-4" />
			<p class="text-destructive font-medium">Error loading documents</p>
			<p class="text-sm text-muted-foreground mt-1">{error}</p>
		</div>
	{:else if documents.length === 0}
		<!-- Empty state (no documents at all) -->
		<div class="flex flex-col items-center justify-center py-16 text-center px-4">
			<FileSearch class="h-12 w-12 text-muted-foreground mb-4" />
			<p class="text-muted-foreground font-medium">No documents found</p>
			<p class="text-sm text-muted-foreground mt-1">
				Make sure pageindex-state.json exists in the .claude directory.
			</p>
		</div>
	{:else if filteredDocs.length === 0}
		<!-- Empty filtered state (documents exist but none match filters) -->
		<div class="flex flex-col items-center justify-center py-16 text-center px-4">
			<FileSearch class="h-12 w-12 text-muted-foreground mb-4" />
			<p class="text-muted-foreground font-medium">No documents match {filterDesc()}</p>
			<p class="text-sm text-muted-foreground mt-1">
				Try adjusting your search or filter criteria.
			</p>
		</div>
	{:else}
		<!-- Document grid -->
		<div class="grid grid-cols-1 gap-1 p-4 pb-20 md:pb-4">
			{#each filteredDocs as doc (doc.name)}
				<DocumentCard document={doc} />
			{/each}
		</div>
	{/if}
</ScrollArea>

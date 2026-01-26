<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Button } from "$lib/components/ui/button";
	import DocumentCard from "./DocumentCard.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import FileSearch from "@lucide/svelte/icons/file-search";
	import X from "@lucide/svelte/icons/x";

	const isLoading = $derived(documentStore.state.isLoading);
	const error = $derived(documentStore.state.error);
	const documents = $derived(documentStore.state.documents);
	const filteredDocs = $derived(documentStore.filteredDocuments);
	const searchQuery = $derived(documentStore.state.searchQuery);
	const selectedCategory = $derived(documentStore.state.selectedCategory);

	// Determine empty state type
	const hasSearch = $derived(searchQuery.trim().length > 0);
	const hasFilter = $derived(selectedCategory !== null);

	function clearSearch() {
		documentStore.setSearchQuery('');
	}

	function clearFilter() {
		documentStore.setSelectedCategory(null);
	}

	function clearAll() {
		documentStore.setSearchQuery('');
		documentStore.setSelectedCategory(null);
	}
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
		<div class="flex flex-col items-center justify-center py-16 text-center px-4 max-w-md mx-auto">
			<FileSearch class="h-12 w-12 text-muted-foreground mb-4" />

			<!-- Contextual message based on filter type -->
			{#if hasSearch && hasFilter}
				<p class="text-muted-foreground font-medium">
					No documents match "{searchQuery}" in {selectedCategory}
				</p>
			{:else if hasSearch}
				<p class="text-muted-foreground font-medium">
					No documents match "{searchQuery}"
				</p>
			{:else if hasFilter}
				<p class="text-muted-foreground font-medium">
					No documents in "{selectedCategory}"
				</p>
			{/if}

			<!-- Helpful suggestions -->
			<div class="text-sm text-muted-foreground mt-3 space-y-1">
				<p>Try:</p>
				<ul class="list-disc list-inside text-left space-y-0.5">
					{#if hasSearch}
						<li>Check your spelling</li>
						<li>Search by author name (e.g., "Davis")</li>
						<li>Search by category (e.g., "TAM")</li>
					{/if}
					{#if hasFilter}
						<li>Select a different category</li>
					{/if}
				</ul>
			</div>

			<!-- Quick action buttons -->
			<div class="flex items-center gap-2 mt-4">
				{#if hasSearch}
					<Button variant="outline" size="sm" onclick={clearSearch}>
						<X class="h-3 w-3 mr-1" />
						Clear search
					</Button>
				{/if}
				{#if hasFilter}
					<Button variant="outline" size="sm" onclick={clearFilter}>
						<X class="h-3 w-3 mr-1" />
						Clear filter
					</Button>
				{/if}
				{#if hasSearch && hasFilter}
					<Button variant="secondary" size="sm" onclick={clearAll}>
						Clear all
					</Button>
				{/if}
			</div>
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

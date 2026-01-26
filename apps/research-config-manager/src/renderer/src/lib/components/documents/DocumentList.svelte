<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import DocumentItem from "./DocumentItem.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";

	function handleCategoryClick(category: string) {
		documentStore.setSelectedCategory(category);
	}

	const filtered = $derived(documentStore.filteredDocuments);
	const documents = $derived(documentStore.state.documents);
	const searchQuery = $derived(documentStore.state.searchQuery);
	const selectedCategory = $derived(documentStore.state.selectedCategory);
</script>

{#if documents.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-center">
		<p class="text-muted-foreground">No documents found.</p>
		<p class="text-sm text-muted-foreground mt-1">
			Make sure pageindex-state.json exists in the .claude directory.
		</p>
	</div>
{:else if filtered.length === 0}
	{@const filterDesc = [
		searchQuery && `"${searchQuery}"`,
		selectedCategory && `category "${selectedCategory}"`
	].filter(Boolean).join(' and ')}
	<div class="flex flex-col items-center justify-center py-12 text-center">
		<p class="text-muted-foreground">No documents match {filterDesc}</p>
	</div>
{:else}
	<ScrollArea class="h-[calc(100vh-380px)]">
		<div class="space-y-2 pr-4">
			{#each filtered as doc (doc.name)}
				<DocumentItem document={doc} onCategoryClick={handleCategoryClick} />
			{/each}
		</div>
	</ScrollArea>
{/if}

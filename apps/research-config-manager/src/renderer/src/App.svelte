<script lang="ts">
	import { onMount } from "svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import DocumentList from "$lib/components/documents/DocumentList.svelte";
	import StatsBar from "$lib/components/documents/StatsBar.svelte";
	import DocumentFilters from "$lib/components/documents/DocumentFilters.svelte";
	import CategoryChips from "$lib/components/documents/CategoryChips.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import { Toaster } from "svelte-sonner";

	const isLoading = $derived(documentStore.state.isLoading);
	const error = $derived(documentStore.state.error);

	onMount(async () => {
		await documentStore.loadDocuments();
		await documentStore.loadConfig();
	});
</script>

<div class="min-h-screen bg-background text-foreground">
	<Header />
	<main class="container mx-auto px-4 py-6 max-w-4xl">
		{#if error}
			<div class="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
				{error}
			</div>
		{/if}
		<StatsBar />
		<DocumentFilters />
		<CategoryChips />
		<DocumentList />
		{#if isLoading}
			<div class="flex items-center justify-center py-8">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		{/if}
	</main>
	<Toaster position="bottom-right" />
</div>

<script lang="ts">
	import { onMount } from "svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import CompactHeader from "$lib/components/layout/CompactHeader.svelte";
	import MobileFilterSheet from "$lib/components/mobile/MobileFilterSheet.svelte";
	import MobileActionBar from "$lib/components/mobile/MobileActionBar.svelte";
	import DocumentGrid from "$lib/components/documents/DocumentGrid.svelte";
	import { Toaster } from "svelte-sonner";

	onMount(async () => {
		await documentStore.loadDocuments();
		await documentStore.loadConfig();
	});
</script>

<main class="flex flex-col h-screen bg-background text-foreground">
	<CompactHeader />
	<MobileFilterSheet />
	<DocumentGrid />
	<MobileActionBar />
	<Toaster position="bottom-right" />
</main>

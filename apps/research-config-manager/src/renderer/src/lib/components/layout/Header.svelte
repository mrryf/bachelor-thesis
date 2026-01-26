<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import { Input } from "$lib/components/ui/input";
	import { documentStore } from "$lib/stores/document-store.svelte";
</script>

<header class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="drag-region h-8"></div>
	<div class="container mx-auto px-4 py-4 max-w-4xl">
		<h1 class="text-xl font-semibold mb-4">Research Config Manager</h1>
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search documents..."
				class="pl-10 no-drag"
				value={documentStore.state.searchQuery}
				oninput={(e) => documentStore.setSearchQuery(e.currentTarget.value)}
			/>
		</div>
	</div>
</header>

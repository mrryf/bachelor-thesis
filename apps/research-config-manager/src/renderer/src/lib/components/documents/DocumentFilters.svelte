<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import Search from "@lucide/svelte/icons/search";
	import X from "@lucide/svelte/icons/x";
	import { documentStore } from "$lib/stores/document-store.svelte";

	const categoryList = $derived(documentStore.categories);
	const searchQuery = $derived(documentStore.state.searchQuery);
	const selectedCategory = $derived(documentStore.state.selectedCategory);
	const hasFilters = $derived(searchQuery || selectedCategory);

	const selectedLabel = $derived(() => {
		if (!selectedCategory) {
			return `All categories (${categoryList.reduce((sum, c) => sum + c.count, 0)})`;
		}
		const cat = categoryList.find(c => c.name === selectedCategory);
		return cat ? `${cat.name} (${cat.count})` : selectedCategory;
	});

	function handleClearFilters() {
		documentStore.setSearchQuery('');
		documentStore.setSelectedCategory(null);
	}

	function handleCategoryChange(value: string | undefined) {
		documentStore.setSelectedCategory(value === 'all' ? null : (value ?? null));
	}
</script>

<div class="flex items-center gap-4 mb-4">
	<!-- Search Input -->
	<div class="relative flex-1 max-w-sm">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
		<Input
			placeholder="Search documents..."
			value={searchQuery}
			oninput={(e) => documentStore.setSearchQuery(e.currentTarget.value)}
			class="pl-9"
		/>
	</div>

	<!-- Category Dropdown -->
	<Select.Root
		type="single"
		value={selectedCategory ?? 'all'}
		onValueChange={handleCategoryChange}
	>
		<Select.Trigger class="w-48">
			<span class="truncate">{selectedLabel()}</span>
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="all">
				All categories ({categoryList.reduce((sum, c) => sum + c.count, 0)})
			</Select.Item>
			{#each categoryList as cat (cat.name)}
				<Select.Item value={cat.name}>
					{cat.name} ({cat.count})
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>

	<!-- Clear filters button -->
	{#if hasFilters}
		<Button variant="ghost" size="sm" onclick={handleClearFilters}>
			<X class="h-4 w-4 mr-1" />
			Clear
		</Button>
	{/if}
</div>

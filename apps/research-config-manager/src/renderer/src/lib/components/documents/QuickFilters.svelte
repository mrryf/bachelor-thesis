<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import { Button } from "$lib/components/ui/button";
	import X from "@lucide/svelte/icons/x";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { cn } from "$lib/utils";

	const TOP_N_CATEGORIES = 5;

	const categoryList = $derived(documentStore.categories);
	const selectedCategory = $derived(documentStore.state.selectedCategory);
	const totalDocs = $derived(categoryList.reduce((sum, c) => sum + c.count, 0));

	// Split categories into top N and remaining
	const topCategories = $derived(categoryList.slice(0, TOP_N_CATEGORIES));
	const remainingCategories = $derived(categoryList.slice(TOP_N_CATEGORIES));
	const hasMore = $derived(remainingCategories.length > 0);

	function handleCategoryClick(category: string | null) {
		documentStore.setSelectedCategory(category);
	}

	function handleDropdownChange(value: string | undefined) {
		if (value) {
			documentStore.setSelectedCategory(value);
		}
	}

	function handleClearFilter() {
		documentStore.setSelectedCategory(null);
	}
</script>

<div class="border-b bg-card/50 px-4 py-3">
	<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
		<!-- All button -->
		<Button
			variant={selectedCategory === null ? "default" : "outline"}
			size="sm"
			class="h-8 shrink-0"
			onclick={() => handleCategoryClick(null)}
		>
			All ({totalDocs})
		</Button>

		<!-- Top N category buttons -->
		{#each topCategories as cat (cat.name)}
			<Button
				variant={selectedCategory === cat.name ? "default" : "outline"}
				size="sm"
				class="h-8 shrink-0"
				onclick={() => handleCategoryClick(cat.name)}
			>
				{cat.name} ({cat.count})
			</Button>
		{/each}

		<!-- +X more dropdown for remaining categories -->
		{#if hasMore}
			<Select.Root
				type="single"
				value={selectedCategory && remainingCategories.some(c => c.name === selectedCategory) ? selectedCategory : undefined}
				onValueChange={handleDropdownChange}
			>
				<Select.Trigger class="h-8 shrink-0">
					<span class="text-sm">+{remainingCategories.length} more</span>
				</Select.Trigger>
				<Select.Content>
					{#each remainingCategories as cat (cat.name)}
						<Select.Item value={cat.name}>
							{cat.name} ({cat.count})
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}

		<!-- Clear filter button -->
		{#if selectedCategory}
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8 shrink-0"
				onclick={handleClearFilter}
				title="Clear filter"
			>
				<X class="h-4 w-4" />
			</Button>
		{/if}
	</div>
</div>

<style>
	/* Hide scrollbar but allow scrolling */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>

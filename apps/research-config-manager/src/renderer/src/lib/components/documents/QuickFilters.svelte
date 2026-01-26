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

<div class="border-b bg-card/50 px-4 py-3 overflow-hidden">
	<div class="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
		<!-- All button -->
		<Button
			variant={selectedCategory === null ? "default" : "outline"}
			size="sm"
			class="h-11 md:h-9 shrink-0 touch-manipulation"
			onclick={() => handleCategoryClick(null)}
		>
			All ({totalDocs})
		</Button>

		<!-- Top N category buttons -->
		{#each topCategories as cat (cat.name)}
			<Button
				variant={selectedCategory === cat.name ? "default" : "outline"}
				size="sm"
				class="h-11 md:h-9 shrink-0 whitespace-nowrap touch-manipulation"
				onclick={() => handleCategoryClick(cat.name)}
			>
				<span class="truncate max-w-[120px]">{cat.name}</span>
				<span class="ml-1">({cat.count})</span>
			</Button>
		{/each}

		<!-- +X more dropdown for remaining categories -->
		{#if hasMore}
			<Select.Root
				type="single"
				value={selectedCategory && remainingCategories.some(c => c.name === selectedCategory) ? selectedCategory : undefined}
				onValueChange={handleDropdownChange}
			>
				<Select.Trigger class="h-11 md:h-9 shrink-0 touch-manipulation">
					<span class="text-sm">+{remainingCategories.length} more</span>
				</Select.Trigger>
				<Select.Content>
					{#each remainingCategories as cat (cat.name)}
						<Select.Item value={cat.name}>
							<span class="truncate">{cat.name}</span> ({cat.count})
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
				class="h-11 w-11 md:h-9 md:w-9 shrink-0 touch-manipulation"
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

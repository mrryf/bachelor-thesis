<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import Check from "@lucide/svelte/icons/check";
	import X from "@lucide/svelte/icons/x";
	import Minus from "@lucide/svelte/icons/minus";
	import { cn } from "$lib/utils";
	import { documentStore } from "$lib/stores/document-store.svelte";

	const categoryList = $derived(documentStore.categories);

	async function handleToggleCategory(categoryName: string, allEnabled: boolean) {
		try {
			await documentStore.bulkToggleCategory(categoryName, !allEnabled);
		} catch (error) {
			console.error('Failed to toggle category:', error);
		}
	}
</script>

{#if categoryList.length > 0}
	<div class="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
		<span class="text-xs text-muted-foreground flex-shrink-0">Bulk toggle:</span>

		{#each categoryList as cat (cat.name)}
			{@const allEnabled = cat.enabledCount === cat.count}
			{@const someEnabled = cat.enabledCount > 0 && !allEnabled}
			<Badge
				variant="outline"
				class={cn(
					"cursor-pointer transition-colors flex items-center gap-1 flex-shrink-0",
					allEnabled && "bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300",
					someEnabled && "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-700 dark:text-yellow-300",
					!someEnabled && !allEnabled && "bg-gray-50 dark:bg-gray-900"
				)}
				onclick={() => handleToggleCategory(cat.name, allEnabled)}
			>
				{#if allEnabled}
					<Check class="h-3 w-3" />
				{:else if someEnabled}
					<Minus class="h-3 w-3" />
				{:else}
					<X class="h-3 w-3 text-gray-400" />
				{/if}
				{cat.name}
				<span class="text-xs opacity-60">
					{cat.enabledCount}/{cat.count}
				</span>
			</Badge>
		{/each}
	</div>
{/if}

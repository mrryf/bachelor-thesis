<script lang="ts">
	import { Popover, Portal } from "bits-ui";
	import { slide, fade } from "svelte/transition";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import Filter from "@lucide/svelte/icons/filter";
	import X from "@lucide/svelte/icons/x";
	import Check from "@lucide/svelte/icons/check";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";

	const { isMobile, isDesktop } = useBreakpoint();

	let open = $state(false);

	const categoryList = $derived(documentStore.categories);
	const selectedCategory = $derived(documentStore.state.selectedCategory);
	const totalDocs = $derived(categoryList.reduce((sum, c) => sum + c.count, 0));
	const hasActiveFilter = $derived(selectedCategory !== null);

	function handleCategorySelect(category: string | null) {
		documentStore.setSelectedCategory(category);
		// Close panel after selection on all viewports
		open = false;
	}

	function handleClearFilter() {
		documentStore.setSelectedCategory(null);
	}

	function handleClose() {
		open = false;
	}
</script>

<!-- Desktop: Popover -->
{#if isDesktop}
	<Popover.Root bind:open>
		<Popover.Trigger
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 filter-button"
		>
			<Filter class="h-4 w-4" />
			<span>Filter</span>
			{#if hasActiveFilter}
				<Badge variant="secondary" class="ml-1 px-1.5 py-0 text-xs">1</Badge>
			{/if}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Content
				class="w-72 p-0 bg-popover border rounded-lg shadow-lg z-50"
				sideOffset={8}
				align="start"
			>
			<div class="flex items-center justify-between px-4 py-3 border-b">
				<span class="text-sm font-medium">Filter by Category</span>
				{#if hasActiveFilter}
					<Button
						variant="ghost"
						size="sm"
						class="h-7 px-2 text-xs"
						onclick={handleClearFilter}
					>
						Clear
					</Button>
				{/if}
			</div>
			<ScrollArea class="max-h-80">
				<div class="p-2">
					<!-- All option -->
					<button
						type="button"
						class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors {selectedCategory === null ? 'bg-accent' : ''}"
						onclick={() => handleCategorySelect(null)}
					>
						<span>All</span>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground text-xs">{totalDocs}</span>
							{#if selectedCategory === null}
								<Check class="h-4 w-4 text-primary" />
							{/if}
						</div>
					</button>

					<!-- Category options -->
					{#each categoryList as cat (cat.name)}
						<button
							type="button"
							class="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors {selectedCategory === cat.name ? 'bg-accent' : ''}"
							onclick={() => handleCategorySelect(cat.name)}
						>
							<span class="truncate max-w-[180px]">{cat.name}</span>
							<div class="flex items-center gap-2">
								<span class="text-muted-foreground text-xs">{cat.count}</span>
								{#if selectedCategory === cat.name}
									<Check class="h-4 w-4 text-primary" />
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</ScrollArea>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
{:else}
	<!-- Mobile/Tablet: Button that triggers slide panel -->
	<Button
		variant="outline"
		size={isMobile ? "icon" : "sm"}
		class="{isMobile ? 'h-11 w-11' : 'h-9'} gap-2 touch-manipulation filter-button"
		onclick={() => open = !open}
	>
		<Filter class="h-4 w-4" />
		{#if !isMobile}
			<span>Filter</span>
		{/if}
		{#if hasActiveFilter}
			<Badge variant="secondary" class="{isMobile ? 'absolute -top-1 -right-1' : 'ml-1'} px-1.5 py-0 text-xs">1</Badge>
		{/if}
	</Button>
{/if}

<!-- Mobile/Tablet: Slide-down panel (portaled to body) -->
{#if !isDesktop && open}
	<Portal>
		<!-- Backdrop -->
		<button
			type="button"
			class="fixed inset-0 z-40 bg-black/50"
			transition:fade={{ duration: 150 }}
			onclick={handleClose}
			aria-label="Close filter panel"
		></button>

		<!-- Panel -->
		<div
			class="fixed {isMobile ? 'inset-x-0 bottom-0 rounded-t-xl max-h-[70vh]' : 'top-[120px] left-4 right-4 rounded-lg max-h-[60vh]'} z-50 bg-popover border shadow-lg overflow-hidden"
			transition:slide={{ duration: 200 }}
		>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 border-b bg-background/50">
			<span class="text-sm font-medium">Filter by Category</span>
			<div class="flex items-center gap-2">
				{#if hasActiveFilter}
					<Button
						variant="ghost"
						size="sm"
						class="h-8 px-2 text-xs"
						onclick={handleClearFilter}
					>
						Clear
					</Button>
				{/if}
				<Button
					variant="ghost"
					size="icon"
					class="h-8 w-8"
					onclick={handleClose}
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- Category list -->
		<ScrollArea class="max-h-[calc(70vh-60px)]">
			<div class="p-2">
				<!-- All option -->
				<button
					type="button"
					class="w-full flex items-center justify-between px-4 py-3 rounded-md text-sm hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation {selectedCategory === null ? 'bg-accent' : ''}"
					onclick={() => handleCategorySelect(null)}
				>
					<span>All</span>
					<div class="flex items-center gap-2">
						<span class="text-muted-foreground">{totalDocs}</span>
						{#if selectedCategory === null}
							<Check class="h-4 w-4 text-primary" />
						{/if}
					</div>
				</button>

				<!-- Category options -->
				{#each categoryList as cat (cat.name)}
					<button
						type="button"
						class="w-full flex items-center justify-between px-4 py-3 rounded-md text-sm hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation {selectedCategory === cat.name ? 'bg-accent' : ''}"
						onclick={() => handleCategorySelect(cat.name)}
					>
						<span class="truncate">{cat.name}</span>
						<div class="flex items-center gap-2">
							<span class="text-muted-foreground">{cat.count}</span>
							{#if selectedCategory === cat.name}
								<Check class="h-4 w-4 text-primary" />
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</ScrollArea>

		{#if isMobile}
			<!-- Safe area padding for mobile -->
			<div class="h-safe-area-inset-bottom bg-popover"></div>
		{/if}
		</div>
	</Portal>
{/if}

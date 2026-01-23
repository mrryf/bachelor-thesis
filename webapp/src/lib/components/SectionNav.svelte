<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";

	let {
		prevSection,
		nextSection,
	}: {
		prevSection?: {
			id: string;
			number: number | string;
			title: string;
		} | null;
		nextSection?: {
			id: string;
			number: number | string;
			title: string;
		} | null;
	} = $props();
</script>

<div class="mt-16 border-t-2 border-black pt-12">
	<nav
		class="flex items-center justify-between gap-8"
		aria-label="Section navigation"
	>
		<!-- Previous Section -->
		{#if prevSection}
			<a
				href="/vorstudie/{prevSection.id}"
				class="group flex flex-1 items-center gap-4 border-2 border-black p-6 transition-all hover:bg-black hover:text-white"
			>
				<ChevronLeft
					class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-white"
				/>
				<div class="min-w-0 flex-1 text-left">
					<div class="text-xs font-medium text-muted-foreground group-hover:text-white/70 mb-1">
						Vorheriger Abschnitt
					</div>
					<div
						class="truncate text-sm font-semibold transition-colors group-hover:text-white"
					>
						{prevSection.number}. {prevSection.title}
					</div>
				</div>
			</a>
		{:else}
			<div class="flex-1"></div>
		{/if}

		<!-- Next Section -->
		{#if nextSection}
			<a
				href="/vorstudie/{nextSection.id}"
				class="group flex flex-1 items-center gap-4 border-2 border-black p-6 transition-all hover:bg-black hover:text-white"
			>
				<div class="min-w-0 flex-1 text-right">
					<div class="text-xs font-medium text-muted-foreground group-hover:text-white/70 mb-1">
						Nächster Abschnitt
					</div>
					<div
						class="truncate text-sm font-semibold transition-colors group-hover:text-white"
					>
						{nextSection.number}. {nextSection.title}
					</div>
				</div>
				<ChevronRight
					class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-white"
				/>
			</a>
		{:else}
			<div class="flex-1"></div>
		{/if}
	</nav>
</div>

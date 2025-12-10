<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { ChevronLeft, ChevronRight } from "lucide-svelte";

	let {
		prevSection,
		nextSection,
	}: {
		prevSection?: { id: string; number: number; title: string } | null;
		nextSection?: { id: string; number: number; title: string } | null;
	} = $props();
</script>

<div class="mt-12 border-t pt-8">
	<nav
		class="flex items-center justify-between gap-4"
		aria-label="Section navigation"
	>
		<!-- Previous Section -->
		{#if prevSection}
			<a
				href="#{prevSection.id}"
				class="group flex flex-1 items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary hover:bg-accent"
			>
				<ChevronLeft
					class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
				/>
				<div class="min-w-0 flex-1 text-left">
					<div class="text-xs font-medium text-muted-foreground">
						Vorheriger Abschnitt
					</div>
					<div
						class="truncate text-sm font-semibold transition-colors group-hover:text-primary"
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
				href="#{nextSection.id}"
				class="group flex flex-1 items-center gap-3 rounded-lg border p-4 transition-all hover:border-primary hover:bg-accent"
			>
				<div class="min-w-0 flex-1 text-right">
					<div class="text-xs font-medium text-muted-foreground">
						Nächster Abschnitt
					</div>
					<div
						class="truncate text-sm font-semibold transition-colors group-hover:text-primary"
					>
						{nextSection.number}. {nextSection.title}
					</div>
				</div>
				<ChevronRight
					class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
				/>
			</a>
		{:else}
			<div class="flex-1"></div>
		{/if}
	</nav>
</div>

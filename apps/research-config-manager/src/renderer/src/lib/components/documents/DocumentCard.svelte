<script lang="ts">
	import FileText from "@lucide/svelte/icons/file-text";
	import ExternalLink from "@lucide/svelte/icons/external-link";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import { Switch } from "$lib/components/ui/switch";
	import { Badge } from "$lib/components/ui/badge";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";
	import { spotlight } from "$lib/effects/spotlight";
	import { cn, formatTokens } from "$lib/utils";
	import type { DocumentMetadata } from "@shared/types";

	interface Props {
		document: DocumentMetadata;
	}

	let { document }: Props = $props();

	const { isMobile } = useBreakpoint();

	// Get enriched data for this document
	const enriched = $derived(documentStore.getEnrichedDocument(document.name));

	// State for abstract expansion
	let showAbstract = $state(false);

	function handleToggle(checked: boolean) {
		documentStore.toggleDocument(document.name, checked);
	}

	function openDoi() {
		if (enriched?.doi) {
			window.open(`https://doi.org/${enriched.doi}`, '_blank');
		}
	}

	// Generate a stable ID from the document name
	const docId = $derived(`doc-${document.name.replace(/[^a-zA-Z0-9]/g, '-')}`);

	// Display focus if available, otherwise fallback to short filename
	const secondaryText = $derived(document.focus || document.shortName || document.name.replace(/\.pdf$/i, ''));

	// Show fewer badges on mobile (2 instead of 3)
	const maxBadges = $derived(isMobile ? 2 : 3);

	// Keywords from enriched data (limit to 3)
	const keywords = $derived(enriched?.keywords?.slice(0, 3) ?? []);

	// Truncated abstract for preview
	const abstractPreview = $derived(
		enriched?.abstract
			? (enriched.abstract.length > 150
				? enriched.abstract.slice(0, 150) + '...'
				: enriched.abstract)
			: null
	);
</script>

<div
	id={docId}
	class={cn(
		"group relative flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50 touch-manipulation overflow-hidden",
		document.isNew && "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500"
	)}
	title={document.name}
	use:spotlight
>
	<!-- Spotlight overlay (desktop only, respects prefers-reduced-motion) -->
	<div class="spotlight-overlay"></div>

	<!-- Border glow overlay (desktop only, respects prefers-reduced-motion) -->
	<div class="border-glow"></div>

	<!-- Icon -->
	<FileText class="h-4 w-4 shrink-0 text-muted-foreground relative z-10 mt-0.5" />

	<div class="flex-1 min-w-0 overflow-hidden relative z-10">
		<!-- Row 1: Paper Title + Toggle (always visible) -->
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
				<p class="text-sm font-medium truncate flex-1" title={enriched?.title || document.name}>
					{enriched?.shortTitle || enriched?.title || document.shortCitation}
				</p>
				{#if document.isNew}
					<Badge variant="outline" class="bg-amber-100 text-amber-800 border-amber-300 text-[10px] shrink-0">
						NEW
					</Badge>
				{/if}
				{#if enriched?.doi}
					<button
						onclick={openDoi}
						class="text-muted-foreground hover:text-primary transition-colors shrink-0"
						title="Open DOI"
					>
						<ExternalLink class="h-3 w-3" />
					</button>
				{/if}
			</div>
			<Switch checked={document.enabled} onCheckedChange={handleToggle} class="shrink-0 scale-110 md:scale-100" />
		</div>

		<!-- Row 2: Citation (Author Year) -->
		<p class="text-xs text-muted-foreground truncate" title={document.shortCitation}>
			{document.shortCitation}
		</p>

		<!-- Row 3: Hover-reveal details (hidden by default on desktop, always visible on mobile/touch) -->
		<div class={cn(
			"overflow-hidden transition-all duration-200",
			// Mobile: always visible (touch devices need info without hover)
			isMobile ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-1 group-focus-within:max-h-40 group-focus-within:opacity-100 group-focus-within:mt-1"
		)}>
			<!-- Focus/Purpose -->
			<p class="text-xs text-muted-foreground line-clamp-1 overflow-hidden" title={secondaryText}>
				{secondaryText}
			</p>

			<!-- Keywords (if available) -->
			{#if keywords.length > 0}
				<div class="flex items-center gap-1 mt-1 flex-wrap">
					{#each keywords as keyword (keyword)}
						<Badge variant="outline" class="text-[9px] px-1 py-0 text-muted-foreground border-muted">
							{keyword}
						</Badge>
					{/each}
				</div>
			{/if}

			<!-- Abstract preview (if available) -->
			{#if abstractPreview}
				<div class="mt-1">
					<button
						onclick={() => showAbstract = !showAbstract}
						class="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronDown class={cn("h-3 w-3 transition-transform", showAbstract && "rotate-180")} />
						Abstract
					</button>
					{#if showAbstract}
						<p class="text-[10px] text-muted-foreground mt-1 line-clamp-4">
							{enriched?.abstract}
						</p>
					{/if}
				</div>
			{/if}

			<!-- Badges + Metrics -->
			<div class="flex items-center gap-1 md:gap-1.5 mt-1 overflow-hidden">
				<!-- Categories -->
				<div class="flex items-center gap-1 min-w-0 flex-shrink">
					{#each document.categories.slice(0, maxBadges) as cat (cat)}
						<Badge variant="secondary" class="text-[10px] px-1.5 py-0 whitespace-nowrap">
							<span class="truncate max-w-[80px] inline-block">{cat}</span>
						</Badge>
					{/each}
					{#if document.categories.length > maxBadges}
						<span class="text-[10px] text-muted-foreground whitespace-nowrap">
							+{document.categories.length - maxBadges}
						</span>
					{/if}
				</div>

				<!-- Compact metrics -->
				<span class="text-[10px] text-muted-foreground ml-auto shrink-0 whitespace-nowrap">
					{document.pages}p • {formatTokens(document.tokenEstimate)}
				</span>
			</div>
		</div>
	</div>
</div>

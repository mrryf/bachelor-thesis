<script lang="ts">
	import FileText from "@lucide/svelte/icons/file-text";
	import { Switch } from "$lib/components/ui/switch";
	import { Badge } from "$lib/components/ui/badge";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { cn, formatTokens } from "$lib/utils";
	import type { DocumentMetadata } from "@shared/types";

	interface Props {
		document: DocumentMetadata;
	}

	let { document }: Props = $props();

	function handleToggle(checked: boolean) {
		documentStore.toggleDocument(document.name, checked);
	}

	// Generate a stable ID from the document name
	const docId = $derived(`doc-${document.name.replace(/[^a-zA-Z0-9]/g, '-')}`);

	// Display focus if available, otherwise fallback to short filename
	const secondaryText = $derived(document.focus || document.shortName || document.name.replace(/\.pdf$/i, ''));
</script>

<div
	id={docId}
	class={cn(
		"group relative flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50",
		document.isNew && "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500"
	)}
	title={document.name}
>
	<!-- Placeholder for spotlight/glow effects (Phase 4) -->
	<!-- These will be populated in Phase 4 -->

	<FileText class="h-4 w-4 shrink-0 text-muted-foreground" />

	<div class="flex-1 min-w-0">
		<!-- Citation + Toggle -->
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 min-w-0 flex-1">
				<p class="text-sm font-medium truncate" title={document.shortCitation}>
					{document.shortCitation}
				</p>
				{#if document.isNew}
					<Badge variant="outline" class="bg-amber-100 text-amber-800 border-amber-300 text-[10px] shrink-0">
						NEW
					</Badge>
				{/if}
			</div>
			<Switch checked={document.enabled} onCheckedChange={handleToggle} class="shrink-0" />
		</div>

		<!-- Focus/Purpose (1 line truncated) -->
		<p class="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={secondaryText}>
			{secondaryText}
		</p>

		<!-- Badges + Metrics -->
		<div class="flex items-center gap-1.5 mt-1">
			<!-- Categories (max 3 visible) -->
			{#each document.categories.slice(0, 3) as cat (cat)}
				<Badge variant="secondary" class="text-[10px] px-1.5 py-0">
					{cat}
				</Badge>
			{/each}
			{#if document.categories.length > 3}
				<span class="text-[10px] text-muted-foreground">
					+{document.categories.length - 3}
				</span>
			{/if}

			<!-- Relevance badge -->
			<Badge
				variant="outline"
				class={cn(
					"text-[10px] px-1.5 py-0",
					document.relevance === "FOUNDATIONAL" && "border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-400",
					document.relevance === "CORE" && "border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400",
					document.relevance === "SUPPORTING" && "border-gray-300 text-gray-500"
				)}
			>
				{document.relevance}
			</Badge>

			<!-- Compact metrics -->
			<span class="text-[10px] text-muted-foreground ml-auto shrink-0">
				{document.pages}p • {formatTokens(document.tokenEstimate)}
			</span>
		</div>
	</div>
</div>

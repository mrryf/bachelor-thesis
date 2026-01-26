<script lang="ts">
	import FileText from "@lucide/svelte/icons/file-text";
	import { Switch } from "$lib/components/ui/switch";
	import { Badge } from "$lib/components/ui/badge";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { cn, formatTokens } from "$lib/utils";
	import type { DocumentMetadata } from "@shared/types";

	interface Props {
		document: DocumentMetadata;
		onCategoryClick?: (category: string) => void;
	}

	let { document, onCategoryClick }: Props = $props();

	function handleToggle(checked: boolean) {
		documentStore.toggleDocument(document.name, checked);
	}

	// Generate a stable ID from the document name
	const docId = $derived(`doc-${document.name.replace(/[^a-zA-Z0-9]/g, '-')}`);
</script>

<div
	id={docId}
	class={cn(
		"flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50",
		document.isNew && "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500"
	)}
>
	<div class="flex items-start gap-3 min-w-0 flex-1">
		<FileText class="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2 flex-wrap">
				<p class="font-medium leading-snug truncate" title={document.name}>
					{document.shortCitation}
				</p>
				{#if document.isNew}
					<Badge variant="outline" class="bg-amber-100 text-amber-800 border-amber-300 text-xs">
						NEW
					</Badge>
				{/if}
			</div>

			<p class="text-xs text-muted-foreground truncate mt-0.5" title={document.name}>
				{document.name.replace(/\.pdf$/i, '')}
			</p>

			<div class="flex flex-wrap items-center gap-2 mt-2">
				<!-- Categories -->
				{#each document.categories.slice(0, 3) as cat (cat)}
					<Badge
						variant="secondary"
						class="text-xs cursor-pointer hover:bg-secondary/80"
						onclick={() => onCategoryClick?.(cat)}
					>
						{cat}
					</Badge>
				{/each}
				{#if document.categories.length > 3}
					<span class="text-xs text-muted-foreground">
						+{document.categories.length - 3}
					</span>
				{/if}

				<!-- Relevance badge -->
				<Badge
					variant="outline"
					class={cn(
						"text-xs",
						document.relevance === "FOUNDATIONAL" && "border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-400",
						document.relevance === "CORE" && "border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-400",
						document.relevance === "SUPPORTING" && "border-gray-300 text-gray-500"
					)}
				>
					{document.relevance}
				</Badge>

				<!-- Page count and tokens -->
				<span class="text-xs text-muted-foreground">
					{document.pages}p ~{formatTokens(document.tokenEstimate)} tok
				</span>
			</div>

			<!-- Focus description if available -->
			{#if document.focus}
				<p class="text-xs text-muted-foreground mt-1 line-clamp-1" title={document.focus}>
					{document.focus}
				</p>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-2 shrink-0">
		<span class="text-xs text-muted-foreground">
			{document.enabled ? 'Enabled' : 'Disabled'}
		</span>
		<Switch checked={document.enabled} onCheckedChange={handleToggle} />
	</div>
</div>

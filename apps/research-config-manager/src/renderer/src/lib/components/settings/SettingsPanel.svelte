<script lang="ts">
	import { fade, fly } from "svelte/transition";
	import { Button } from "$lib/components/ui/button";
	import * as Select from "$lib/components/ui/select";
	import { ScrollArea } from "$lib/components/ui/scroll-area";
	import { Separator } from "$lib/components/ui/separator";
	import Settings from "@lucide/svelte/icons/settings";
	import X from "@lucide/svelte/icons/x";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import BookOpen from "@lucide/svelte/icons/book-open";
	import { useBreakpoint } from "$lib/hooks/useBreakpoint.svelte";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import type { ModelPreference } from "@shared/types";

	let open = $state(false);

	const { isMobile } = useBreakpoint();

	// Model options
	const modelOptions: Array<{ value: ModelPreference; label: string; description: string }> = [
		{ value: 'haiku', label: 'Haiku', description: 'Fast, cost-effective' },
		{ value: 'sonnet', label: 'Sonnet', description: 'Balanced (Recommended)' },
		{ value: 'opus', label: 'Opus', description: 'Highest quality' }
	];

	// Get current preferences from store
	const preferences = $derived(documentStore.state.config?.preferences ?? {
		defaultModel: 'sonnet' as ModelPreference,
		showModelIndicator: true
	});

	const currentModel = $derived(preferences.defaultModel ?? 'sonnet');

	function handleClose() {
		open = false;
	}

	function handleToggle() {
		open = !open;
	}

	async function handleModelChange(value: string | undefined) {
		if (value && (value === 'haiku' || value === 'sonnet' || value === 'opus')) {
			try {
				await window.api.config.updatePreferences({ defaultModel: value });
			} catch (error) {
				console.error('Failed to update model preference:', error);
			}
		}
	}
</script>

<!-- Settings trigger button -->
<Button
	variant="ghost"
	size="icon"
	class={isMobile ? "h-11 w-11 touch-manipulation" : "h-9 w-9"}
	title="Settings"
	onclick={handleToggle}
>
	<Settings class="h-4 w-4" />
</Button>

<!-- Settings panel overlay -->
{#if open}
	<!-- Backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-50 bg-black/50"
		transition:fade={{ duration: 150 }}
		onclick={handleClose}
		aria-label="Close settings"
	></button>

	<!-- Panel -->
	<div
		class="fixed z-50 bg-popover border shadow-lg overflow-hidden {isMobile ? 'inset-x-0 bottom-0 rounded-t-xl max-h-[85vh]' : 'right-4 top-16 bottom-4 w-80 rounded-lg'}"
		transition:fly={{ x: isMobile ? 0 : 100, y: isMobile ? 100 : 0, duration: 200 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 border-b bg-background/50">
			<span class="text-sm font-semibold">Settings</span>
			<Button
				variant="ghost"
				size="icon"
				class="h-8 w-8"
				onclick={handleClose}
			>
				<X class="h-4 w-4" />
			</Button>
		</div>

		<!-- Content -->
		<ScrollArea class="h-[calc(100%-56px)]">
			<div class="p-4 space-y-6">
				<!-- Query Settings Section -->
				<section>
					<h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
						Query Settings
					</h3>
					<div class="space-y-3">
						<div class="rounded-lg border p-3">
							<div class="mb-3">
								<p class="text-sm font-medium">Preferred Model</p>
								<p class="text-xs text-muted-foreground mt-0.5">
									Affects Claude Code document queries
								</p>
							</div>
							<Select.Root
								type="single"
								value={currentModel}
								onValueChange={handleModelChange}
							>
								<Select.Trigger class="w-full h-9">
									<span class="text-sm">
										{modelOptions.find(m => m.value === currentModel)?.label ?? 'Sonnet'}
									</span>
								</Select.Trigger>
								<Select.Content>
									{#each modelOptions as option (option.value)}
										<Select.Item value={option.value}>
											<div class="flex flex-col">
												<span>{option.label}</span>
												<span class="text-xs text-muted-foreground">{option.description}</span>
											</div>
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>
				</section>

				<Separator />

				<!-- BibTeX Enrichment Section -->
				<section>
					<h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
						BibTeX Metadata
					</h3>
					<div class="space-y-3">
						<div class="rounded-lg border p-3">
							<div class="mb-3">
								<p class="text-sm font-medium">Sync Metadata</p>
								<p class="text-xs text-muted-foreground mt-0.5">
									Enrich documents with authors, abstracts, and keywords from Zotero
								</p>
							</div>
							{#if documentStore.state.enrichedCatalog}
								<div class="text-xs text-muted-foreground mb-2 space-y-1">
									<div class="flex items-center gap-2">
										<BookOpen class="h-3 w-3" />
										<span>{documentStore.state.enrichedCatalog.stats.matched} / {documentStore.state.enrichedCatalog.stats.totalPageIndex} matched</span>
									</div>
									<p>Last sync: {new Date(documentStore.state.enrichedCatalog.generatedAt).toLocaleDateString()}</p>
								</div>
							{/if}
							<Button
								variant="outline"
								size="sm"
								class="w-full"
								onclick={() => documentStore.syncBibtex(true)}
								disabled={documentStore.state.isSyncingBibtex}
							>
								{#if documentStore.state.isSyncingBibtex}
									<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
									Syncing...
								{:else}
									<RefreshCw class="h-4 w-4 mr-2" />
									Sync BibTeX
								{/if}
							</Button>
						</div>
					</div>
				</section>

				<Separator />

				<!-- Display Settings Section -->
				<section>
					<h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
						Display Settings
					</h3>
					<div class="space-y-3">
						<div class="rounded-lg border p-3">
							<p class="text-sm text-muted-foreground">
								Additional display options will be added here.
							</p>
						</div>
					</div>
				</section>

				<!-- App Info -->
				<Separator />
				<section>
					<h3 class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
						About
					</h3>
					<div class="text-xs text-muted-foreground space-y-1">
						<p>Research Config Manager</p>
						<p>Manage PageIndex document scope for Claude Code</p>
					</div>
				</section>
			</div>
		</ScrollArea>

		{#if isMobile}
			<!-- Safe area padding for mobile -->
			<div class="h-safe-area-inset-bottom bg-popover"></div>
		{/if}
	</div>
{/if}

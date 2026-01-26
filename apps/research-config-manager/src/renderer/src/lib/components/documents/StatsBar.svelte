<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { formatTokens } from "$lib/utils";
	import CheckCircle2 from "@lucide/svelte/icons/circle-check";
	import XCircle from "@lucide/svelte/icons/circle-x";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { toast } from "svelte-sonner";

	let isRefreshing = $state(false);

	const stats = $derived(documentStore.stats);
	const isLoading = $derived(documentStore.state.isLoading);

	async function handleRefresh() {
		isRefreshing = true;

		try {
			const result = await documentStore.refresh();

			if (result.success) {
				if (result.newDocuments.length > 0) {
					toast.success(`Found ${result.newDocuments.length} new document${result.newDocuments.length > 1 ? 's' : ''}`, {
						description: 'New documents are disabled by default',
						action: {
							label: 'View',
							onClick: () => {
								// Scroll to first new document
								const firstNew = result.newDocuments[0];
								const el = document.getElementById(`doc-${firstNew.replace(/[^a-zA-Z0-9]/g, '-')}`);
								el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
							}
						}
					});
				} else {
					toast.info('No new documents found');
				}

				if (result.removedDocuments.length > 0) {
					toast.warning(`${result.removedDocuments.length} document${result.removedDocuments.length > 1 ? 's' : ''} no longer in PageIndex`);
				}

				// Reload documents to update the list
				await documentStore.loadDocuments();
			} else {
				toast.error('Refresh failed', {
					description: result.error || 'Could not connect to PageIndex'
				});
			}
		} catch (error) {
			toast.error('Refresh failed', {
				description: error instanceof Error ? error.message : 'Unknown error'
			});
		} finally {
			isRefreshing = false;
		}
	}
</script>

<div class="mb-6 rounded-lg border bg-card p-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap items-center gap-4 text-sm">
			<div class="flex items-center gap-2">
				<span class="font-medium">{stats.total}</span>
				<span class="text-muted-foreground">documents</span>
			</div>
			<Separator orientation="vertical" class="h-4" />
			<div class="flex items-center gap-2">
				<span class="text-muted-foreground">~{formatTokens(stats.totalTokens)} tokens</span>
			</div>
			<Separator orientation="vertical" class="h-4" />
			<div class="flex items-center gap-1.5 text-green-600">
				<CheckCircle2 class="h-4 w-4" />
				<span>{stats.enabled} enabled</span>
				<span class="text-muted-foreground">({formatTokens(stats.enabledTokens)})</span>
			</div>
			<div class="flex items-center gap-1.5 text-muted-foreground">
				<XCircle class="h-4 w-4" />
				<span>{stats.disabled} disabled</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => documentStore.enableAll()}
				disabled={isLoading || isRefreshing}
			>
				Enable All
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => documentStore.disableAll()}
				disabled={isLoading || isRefreshing}
			>
				Disable All
			</Button>
			<Button
				variant="outline"
				size="icon"
				onclick={handleRefresh}
				disabled={isLoading || isRefreshing}
				title="Refresh from PageIndex"
			>
				<RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
			</Button>
		</div>
	</div>
</div>

<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import CheckCircle2 from "@lucide/svelte/icons/circle-check";
	import XCircle from "@lucide/svelte/icons/circle-x";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import { Input } from "$lib/components/ui/input";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { documentStore } from "$lib/stores/document-store.svelte";
	import { formatTokens } from "$lib/utils";
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

<header class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<!-- Electron drag region -->
	<div class="drag-region h-8"></div>

	<div class="px-4 py-3">
		<!-- Tablet layout: 2 rows for better fit (md to lg) -->
		<div class="hidden md:flex lg:hidden flex-col gap-2">
			<!-- Row 1: Title + Search + Refresh -->
			<div class="flex items-center gap-3">
				<h1 class="text-sm font-semibold whitespace-nowrap">Research Config</h1>
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search documents..."
						class="pl-10 h-9 no-drag"
						value={documentStore.state.searchQuery}
						oninput={(e) => documentStore.setSearchQuery(e.currentTarget.value)}
					/>
				</div>
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9 shrink-0"
					onclick={handleRefresh}
					disabled={isLoading || isRefreshing}
					title="Refresh from PageIndex"
				>
					<RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
				</Button>
			</div>

			<!-- Row 2: Stats + Action buttons -->
			<div class="flex items-center justify-between gap-4">
				<div class="flex items-center gap-2 text-xs">
					<div class="flex items-center gap-1">
						<span class="font-medium">{stats.total}</span>
						<span class="text-muted-foreground">docs</span>
					</div>
					<Separator orientation="vertical" class="h-3" />
					<div class="flex items-center gap-1 text-green-600">
						<CheckCircle2 class="h-3 w-3" />
						<span>{stats.enabled}</span>
					</div>
					<Separator orientation="vertical" class="h-3" />
					<div class="flex items-center gap-1 text-muted-foreground">
						<XCircle class="h-3 w-3" />
						<span>{stats.disabled}</span>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						class="h-9 whitespace-nowrap"
						onclick={() => documentStore.enableAll()}
						disabled={isLoading || isRefreshing}
					>
						Enable All
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-9 whitespace-nowrap"
						onclick={() => documentStore.disableAll()}
						disabled={isLoading || isRefreshing}
					>
						Disable All
					</Button>
				</div>
			</div>
		</div>

		<!-- Desktop layout: everything in one row (lg and up) -->
		<div class="hidden lg:flex items-center gap-4">
			<!-- Left: Title + Search -->
			<div class="flex items-center gap-4 flex-1 max-w-2xl">
				<h1 class="text-base font-semibold whitespace-nowrap">Research Config</h1>
				<div class="relative flex-1 min-w-0">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search documents..."
						class="pl-10 h-9 no-drag"
						value={documentStore.state.searchQuery}
						oninput={(e) => documentStore.setSearchQuery(e.currentTarget.value)}
					/>
				</div>
			</div>

			<!-- Center: Stats -->
			<div class="flex items-center gap-2 text-xs shrink-0">
				<div class="flex items-center gap-1.5">
					<span class="font-medium">{stats.total}</span>
					<span class="text-muted-foreground">docs</span>
				</div>
				<Separator orientation="vertical" class="h-3" />
				<div class="flex items-center gap-1 text-green-600">
					<CheckCircle2 class="h-3 w-3" />
					<span>{stats.enabled}</span>
					<span class="text-muted-foreground">({formatTokens(stats.enabledTokens)})</span>
				</div>
				<Separator orientation="vertical" class="h-3" />
				<div class="flex items-center gap-1 text-muted-foreground">
					<XCircle class="h-3 w-3" />
					<span>{stats.disabled}</span>
				</div>
			</div>

			<!-- Right: Action buttons -->
			<div class="flex items-center gap-2 shrink-0">
				<Button
					variant="outline"
					size="sm"
					class="h-9 whitespace-nowrap"
					onclick={() => documentStore.enableAll()}
					disabled={isLoading || isRefreshing}
				>
					Enable All
				</Button>
				<Button
					variant="outline"
					size="sm"
					class="h-9 whitespace-nowrap"
					onclick={() => documentStore.disableAll()}
					disabled={isLoading || isRefreshing}
				>
					Disable All
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="h-9 w-9"
					onclick={handleRefresh}
					disabled={isLoading || isRefreshing}
					title="Refresh from PageIndex"
				>
					<RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
				</Button>
			</div>
		</div>

		<!-- Mobile layout: stacked -->
		<div class="flex md:hidden flex-col gap-3">
			<!-- Title + Search -->
			<div class="flex flex-col gap-2">
				<h1 class="text-sm font-semibold">Research Config</h1>
				<div class="relative">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search..."
						class="pl-10 h-11 no-drag touch-manipulation"
						value={documentStore.state.searchQuery}
						oninput={(e) => documentStore.setSearchQuery(e.currentTarget.value)}
					/>
				</div>
			</div>

			<!-- Stats row -->
			<div class="flex items-center justify-between text-xs">
				<div class="flex items-center gap-2 min-w-0 flex-1">
					<div class="flex items-center gap-1">
						<span class="font-medium">{stats.total}</span>
						<span class="text-muted-foreground">docs</span>
					</div>
					<Separator orientation="vertical" class="h-3" />
					<div class="flex items-center gap-1 text-green-600">
						<CheckCircle2 class="h-3 w-3" />
						<span>{stats.enabled}</span>
					</div>
					<Separator orientation="vertical" class="h-3" />
					<div class="flex items-center gap-1 text-muted-foreground">
						<XCircle class="h-3 w-3" />
						<span>{stats.disabled}</span>
					</div>
				</div>

				<!-- Mobile refresh button (44px minimum) -->
				<div class="flex items-center gap-2 shrink-0">
					<Button
						variant="outline"
						size="icon"
						class="h-11 w-11 touch-manipulation"
						onclick={handleRefresh}
						disabled={isLoading || isRefreshing}
						title="Refresh from PageIndex"
					>
						<RefreshCw class="h-4 w-4 {isRefreshing ? 'animate-spin' : ''}" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</header>

<script lang="ts">
	import { page } from "$app/stores";
	import { Home } from "lucide-svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb";

	// Route name mapping for human-readable breadcrumbs
	const routeNames: Record<string, string> = {
		vorstudie: "Vorstudie",
		forschung: "Forschung",
		glossar: "Glossar",
		materialien: "Materialien",
		downloads: "Downloads",
	};

	// Derive breadcrumb items from current path
	const breadcrumbs = $derived.by(() => {
		const path = $page.url.pathname;

		// Homepage - no breadcrumbs needed
		if (path === "/") return [];

		const segments = path.split("/").filter(Boolean);

		return segments.map((segment, index) => {
			const href = "/" + segments.slice(0, index + 1).join("/");
			const isLast = index === segments.length - 1;
			const label = routeNames[segment] || segment;

			return { href, label, isLast };
		});
	});
</script>

{#if breadcrumbs.length > 0}
	<nav class="container mx-auto px-4 py-3" aria-label="Breadcrumb">
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<!-- Home link -->
				<Breadcrumb.Item>
					<Breadcrumb.Link href="/" class="flex items-center gap-1.5">
						<Home class="h-4 w-4" />
						<span class="sr-only">Home</span>
					</Breadcrumb.Link>
				</Breadcrumb.Item>

				<!-- Dynamic breadcrumb items -->
				{#each breadcrumbs as crumb}
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						{#if crumb.isLast}
							<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
						{:else}
							<Breadcrumb.Link href={crumb.href}>
								{crumb.label}
							</Breadcrumb.Link>
						{/if}
					</Breadcrumb.Item>
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</nav>
{/if}

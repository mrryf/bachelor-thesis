<script lang="ts">
	import { page } from "$app/stores";
	import Home from "@lucide/svelte/icons/home";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";

	// Route name mapping for human-readable breadcrumbs
	const routeLabels: Record<string, string> = {
		vorstudie: "Vorstudie",
		bachelorarbeit: "Bachelorarbeit",
		glossar: "Glossar",
		downloads: "Downloads",
		impressum: "Impressum",
		datenschutz: "Datenschutz",
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
			const label = routeLabels[segment] || segment;

			return { href, label, isLast };
		});
	});
</script>

{#if breadcrumbs.length > 0}
	<nav class="border-b-2 border-black bg-white" aria-label="Breadcrumb">
		<div class="container mx-auto px-6 md:px-12 py-6">
			<ol class="flex items-center gap-3 text-sm">
				<!-- Home link -->
				<li>
					<a
						href="/"
						class="flex items-center gap-2 hover:opacity-70 transition-opacity duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
					>
						<Home size={16} strokeWidth={1.5} />
						<span class="sr-only">Home</span>
					</a>
				</li>

				<!-- Dynamic breadcrumb items -->
				{#each breadcrumbs as crumb}
					<li class="flex items-center gap-3">
						<ChevronRight size={16} strokeWidth={1.5} class="text-mutedForeground" />
						{#if crumb.isLast}
							<span class="font-semibold">{crumb.label}</span>
						{:else}
							<a
								href={crumb.href}
								class="hover:opacity-70 transition-opacity duration-100 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
							>
								{crumb.label}
							</a>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</nav>
{/if}

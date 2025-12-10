<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import * as Sheet from "$lib/components/ui/sheet";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Quote, Copy, Check } from "lucide-svelte";

	let {
		title = "Vorstudie: Vertrauen in Künstliche Intelligenz",
		author = "Ihr Name",
		year = new Date().getFullYear().toString(),
		url = "",
	}: {
		title?: string;
		author?: string;
		year?: string;
		url?: string;
	} = $props();

	let citationSheetOpen = $state(false);
	let copiedFormat = $state<string | null>(null);

	// Get current URL if not provided
	const citationUrl = $derived(url || (typeof window !== "undefined" ? window.location.href : ""));

	// Citation formats
	const citations = $derived({
		APA: `${author} (${year}). ${title}. Abgerufen von ${citationUrl}`,
		MLA: `${author}. "${title}." ${year}. Web. ${new Date().toLocaleDateString("de-DE")}.`,
		Chicago: `${author}. "${title}." Zugriff am ${new Date().toLocaleDateString("de-DE")}. ${citationUrl}.`,
		BibTeX: `@misc{thesis${year},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  url = {${citationUrl}},
  note = {Zugriff am ${new Date().toLocaleDateString("de-DE")}}
}`,
	});

	async function copyCitation(format: keyof typeof citations) {
		try {
			await navigator.clipboard.writeText(citations[format]);
			copiedFormat = format;
			setTimeout(() => {
				copiedFormat = null;
			}, 2000);
		} catch (err) {
			console.error("Failed to copy citation:", err);
		}
	}
</script>

<Sheet.Root bind:open={citationSheetOpen}>
	<Sheet.Trigger asChild>
		<Button variant="outline" size="sm" class="gap-2">
			<Quote class="h-4 w-4" />
			Zitieren
		</Button>
	</Sheet.Trigger>

	<Sheet.Content side="bottom" class="h-[70vh] overflow-y-auto">
		<Sheet.Header class="mb-6">
			<Sheet.Title>Diese Arbeit zitieren</Sheet.Title>
			<Sheet.Description>
				Wählen Sie ein Zitationsformat und kopieren Sie es in Ihre Zwischenablage
			</Sheet.Description>
		</Sheet.Header>

		<div class="space-y-4">
			{#each Object.entries(citations) as [format, citation]}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-sm mb-2">{format}</h3>
								<p
									class="text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono text-xs"
								>
									{citation}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								class="flex-shrink-0"
								onclick={() => copyCitation(format as keyof typeof citations)}
								aria-label={`${format} Zitation kopieren`}
							>
								{#if copiedFormat === format}
									<Check class="h-4 w-4 text-green-500" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</Button>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		<div class="mt-6 text-xs text-muted-foreground">
			<p>
				Hinweis: Bitte überprüfen Sie das Format entsprechend den Richtlinien
				Ihrer Institution.
			</p>
		</div>
	</Sheet.Content>
</Sheet.Root>

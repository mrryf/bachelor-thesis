<script lang="ts">
    import { page } from "$app/stores";
    import { sections, calculateReadingTime } from "$lib/data/content";
    import { readingProgress } from "$lib/stores/readingProgress.svelte";
    import { Progress } from "$lib/components/ui/progress";
    import { Button } from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import { Separator } from "$lib/components/ui/separator";
    import Clock from "@lucide/svelte/icons/clock";
    import List from "@lucide/svelte/icons/list";
    import Check from "@lucide/svelte/icons/check";
    import CheckCircle2 from "@lucide/svelte/icons/check-circle-2";
    import BookOpen from "@lucide/svelte/icons/book-open";

    let { children } = $props();
    let tocSheetOpen = $state(false);

    // Derived active section from URL
    // Assuming URL is /vorstudie/[sectionId]
    // If at /vorstudie, default to first or handle as special case.
    // We will redirect /vorstudie to /vorstudie/einleitung in +page.svelte, so we can assume [sectionId] is present or handled.
    let activeSectionId = $derived($page.params.sectionId);
    let activeSubsectionId = $derived($page.url.hash.substring(1));

    // Tooltip State
    import GlossaryTooltip from "$lib/components/GlossaryTooltip.svelte";
    import CitationTooltip from "$lib/components/CitationTooltip.svelte";
    import { getReferenceById } from "$lib/data/references";

    let glossaryTooltipVisible = $state(false);
    let glossaryTooltipX = $state(0);
    let glossaryTooltipY = $state(0);
    let glossaryTooltipTerm = $state("");
    let glossaryTooltipDefinition = $state("");

    let citationTooltipVisible = $state(false);
    let citationTooltipX = $state(0);
    let citationTooltipY = $state(0);
    let citationRefId = $state("");

    // Setup global event listeners for tooltips
    $effect(() => {
        function handleHover(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("glossary-term")) {
                const rect = target.getBoundingClientRect();
                glossaryTooltipX = rect.left;
                glossaryTooltipY = rect.bottom;
                glossaryTooltipTerm =
                    target.getAttribute("data-glossary-term") || "";
                glossaryTooltipDefinition =
                    target.getAttribute("data-glossary-definition") || "";
                glossaryTooltipVisible = true;
            } else if (target.classList.contains("citation-ref")) {
                const rect = target.getBoundingClientRect();
                citationTooltipX = rect.left;
                citationTooltipY = rect.bottom;
                citationRefId = target.getAttribute("data-citation-id") || "";
                citationTooltipVisible = true;
            }
        }

        function handleLeave(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("glossary-term")) {
                glossaryTooltipVisible = false;
            } else if (target.classList.contains("citation-ref")) {
                citationTooltipVisible = false;
            }
        }

        document.addEventListener("mouseover", handleHover);
        document.addEventListener("mouseout", handleLeave);

        return () => {
            document.removeEventListener("mouseover", handleHover);
            document.removeEventListener("mouseout", handleLeave);
        };
    });

    function getSectionProgress(id: string) {
        return readingProgress.getProgress(id);
    }
</script>

<div class="flex min-h-screen">
    <!-- Sticky Table of Contents (Desktop) -->
    <aside
        class="hidden lg:block w-80 shrink-0 border-r-2 border-black bg-background"
        aria-label="Inhaltsverzeichnis"
    >
        <div class="sticky top-24 p-8">
            <div
                class="flex items-center gap-3 mb-8 text-sm font-medium text-muted-foreground"
            >
                <List class="h-4 w-4" />
                <span>Inhaltsverzeichnis</span>
            </div>

            <nav class="space-y-8" aria-label="Abschnitte">
                {#each sections as section}
                    {@const progress = getSectionProgress(section.id)}
                    <div class="space-y-4">
                        <a
                            href="/vorstudie/{section.id}"
                            class="flex items-start justify-between gap-3 text-sm font-medium transition-colors hover:text-primary {activeSectionId ===
                            section.id
                                ? 'text-primary'
                                : 'text-muted-foreground'}"
                        >
                            <span class="flex-1"
                                >{section.number}. {section.title}</span
                            >

                            {#if progress > 0}
                                <span
                                    class="text-xs font-normal text-muted-foreground shrink-0 tabular-nums"
                                >
                                    {progress}%
                                </span>
                            {/if}
                        </a>

                        <!-- Reading Time & Stats -->
                        <div
                            class="flex items-center gap-3 text-xs text-muted-foreground/60 pl-4"
                        >
                            <span class="flex items-center gap-2">
                                <Clock class="h-3 w-3" />
                                {calculateReadingTime(section.wordCount)} min
                            </span>
                        </div>

                        <!-- Subsections (Level 2) -->
                        {#if section.subsections && section.subsections.length > 0}
                            <div class="ml-4 space-y-2 border-l-2 border-black pl-4">
                                {#each section.subsections as subsection, i}
                                    <a
                                        href="/vorstudie/{section.id}#{subsection.id}"
                                        class="block py-2 text-xs transition-colors hover:text-primary {activeSubsectionId ===
                                            subsection.id &&
                                        activeSectionId === section.id
                                            ? 'text-foreground font-medium'
                                            : 'text-muted-foreground/80'}"
                                    >
                                        {section.number}.{i + 1}
                                        {subsection.title}
                                    </a>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/each}
            </nav>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0 px-8 md:px-12 lg:px-16">
        <!-- Mobile TOC Trigger -->
        <div class="lg:hidden">
            <Sheet.Root bind:open={tocSheetOpen}>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button
                            variant="outline"
                            size="icon"
                            class="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg border-2 border-black bg-white hover:bg-black hover:text-white"
                            {...props}
                        >
                            <List class="h-5 w-5" />
                            <span class="sr-only">Inhaltsverzeichnis</span>
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
            <Sheet.Content
                side="left"
                class="w-[85vw] sm:w-[540px] overflow-y-auto"
            >
                <Sheet.Header class="mb-6">
                    <Sheet.Title>Inhaltsverzeichnis</Sheet.Title>
                </Sheet.Header>

                <nav class="space-y-8">
                    {#each sections as section}
                        {@const progress = getSectionProgress(section.id)}
                        <div class="space-y-4">
                            <a
                                href="/vorstudie/{section.id}"
                                class="flex items-center justify-between gap-4 font-medium transition-colors hover:text-primary {activeSectionId ===
                                section.id
                                    ? 'text-primary'
                                    : 'text-foreground'}"
                                onclick={() => (tocSheetOpen = false)}
                            >
                                <span>{section.number}. {section.title}</span>
                                {#if progress > 0}
                                    <span
                                        class="text-xs font-normal text-muted-foreground tabular-nums"
                                    >
                                        {progress}%
                                    </span>
                                {/if}
                            </a>

                            <!-- Subsections Mobile -->
                            {#if section.subsections && section.subsections.length > 0}
                                <div class="ml-4 space-y-3 border-l-2 border-black pl-4">
                                    {#each section.subsections as subsection, i}
                                        <a
                                            href="/vorstudie/{section.id}#{subsection.id}"
                                            class="block py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                            onclick={() =>
                                                (tocSheetOpen = false)}
                                        >
                                            {section.number}.{i + 1}
                                            {subsection.title}
                                        </a>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </nav>
            </Sheet.Content>
            </Sheet.Root>
        </div>

        {@render children()}

        <!-- Global Tooltips -->
        <GlossaryTooltip
            visible={glossaryTooltipVisible}
            x={glossaryTooltipX}
            y={glossaryTooltipY}
            term={glossaryTooltipTerm}
            definition={glossaryTooltipDefinition}
        />

        <CitationTooltip
            visible={citationTooltipVisible}
            x={citationTooltipX}
            y={citationTooltipY}
            reference={getReferenceById(citationRefId)}
        />
    </main>
</div>

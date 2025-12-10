<script lang="ts">
    import {
        sections,
        totalWordCount,
        calculateReadingTime,
    } from "$lib/data/content";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Progress } from "$lib/components/ui/progress";
    import { Button } from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import ReadingTime from "$lib/components/ReadingTime.svelte";
    import SectionNav from "$lib/components/SectionNav.svelte";
    import CitationHelper from "$lib/components/CitationHelper.svelte";
    import ShareButton from "$lib/components/ShareButton.svelte";
    import { Callout } from "$lib/components/ui/callout";
    import GlossaryTooltip from "$lib/components/GlossaryTooltip.svelte";
    import CitationTooltip from "$lib/components/CitationTooltip.svelte";
    import { Clock, List } from "lucide-svelte";
    import { throttle, sanitizeHtml } from "$lib/utils";
    import { enhanceGlossaryTerms } from "$lib/actions/enhanceGlossaryTerms";
    import { enhanceCitations } from "$lib/actions/enhanceCitations";
    import { getReferenceById } from "$lib/data/references";
    import { readingProgress } from "$lib/stores/readingProgress.svelte";

    // Glossary tooltip state
    let glossaryTooltipVisible = $state(false);
    let glossaryTooltipX = $state(0);
    let glossaryTooltipY = $state(0);
    let glossaryTooltipTerm = $state("");
    let glossaryTooltipDefinition = $state("");

    // Citation tooltip state
    let citationTooltipVisible = $state(false);
    let citationTooltipX = $state(0);
    let citationTooltipY = $state(0);
    let citationRefId = $state("");

    const readingTime = calculateReadingTime(totalWordCount);

    let activeSection = $state("");
    let scrollProgress = $state(0);
    let tocSheetOpen = $state(false);

    // Setup glossary and citation tooltip event listeners
    $effect(() => {
        function handleGlossaryHover(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("glossary-term")) {
                const rect = target.getBoundingClientRect();
                glossaryTooltipX = rect.left;
                glossaryTooltipY = rect.bottom;
                glossaryTooltipTerm = target.getAttribute("data-glossary-term") || "";
                glossaryTooltipDefinition = target.getAttribute("data-glossary-definition") || "";
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

        document.addEventListener("mouseover", handleGlossaryHover);
        document.addEventListener("mouseout", handleLeave);

        return () => {
            document.removeEventListener("mouseover", handleGlossaryHover);
            document.removeEventListener("mouseout", handleLeave);
        };
    });

    /**
     * Calculates scroll progress with safety guard against division by zero
     */
    function updateScrollProgress() {
        const documentHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const scrolled = window.scrollY;

        // Prevent division by zero
        scrollProgress = documentHeight > 0
            ? Math.min((scrolled / documentHeight) * 100, 100)
            : 0;
    }

    // Throttle scroll handler to improve performance (max once per 100ms)
    const handleScroll = throttle(updateScrollProgress, 100);

    /**
     * Sets up Intersection Observer for efficient active section detection
     * and reading progress tracking
     */
    $effect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        activeSection = entry.target.id;

                        // Track reading progress
                        const section = sections.find((s) => s.id === entry.target.id);
                        if (section) {
                            readingProgress.update(
                                "/vorstudie",
                                section.id,
                                `${section.number}. ${section.title}`,
                                scrollProgress
                            );
                        }
                    }
                });
            },
            {
                rootMargin: "-100px 0px -80% 0px",
                threshold: 0,
            }
        );

        // Observe all sections
        const sectionElements = document.querySelectorAll("section[id]");
        sectionElements.forEach((section) => {
            observer.observe(section);
        });

        // Cleanup on unmount
        return () => {
            observer.disconnect();
        };
    });
</script>

<svelte:head>
    <title>Vorstudie - Vertrauen in KI</title>
</svelte:head>

<svelte:window onscroll={handleScroll} />

<div class="flex">
    <!-- Sticky Table of Contents (Desktop) -->
    <aside
        class="hidden lg:block w-64 shrink-0"
        aria-label="Inhaltsverzeichnis"
    >
        <div class="sticky top-20 p-4">
            <div
                class="flex items-center gap-2 mb-4 text-sm text-muted-foreground"
            >
                <List class="h-4 w-4" aria-hidden="true" />
                <span class="font-medium">Inhaltsverzeichnis</span>
            </div>

            <!-- Scroll Progress Bar -->
            <div class="mb-4">
                <Progress
                    value={scrollProgress}
                    class="h-1"
                    aria-label="Lesefortschritt: {Math.round(scrollProgress)} Prozent"
                />
                <p class="text-xs text-muted-foreground mt-1 text-center">
                    {Math.round(scrollProgress)}% gelesen
                </p>
            </div>

            <Separator class="mb-4" />

            <nav class="space-y-1" aria-label="Abschnitte">
                {#each sections as section}
                    <a
                        href="#{section.id}"
                        class="block py-1.5 px-3 text-sm rounded-md transition-colors {activeSection ===
                        section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
                        aria-current={activeSection === section.id
                            ? "location"
                            : undefined}
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span>
                                {section.number}. {section.title}
                            </span>
                            <span
                                class="flex items-center gap-1 text-xs opacity-70"
                                aria-label="{calculateReadingTime(
                                    section.wordCount
                                )} Minuten Lesezeit"
                            >
                                <Clock class="h-3 w-3" aria-hidden="true" />
                                {calculateReadingTime(section.wordCount)}
                            </span>
                        </div>
                    </a>
                {/each}
            </nav>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl mx-auto px-4 py-8">
        <header class="mb-12">
            <h1 class="text-4xl font-bold mb-4">Vorstudie</h1>
            <p class="text-xl text-muted-foreground mb-4">
                Vertrauen in Künstliche Intelligenz: Wie Framing das Vertrauen
                in LLM-basierte Applikationen beeinflusst
            </p>
            <div
                class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4"
                aria-label="Dokumentinformationen"
            >
                <ReadingTime minutes={readingTime} />
                <span aria-hidden="true">•</span>
                <span>{totalWordCount.toLocaleString()} Wörter</span>
            </div>
            <div class="flex flex-wrap gap-2">
                <ShareButton
                    title="Vorstudie: Vertrauen in Künstliche Intelligenz"
                    text="Wie Framing das Vertrauen in LLM-basierte Applikationen beeinflusst - Bachelorarbeit HSLU-W"
                />
                <CitationHelper
                    title="Vorstudie: Vertrauen in Künstliche Intelligenz - Wie Framing das Vertrauen in LLM-basierte Applikationen beeinflusst"
                />
            </div>
        </header>

        <!-- Demo Callouts -->
        <div class="mb-8 space-y-4">
            <Callout type="info" title="Interaktive Vorstudie">
                <p>
                    Dieses Dokument nutzt moderne Web-Technologien für eine
                    verbesserte Leseerfahrung. Fahren Sie mit der Maus über
                    <span class="font-semibold text-primary">hervorgehobene Begriffe</span>
                    für sofortige Definitionen.
                </p>
            </Callout>
        </div>

        {#each sections as section, index}
            <section id={section.id} class="mb-16 scroll-mt-24">
                <h2 class="text-3xl font-bold mb-6">
                    <span class="text-primary">{section.number}.</span>
                    {section.title}
                </h2>

                <div
                    class="prose prose-slate dark:prose-invert max-w-none mb-8"
                    use:enhanceGlossaryTerms
                    use:enhanceCitations
                >
                    {@html sanitizeHtml(section.content)}
                </div>

                {#if section.subsections && section.subsections.length > 0}
                    <div class="space-y-6">
                        {#each section.subsections as subsection, i}
                            <Card id={subsection.id} class="scroll-mt-24">
                                <CardHeader>
                                    <CardTitle class="text-lg">
                                        {section.number}.{i + 1}
                                        {subsection.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        class="prose prose-slate dark:prose-invert max-w-none"
                                        use:enhanceGlossaryTerms
                                        use:enhanceCitations
                                    >
                                        {@html sanitizeHtml(subsection.content)}
                                    </div>
                                </CardContent>
                            </Card>
                        {/each}
                    </div>
                {/if}

                <!-- Section Navigation -->
                <SectionNav
                    prevSection={index > 0
                        ? {
                                id: sections[index - 1].id,
                                number: sections[index - 1].number,
                                title: sections[index - 1].title,
                            }
                        : null}
                    nextSection={index < sections.length - 1
                        ? {
                                id: sections[index + 1].id,
                                number: sections[index + 1].number,
                                title: sections[index + 1].title,
                            }
                        : null}
                />
            </section>
        {/each}
    </main>

    <!-- Mobile TOC Floating Action Button -->
    <Sheet.Root bind:open={tocSheetOpen}>
        <Sheet.Trigger asChild>
            <Button
                variant="default"
                size="icon"
                class="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg lg:hidden"
                aria-label="Open table of contents"
            >
                <List class="h-6 w-6" />
            </Button>
        </Sheet.Trigger>

        <Sheet.Content side="bottom" class="h-[80vh] overflow-y-auto">
            <Sheet.Header class="mb-6">
                <Sheet.Title>Inhaltsverzeichnis</Sheet.Title>
                <Sheet.Description>
                    Navigiere durch die Abschnitte der Vorstudie
                </Sheet.Description>
            </Sheet.Header>

            <!-- TOC Navigation for Mobile -->
            <nav class="space-y-1" aria-label="Inhaltsverzeichnis">
                {#each sections as section}
                    <a
                        href="#{section.id}"
                        class="block rounded-lg px-4 py-3 text-sm transition-colors hover:bg-accent"
                        class:bg-accent={activeSection === section.id}
                        class:text-accent-foreground={activeSection ===
                            section.id}
                        class:font-medium={activeSection === section.id}
                        aria-current={activeSection === section.id
                            ? "location"
                            : undefined}
                        onclick={() => {
                            tocSheetOpen = false;
                        }}
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span>
                                {section.number}. {section.title}
                            </span>
                            <span
                                class="flex items-center gap-1 text-xs opacity-70"
                                aria-label="{calculateReadingTime(
                                    section.wordCount
                                )} Minuten Lesezeit"
                            >
                                <Clock class="h-3 w-3" aria-hidden="true" />
                                {calculateReadingTime(section.wordCount)}
                            </span>
                        </div>
                    </a>

                    <!-- Subsections in mobile TOC -->
                    {#if section.subsections && section.subsections.length > 0}
                        <div class="ml-4 space-y-1 border-l-2 border-muted pl-4">
                            {#each section.subsections as subsection, i}
                                <a
                                    href="#{subsection.id}"
                                    class="block rounded-lg px-3 py-2 text-xs transition-colors hover:bg-accent"
                                    class:bg-accent={activeSection ===
                                        subsection.id}
                                    class:text-accent-foreground={activeSection ===
                                        subsection.id}
                                    onclick={() => {
                                        tocSheetOpen = false;
                                    }}
                                >
                                    {section.number}.{i + 1}
                                    {subsection.title}
                                </a>
                            {/each}
                        </div>
                    {/if}
                {/each}
            </nav>
        </Sheet.Content>
    </Sheet.Root>

    <!-- Global Glossary Tooltip -->
    <GlossaryTooltip
        visible={glossaryTooltipVisible}
        x={glossaryTooltipX}
        y={glossaryTooltipY}
        term={glossaryTooltipTerm}
        definition={glossaryTooltipDefinition}
    />

    <!-- Global Citation Tooltip -->
    <CitationTooltip
        visible={citationTooltipVisible}
        x={citationTooltipX}
        y={citationTooltipY}
        reference={getReferenceById(citationRefId)}
    />
</div>

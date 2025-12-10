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
    import ReadingTime from "$lib/components/ReadingTime.svelte";
    import { Clock, List } from "lucide-svelte";
    import { throttle, sanitizeHtml } from "$lib/utils";

    const readingTime = calculateReadingTime(totalWordCount);

    let activeSection = $state("");
    let scrollProgress = $state(0);

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
     */
    $effect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        activeSection = entry.target.id;
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
                class="flex items-center gap-4 text-sm text-muted-foreground"
                aria-label="Dokumentinformationen"
            >
                <ReadingTime minutes={readingTime} />
                <span aria-hidden="true">•</span>
                <span>{totalWordCount.toLocaleString()} Wörter</span>
            </div>
        </header>

        {#each sections as section}
            <section id={section.id} class="mb-16 scroll-mt-24">
                <h2 class="text-3xl font-bold mb-6">
                    <span class="text-primary">{section.number}.</span>
                    {section.title}
                </h2>

                <div
                    class="prose prose-slate dark:prose-invert max-w-none mb-8"
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
                                    >
                                        {@html sanitizeHtml(subsection.content)}
                                    </div>
                                </CardContent>
                            </Card>
                        {/each}
                    </div>
                {/if}
            </section>
        {/each}
    </main>
</div>

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
    import ReadingTime from "$lib/components/ReadingTime.svelte";
    import { Clock, List } from "lucide-svelte";

    const readingTime = calculateReadingTime(totalWordCount);

    let activeSection = $state("");

    function handleScroll() {
        const sectionElements = document.querySelectorAll("section[id]");
        for (const section of sectionElements) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                activeSection = section.id;
                break;
            }
        }
    }
</script>

<svelte:head>
    <title>Vorstudie - Vertrauen in KI</title>
</svelte:head>

<svelte:window onscroll={handleScroll} />

<div class="flex">
    <!-- Sticky Table of Contents (Desktop) -->
    <aside class="hidden lg:block w-64 shrink-0">
        <div class="sticky top-20 p-4">
            <div
                class="flex items-center gap-2 mb-4 text-sm text-muted-foreground"
            >
                <List class="h-4 w-4" />
                <span class="font-medium">Inhaltsverzeichnis</span>
            </div>
            <nav class="space-y-1">
                {#each sections as section}
                    <a
                        href="#{section.id}"
                        class="block py-1.5 px-3 text-sm rounded-md transition-colors {activeSection ===
                        section.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'}"
                    >
                        {section.number}. {section.title}
                    </a>
                {/each}
            </nav>
            <Separator class="my-4" />
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock class="h-4 w-4" />
                <span>{readingTime} min Lesezeit</span>
            </div>
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
            <div class="flex items-center gap-4 text-sm text-muted-foreground">
                <ReadingTime minutes={readingTime} />
                <span>•</span>
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
                    {@html section.content}
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
                                        {@html subsection.content}
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

<script lang="ts">
    import { page } from "$app/stores";
    import { sections } from "$lib/data/content";
    import { Separator } from "$lib/components/ui/separator";
    import SectionNav from "$lib/components/SectionNav.svelte";
    import Figure from "$lib/components/Figure.svelte";
    import { throttle, sanitizeHtml } from "$lib/utils";
    import { enhanceGlossaryTerms } from "$lib/actions/enhanceGlossaryTerms";
    import { enhanceCitations } from "$lib/actions/enhanceCitations";
    import { readingProgress } from "$lib/stores/readingProgress.svelte";

    // Retrieve the active section ID from the route params
    let sectionId = $derived($page.params.sectionId);

    // Find the section data
    let section = $derived(sections.find((s) => s.id === sectionId));

    // Find index for navigation
    let sectionIndex = $derived(sections.findIndex((s) => s.id === sectionId));

    // Scroll progress capability
    let scrollProgress = $state(0);

    function updateScrollProgress() {
        const documentHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
        const scrolled = window.scrollY;

        // Prevent division by zero
        scrollProgress =
            documentHeight > 0
                ? Math.min((scrolled / documentHeight) * 100, 100)
                : 0;

        // Update store with progress
        if (section) {
            readingProgress.update(
                "/vorstudie",
                section.id,
                `${section.number}. ${section.title}`,
                scrollProgress,
            );
        }
    }

    const handleScroll = throttle(updateScrollProgress, 100);
</script>

<svelte:head>
    <title>{section ? `${section.title} - ` : ""}Vorstudie</title>
</svelte:head>

<svelte:window onscroll={handleScroll} />

{#if section}
    <div class="space-y-12 animate-in fade-in duration-500 py-12">
        <header class="mb-12">
            <h1 class="text-3xl font-bold mb-4">
                <span class="text-primary">{section.number}.</span>
                {section.title}
            </h1>
        </header>

        <!-- Main Content -->
        <div
            class="prose prose-slate dark:prose-invert max-w-none mb-16"
            use:enhanceGlossaryTerms
            use:enhanceCitations
        >
            {@html sanitizeHtml(section.content)}
        </div>

        <!-- Subsections -->
        {#if section.subsections && section.subsections.length > 0}
            <div class="space-y-16">
                {#each section.subsections as subsection, i}
                    <section id={subsection.id} class="scroll-mt-32">
                        <h3 class="text-2xl font-semibold mb-8">
                            <span class="text-primary"
                                >{section.number}.{i + 1}</span
                            >
                            {subsection.title}
                        </h3>
                        <div
                            class="prose prose-slate dark:prose-invert max-w-none"
                            use:enhanceGlossaryTerms
                            use:enhanceCitations
                        >
                            {@html sanitizeHtml(subsection.content)}
                        </div>

                        {#if subsection.figure}
                            <Figure
                                src={subsection.figure.src}
                                alt={subsection.figure.alt}
                                caption={subsection.figure.caption}
                                figureNumber={subsection.figure.figureNumber}
                            />
                        {/if}
                    </section>
                {/each}
            </div>
        {/if}

        <Separator class="my-16" />

        <!-- Navigation -->
        <SectionNav
            prevSection={sectionIndex > 0 ? sections[sectionIndex - 1] : null}
            nextSection={sectionIndex < sections.length - 1
                ? sections[sectionIndex + 1]
                : null}
        />
    </div>
{:else}
    <div class="p-8 text-center">
        <h1 class="text-2xl font-bold text-destructive">
            Abschnitt nicht gefunden
        </h1>
        <p class="text-muted-foreground mt-2">
            Der angeforderte Abschnitt existiert nicht.
        </p>
    </div>
{/if}

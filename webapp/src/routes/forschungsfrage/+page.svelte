<script lang="ts">
    import {
        getSectionBySlug,
        calculateReadingTime,
        getAdjacentSections,
    } from "$lib/data/content";
    import {
        Breadcrumb,
        BreadcrumbItem,
        BreadcrumbLink,
        BreadcrumbList,
        BreadcrumbPage,
        BreadcrumbSeparator,
    } from "$lib/components/ui/breadcrumb";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";
    import ReadingTime from "$lib/components/ReadingTime.svelte";
    import { ChevronLeft, ChevronRight } from "lucide-svelte";

    const section = getSectionBySlug("forschungsfrage");
    const { previous, next } = getAdjacentSections("forschungsfrage");
    const readingTime = section ? calculateReadingTime(section.wordCount) : 0;
</script>

<svelte:head>
    <title>{section?.title} - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <Breadcrumb class="mb-6">
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
                <BreadcrumbPage>{section?.title}</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <header class="mb-8">
        <div class="flex items-center gap-3 mb-4">
            <span class="text-4xl font-bold text-primary"
                >{section?.number}</span
            >
            <h1 class="text-4xl font-bold">{section?.title}</h1>
        </div>
        <ReadingTime minutes={readingTime} />
    </header>

    <article class="prose prose-slate dark:prose-invert max-w-none mb-12">
        {@html section?.content}
    </article>

    <Separator class="my-8" />

    <nav class="flex justify-between items-center">
        {#if previous}
            <a href={`/${previous.slug}`}>
                <Button variant="outline" class="gap-2">
                    <ChevronLeft class="h-4 w-4" />
                    <div class="text-left">
                        <div class="text-xs text-muted-foreground">
                            Vorherige
                        </div>
                        <div class="font-medium">
                            {previous.number}. {previous.title}
                        </div>
                    </div>
                </Button>
            </a>
        {:else}
            <div></div>
        {/if}

        {#if next}
            <a href={`/${next.slug}`}>
                <Button variant="outline" class="gap-2">
                    <div class="text-right">
                        <div class="text-xs text-muted-foreground">Nächste</div>
                        <div class="font-medium">
                            {next.number}. {next.title}
                        </div>
                    </div>
                    <ChevronRight class="h-4 w-4" />
                </Button>
            </a>
        {/if}
    </nav>
</div>

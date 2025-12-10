<script lang="ts">
    import { figures } from "$lib/data/content";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import Lightbox from "$lib/components/Lightbox.svelte";
    import { Image, Table, BookOpen } from "lucide-svelte";

    let lightboxOpen = $state(false);
    let lightboxSrc = $state("");
    let lightboxAlt = $state("");
    let lightboxCaption = $state("");

    function openLightbox(src: string, alt: string, caption: string) {
        lightboxSrc = src;
        lightboxAlt = alt;
        lightboxCaption = caption;
        lightboxOpen = true;
    }
</script>

<svelte:head>
    <title>Materialien - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
    <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">Materialien</h1>
        <p class="text-xl text-muted-foreground">
            Abbildungen, Tabellen und Quellen
        </p>
    </header>

    <!-- Figures Gallery -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <Image class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">Abbildungen</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
            {#each figures as figure, i}
                <Card
                    class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onclick={() => openLightbox(figure.src, figure.alt, `Abbildung ${i + 1}: ${figure.caption}`)}
                    role="button"
                    tabindex="0"
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            openLightbox(figure.src, figure.alt, `Abbildung ${i + 1}: ${figure.caption}`);
                        }
                    }}
                >
                    <div class="relative overflow-hidden">
                        <img
                            src={figure.src}
                            alt={figure.alt}
                            class="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                        />
                        <div
                            class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                        >
                            <div
                                class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3"
                            >
                                <Image class="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </div>
                    <CardContent class="py-4">
                        <p class="text-sm font-medium">Abbildung {i + 1}</p>
                        <p class="text-sm text-muted-foreground">
                            {figure.caption}
                        </p>
                    </CardContent>
                </Card>
            {/each}
        </div>

        <!-- Lightbox -->
        <Lightbox
            bind:open={lightboxOpen}
            src={lightboxSrc}
            alt={lightboxAlt}
            caption={lightboxCaption}
        />
    </section>

    <Separator class="my-12" />

    <!-- Tables -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <Table class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">Tabellen</h2>
        </div>
        <Card>
            <CardContent class="py-6">
                <p class="text-muted-foreground italic">
                    Tabellen werden aus den LaTeX-Dateien extrahiert und hier
                    angezeigt...
                </p>
            </CardContent>
        </Card>
    </section>

    <Separator class="my-12" />

    <!-- Bibliography -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <BookOpen class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">Quellen</h2>
        </div>
        <Card>
            <CardContent class="py-6">
                <p class="text-muted-foreground italic">
                    Literaturverzeichnis wird aus den LaTeX-Dateien
                    extrahiert...
                </p>
            </CardContent>
        </Card>
    </section>
</div>

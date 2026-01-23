<script lang="ts">
    import { figures } from "$lib/data/content";
    import Lightbox from "$lib/components/Lightbox.svelte";
    import Image from "@lucide/svelte/icons/image";
    import Table from "@lucide/svelte/icons/table";
    import BookOpen from "@lucide/svelte/icons/book-open";
    import Maximize2 from "@lucide/svelte/icons/maximize-2";

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

<div class="container mx-auto max-w-6xl px-6 md:px-12 py-24 lg:py-32">
    <header class="mb-24">
        <p class="text-mono-label mb-6">Forschungsmaterialien</p>
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            Materialien
        </h1>
        <p class="text-xl md:text-2xl max-w-3xl leading-relaxed">
            Abbildungen, Tabellen und Quellen
        </p>
    </header>

    <!-- Figures Gallery -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Image size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Abbildungen</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-0 border-2 border-black">
            {#each figures as figure, i}
                <button
                    class="group text-left border-black overflow-hidden hover-invert relative {i < figures.length - 2 ? 'border-b-2' : ''} {i % 2 === 0 && i < figures.length - 1 ? 'md:border-r-2' : ''}"
                    onclick={() =>
                        openLightbox(
                            figure.src,
                            figure.alt,
                            `Abbildung ${i + 1}: ${figure.caption}`,
                        )}
                    type="button"
                >
                    <div class="relative overflow-hidden bg-muted aspect-video">
                        <img
                            src={figure.src}
                            alt={figure.alt}
                            class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div
                            class="absolute inset-0 border-2 border-black group-hover:border-[4px] transition-all duration-100 pointer-events-none"
                        >
                        </div>
                        <div
                            class="absolute bottom-4 right-4 w-10 h-10 border-2 border-black bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                        >
                            <Maximize2 size={18} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div class="p-8">
                        <p class="font-mono uppercase tracking-wider text-xs mb-3 opacity-70 group-hover:opacity-100">
                            Abbildung {i + 1}
                        </p>
                        <p class="text-base leading-relaxed">
                            {figure.caption}
                        </p>
                    </div>
                </button>
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

    <!-- Section Divider -->
    <div class="section-divider"></div>

    <!-- Tables -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Table size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Tabellen</h2>
        </div>
        <div class="border-2 border-black p-12 text-center">
            <Table size={48} strokeWidth={1} class="mx-auto mb-6 opacity-20" />
            <p class="text-lg text-mutedForeground italic">
                Tabellen werden aus den LaTeX-Dateien extrahiert und hier angezeigt
            </p>
        </div>
    </section>

    <!-- Section Divider -->
    <div class="section-divider"></div>

    <!-- Bibliography -->
    <section class="mb-16">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <BookOpen size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Quellen</h2>
        </div>
        <div class="border-2 border-black p-12 text-center">
            <BookOpen size={48} strokeWidth={1} class="mx-auto mb-6 opacity-20" />
            <p class="text-lg text-mutedForeground italic">
                Literaturverzeichnis wird aus den LaTeX-Dateien extrahiert
            </p>
        </div>
    </section>
</div>

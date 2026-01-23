<script lang="ts">
    import { figures } from "$lib/data/content";
    import Lightbox from "$lib/components/Lightbox.svelte";
    import Download from "@lucide/svelte/icons/download";
    import FileText from "@lucide/svelte/icons/file-text";
    import FileSpreadsheet from "@lucide/svelte/icons/file-spreadsheet";
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

    const downloads = [
        {
            title: "Vorstudie (PDF)",
            description: "Die vollständige Vorstudie als PDF-Dokument",
            filename: "vorstudie.pdf",
            icon: FileText,
            available: false,
        },
        {
            title: "Daten (CSV)",
            description: "Rohdaten des Experiments",
            filename: "data.csv",
            icon: FileSpreadsheet,
            available: false,
        },
    ];
</script>

<svelte:head>
    <title>Downloads - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-6 md:px-12 py-24 lg:py-32">
    <header class="mb-24">
        <p class="text-mono-label mb-6">Materialien & Dokumente</p>
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            Downloads
        </h1>
        <p class="text-xl md:text-2xl max-w-3xl leading-relaxed">
            PDF-Dokumente, Abbildungen und Daten
        </p>
    </header>

    <!-- Downloads Section -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Download size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Dokumente</h2>
        </div>

        <div class="grid md:grid-cols-2 gap-0 border-2 border-black">
            {#each downloads as item, i}
                {@const Icon = item.icon}
                <div
                    class="group border-black p-8 lg:p-12 {i < downloads.length - 1 && downloads.length > 1 ? 'md:border-r-2' : ''} opacity-60"
                >
                    <div class="mb-6">
                        <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                            <Icon size={24} strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 class="font-display text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
                        {item.title}
                    </h3>
                    <p class="text-base lg:text-lg leading-relaxed opacity-70 mb-6">
                        {item.description}
                    </p>
                    <button
                        disabled
                        class="inline-flex items-center gap-2 bg-black text-white px-6 py-3 text-sm uppercase tracking-widest font-medium border-2 border-black opacity-50 cursor-not-allowed"
                    >
                        <Download size={16} strokeWidth={1.5} />
                        Noch nicht verfügbar
                    </button>
                </div>
            {/each}
        </div>
        <p class="text-mono-label mt-4 text-center">
            Downloads werden nach Abschluss der Arbeit verfügbar sein
        </p>
    </section>

    <!-- Section Divider -->
    <div class="section-divider"></div>

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

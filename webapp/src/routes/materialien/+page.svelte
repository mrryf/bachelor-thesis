<script lang="ts">
    import { figures } from "$lib/data/content";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { Image, Table, BookOpen } from "lucide-svelte";
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
                <Card class="overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                        src={figure.src}
                        alt={figure.alt}
                        class="w-full aspect-video object-cover"
                    />
                    <CardContent class="py-4">
                        <p class="text-sm font-medium">Abbildung {i + 1}</p>
                        <p class="text-sm text-muted-foreground">
                            {figure.caption}
                        </p>
                    </CardContent>
                </Card>
            {/each}
        </div>
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

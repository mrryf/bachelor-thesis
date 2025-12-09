<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
    } from "$lib/components/ui/card";
    import { Download, FileText, FileSpreadsheet } from "lucide-svelte";

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

<div class="container mx-auto max-w-4xl px-4 py-8">
    <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">Downloads</h1>
        <p class="text-xl text-muted-foreground">
            PDF-Dokumente und Daten zum Herunterladen
        </p>
    </header>

    <div class="grid gap-6">
        {#each downloads as item}
            <Card class="opacity-60">
                <CardHeader>
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-lg bg-muted">
                            <svelte:component
                                this={item.icon}
                                class="h-6 w-6 text-muted-foreground"
                            />
                        </div>
                        <div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription
                            >
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button disabled class="gap-2">
                        <Download class="h-4 w-4" />
                        Noch nicht verfügbar
                    </Button>
                </CardContent>
            </Card>
        {/each}
    </div>

    <p class="text-sm text-muted-foreground mt-8 text-center">
        Downloads werden nach Abschluss der Arbeit verfügbar sein.
    </p>
</div>

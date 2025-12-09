<script lang="ts">
    import { glossaryTerms } from "$lib/data/content";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Search } from "lucide-svelte";

    let searchQuery = $state("");

    const filteredTerms = $derived(
        glossaryTerms.filter(
            (t) =>
                t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.definition.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
</script>

<svelte:head>
    <title>Glossar - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
    <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">Glossar</h1>
        <p class="text-xl text-muted-foreground mb-8">
            Begriffe und Definitionen
        </p>

        <!-- Search -->
        <div class="relative max-w-md">
            <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <input
                type="text"
                placeholder="Begriff suchen..."
                bind:value={searchQuery}
                class="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    </header>

    <div class="space-y-4">
        {#each filteredTerms as item}
            <Card>
                <CardContent class="py-4">
                    <dt class="font-mono font-bold text-primary text-lg">
                        {item.term}
                    </dt>
                    <dd class="text-muted-foreground mt-1">
                        {item.definition}
                    </dd>
                </CardContent>
            </Card>
        {:else}
            <p class="text-muted-foreground text-center py-8">
                Keine Begriffe gefunden für "{searchQuery}"
            </p>
        {/each}
    </div>
</div>

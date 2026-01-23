<script lang="ts">
    import { glossaryTerms } from "$lib/data/content";
    import Search from "@lucide/svelte/icons/search";

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

<div class="container mx-auto max-w-6xl px-6 md:px-12 py-24 lg:py-32">
    <header class="mb-24">
        <p class="text-mono-label mb-6">Begriffe und Definitionen</p>
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-12 tracking-tight">
            Glossar
        </h1>

        <!-- Decorative Line -->
        <div class="h-1 bg-black w-32 mb-16"></div>

        <!-- Search -->
        <div class="max-w-2xl">
            <label for="search" class="text-mono-label block mb-4">
                Suche
            </label>
            <div class="relative">
                <Search
                    size={20}
                    strokeWidth={1.5}
                    class="absolute left-4 top-1/2 -translate-y-1/2 text-mutedForeground"
                />
                <input
                    id="search"
                    type="text"
                    placeholder="Begriff oder Definition suchen..."
                    bind:value={searchQuery}
                    class="w-full pl-12 pr-4 py-4 border-2 border-black bg-white focus:outline-none focus:border-b-[4px] transition-all text-base"
                />
            </div>
        </div>
    </header>

    <!-- Glossary List -->
    {#if filteredTerms.length > 0}
        <dl class="border-t-2 border-black">
            {#each filteredTerms as item, i}
                <div class="border-b-2 border-black py-12 grid md:grid-cols-4 gap-12">
                    <dt class="font-mono uppercase tracking-wider text-sm font-semibold md:col-span-1">
                        {item.term}
                    </dt>
                    <dd class="text-lg leading-relaxed md:col-span-3">
                        {item.definition}
                    </dd>
                </div>
            {/each}
        </dl>
    {:else}
        <div class="border-2 border-black p-16 text-center">
            <Search size={48} strokeWidth={1} class="mx-auto mb-6 opacity-20" />
            <p class="text-lg text-mutedForeground">
                Keine Begriffe gefunden für <span class="font-semibold">"{searchQuery}"</span>
            </p>
        </div>
    {/if}

    <!-- Stats -->
    <div class="mt-16 pt-16 border-t-2 border-black">
        <p class="text-mono-label">
            {filteredTerms.length} von {glossaryTerms.length} Begriffen
        </p>
    </div>
</div>

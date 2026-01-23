<script lang="ts">
    import HypothesisDiagram from "$lib/components/HypothesisDiagram.svelte";
    import FlaskConical from "@lucide/svelte/icons/flask-conical";
    import Target from "@lucide/svelte/icons/target";
    import Lightbulb from "@lucide/svelte/icons/lightbulb";
    import Layout from "@lucide/svelte/icons/layout";

    const hypotheses = [
        {
            id: "H1a",
            path: "Stimulus Positiv → XAIT",
            direction: "+",
            basis: "Attribute Frame",
        },
        {
            id: "H1b",
            path: "Stimulus Negativ → XAIT",
            direction: "−",
            basis: "Attribute Frame",
        },
        { id: "H2", path: "XAIT → PU", direction: "+", basis: "AI-TAM" },
        { id: "H3", path: "XAIT → PEOU", direction: "+", basis: "AI-TAM" },
        { id: "H4", path: "PEOU → PU", direction: "+", basis: "TAM" },
        { id: "H5", path: "PU → BI", direction: "+", basis: "TAM" },
        { id: "H6", path: "PEOU → BI", direction: "+", basis: "TAM" },
        { id: "H7", path: "PU → CI", direction: "+", basis: "AI-TAM" },
        { id: "H8", path: "BI → CI", direction: "+", basis: "AI-TAM" },
        {
            id: "H9",
            path: "FAMTEC → PU",
            direction: "+",
            basis: "TAM Extension",
        },
    ];
</script>

<svelte:head>
    <title>Forschung - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-6 md:px-12 py-24 lg:py-32">
    <header class="mb-24">
        <p class="text-mono-label mb-6">Wissenschaftliche Grundlagen</p>
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
            Forschung
        </h1>
        <p class="text-xl md:text-2xl max-w-3xl leading-relaxed">
            Hypothesen, AI-TAM Modell und Experimentdesign
        </p>
    </header>

    <!-- Research Question -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Target size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Forschungsfrage</h2>
        </div>

        <div class="border-2 border-black p-8 md:p-12 bg-white">
            <div class="text-5xl md:text-6xl leading-none mb-8 opacity-20">"</div>
            <blockquote class="text-2xl md:text-3xl font-display italic leading-tight -mt-12">
                Wie beeinflusst das Framing von Konfidenzangaben einer
                LLM-basierten Applikation das Vertrauen der Nutzer und deren
                Nutzungsabsicht?
            </blockquote>
            <div class="text-5xl md:text-6xl leading-none mt-8 text-right opacity-20">"</div>
        </div>
    </section>

    <!-- Section Divider -->
    <div class="section-divider"></div>

    <!-- AI-TAM Model -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Lightbulb size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">AI-TAM Modell</h2>
        </div>

        <div class="border-2 border-black overflow-hidden bg-muted">
            <img
                src="/images/ba_faryf_ai_tam.jpg"
                alt="AI-TAM Model"
                class="w-full"
            />
        </div>
        <p class="text-mono-label mt-4">
            Erweitertes TAM-Modell: Artificial Intelligence-Technology Acceptance Model (AI-TAM)
        </p>
    </section>

    <!-- Section Divider -->
    <div class="section-divider"></div>

    <!-- Hypotheses -->
    <section class="mb-32">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <FlaskConical size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Hypothesen</h2>
        </div>

        <!-- Hypothesis Diagram -->
        <div class="border-2 border-black p-8 mb-12 bg-white">
            <HypothesisDiagram />
            <p class="text-mono-label mt-6 text-center">
                Interaktives Modell: Bewegen Sie die Maus über die Elemente für Details
            </p>
        </div>

        <!-- Hypotheses Grid -->
        <div class="grid md:grid-cols-2 gap-0 border-2 border-black">
            {#each hypotheses as h, i}
                <div
                    class="p-8 border-black {i < hypotheses.length - 2 ? 'border-b-2' : ''} {i % 2 === 0 && i < hypotheses.length - 1 ? 'md:border-r-2' : ''}"
                >
                    <div class="flex items-start justify-between mb-4">
                        <span class="font-mono text-lg font-bold">{h.id}</span>
                        <span class="text-2xl font-bold">
                            {h.direction}
                        </span>
                    </div>
                    <p class="text-base mb-3">{h.path}</p>
                    <p class="text-mono-label opacity-70">
                        {h.basis}
                    </p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Section Divider -->
    <div class="section-divider"></div>

    <!-- Experiment Design -->
    <section class="mb-16">
        <div class="flex items-center gap-4 mb-12">
            <div class="w-12 h-12 border-2 border-black flex items-center justify-center">
                <Layout size={24} strokeWidth={1.5} />
            </div>
            <h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Experimentdesign</h2>
        </div>

        <div class="border-2 border-black overflow-hidden bg-muted">
            <img
                src="/images/ba_faryf_ablauf_experiment.jpg"
                alt="Experiment Flow"
                class="w-full"
            />
        </div>
        <p class="text-mono-label mt-4">
            Ablauf des Experiments
        </p>
    </section>
</div>

<script lang="ts">
    import { figures } from "$lib/data/content";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { FlaskConical, Target, Lightbulb } from "lucide-svelte";

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
    ];
</script>

<svelte:head>
    <title>Forschung - Vertrauen in KI</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
    <header class="mb-12">
        <h1 class="text-4xl font-bold mb-4">Forschung</h1>
        <p class="text-xl text-muted-foreground">
            Hypothesen, AI-TAM Modell und Experimentdesign
        </p>
    </header>

    <!-- Research Question -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <Target class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">Forschungsfrage</h2>
        </div>
        <Card class="bg-primary/5 border-primary/20">
            <CardContent class="py-6">
                <blockquote class="text-lg italic">
                    «Wie beeinflusst das Framing von Konfidenzangaben einer
                    LLM-basierten Applikation das Vertrauen der Nutzer und deren
                    Nutzungsabsicht?»
                </blockquote>
            </CardContent>
        </Card>
    </section>

    <!-- AI-TAM Model -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <Lightbulb class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">AI-TAM Modell</h2>
        </div>
        <Card>
            <CardContent class="py-6">
                <img
                    src="/images/ba_faryf_ai_tam.jpg"
                    alt="AI-TAM Model"
                    class="w-full rounded-lg"
                />
                <p class="text-sm text-muted-foreground mt-4 text-center">
                    Erweitertes TAM-Modell: Artificial Intelligence-Technology
                    Acceptance Model (AI-TAM)
                </p>
            </CardContent>
        </Card>
    </section>

    <!-- Hypotheses -->
    <section class="mb-16">
        <div class="flex items-center gap-3 mb-6">
            <FlaskConical class="h-6 w-6 text-primary" />
            <h2 class="text-2xl font-semibold">Hypothesen</h2>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
            {#each hypotheses as h}
                <Card class="hover:shadow-md transition-shadow">
                    <CardContent class="py-4">
                        <div class="flex items-start justify-between">
                            <div>
                                <span class="font-mono font-bold text-primary"
                                    >{h.id}</span
                                >
                                <p class="text-sm mt-1">{h.path}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-lg font-bold {h.direction ===
                                    '+'
                                        ? 'text-positive'
                                        : 'text-negative'}"
                                >
                                    {h.direction}
                                </span>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground mt-2">
                            {h.basis}
                        </p>
                    </CardContent>
                </Card>
            {/each}
        </div>
    </section>

    <!-- Experiment Design -->
    <section class="mb-16">
        <h2 class="text-2xl font-semibold mb-6">Experimentdesign</h2>
        <div class="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>3x2 Faktorielles Design</CardTitle>
                </CardHeader>
                <CardContent>
                    <img
                        src="/images/ba_faryf_experiment_design_3x2.jpg"
                        alt="3x2 Design"
                        class="w-full rounded-lg"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ablauf Experiment</CardTitle>
                </CardHeader>
                <CardContent>
                    <img
                        src="/images/ba_faryf_ablauf_experiment.jpg"
                        alt="Experiment Flow"
                        class="w-full rounded-lg"
                    />
                </CardContent>
            </Card>
        </div>
    </section>
</div>

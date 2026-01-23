<script lang="ts">
    import { fade } from "svelte/transition";

    // Type definitions
    interface Node {
        id: string;
        label: string;
        fullName: string;
        x: number;
        y: number;
    }

    interface Hypothesis {
        id: string;
        source: string;
        target: string;
        direction: "+" | "−";
        description: string;
        curve?: number;
    }

    // Constants
    const NODE_WIDTH = 100;
    const NODE_HEIGHT = 56;
    const NODE_RADIUS = 4;

    // Node definitions with full names
    const nodes: Node[] = [
        {
            id: "stimulus",
            label: "Stimulus",
            fullName: "Experimentelle Manipulation",
            x: 60,
            y: 180,
        },
        {
            id: "famtec",
            label: "FAMTEC",
            fullName: "Technology Familiarity",
            x: 60,
            y: 340,
        },
        {
            id: "xait",
            label: "XAIT",
            fullName: "Explainable AI Trust",
            x: 240,
            y: 180,
        },
        {
            id: "peou",
            label: "PEOU",
            fullName: "Perceived Ease of Use",
            x: 440,
            y: 100,
        },
        {
            id: "pu",
            label: "PU",
            fullName: "Perceived Usefulness",
            x: 440,
            y: 300,
        },
        {
            id: "bi",
            label: "BI",
            fullName: "Behavioral Intention",
            x: 640,
            y: 200,
        },
        {
            id: "ci",
            label: "CI",
            fullName: "Collaborative Intention",
            x: 800,
            y: 200,
        },
    ];

    // Hypotheses with directions
    const hypotheses: Hypothesis[] = [
        {
            id: "H1a",
            source: "stimulus",
            target: "xait",
            direction: "+",
            description: "Positives Framing → Höheres Vertrauen",
            curve: -30,
        },
        {
            id: "H1b",
            source: "stimulus",
            target: "xait",
            direction: "−",
            description: "Negatives Framing → Geringeres Vertrauen",
            curve: 30,
        },
        {
            id: "H2",
            source: "xait",
            target: "pu",
            direction: "+",
            description: "Vertrauen → Wahrgenommene Nützlichkeit",
        },
        {
            id: "H3",
            source: "xait",
            target: "peou",
            direction: "+",
            description: "Vertrauen → Wahrgenommene Benutzerfreundlichkeit",
        },
        {
            id: "H4",
            source: "peou",
            target: "pu",
            direction: "+",
            description: "Benutzerfreundlichkeit → Nützlichkeit",
        },
        {
            id: "H5",
            source: "pu",
            target: "bi",
            direction: "+",
            description: "Nützlichkeit → Verhaltensabsicht",
        },
        {
            id: "H6",
            source: "peou",
            target: "bi",
            direction: "+",
            description: "Benutzerfreundlichkeit → Verhaltensabsicht",
        },
        {
            id: "H7",
            source: "pu",
            target: "ci",
            direction: "+",
            description: "Nützlichkeit → Kollaborationsabsicht",
            curve: 35,
        },
        {
            id: "H8",
            source: "bi",
            target: "ci",
            direction: "+",
            description: "Verhaltensabsicht → Kollaborationsabsicht",
        },
        {
            id: "H9",
            source: "famtec",
            target: "pu",
            direction: "+",
            description: "Technologievertrautheit → Nützlichkeit",
        },
    ];

    // State
    let activeHypothesis: Hypothesis | null = $state(null);
    let activeNode: Node | null = $state(null);
    let isLocked = $state(false);

    // Derived: which nodes are connected to active hypothesis
    const connectedNodes = $derived.by(() => {
        if (!activeHypothesis) return new Set<string>();
        return new Set([activeHypothesis.source, activeHypothesis.target]);
    });

    // Derived: which hypotheses connect to active node
    const connectedHypotheses = $derived.by(() => {
        const node = activeNode;
        if (!node) return new Set<string>();
        return new Set(
            hypotheses
                .filter(h => h.source === node.id || h.target === node.id)
                .map(h => h.id)
        );
    });

    // Helper functions
    const getNode = (id: string): Node | undefined => nodes.find((n) => n.id === id);

    function getNodeCenter(node: Node): { x: number; y: number } {
        return {
            x: node.x + NODE_WIDTH / 2,
            y: node.y + NODE_HEIGHT / 2,
        };
    }

    function getPath(h: Hypothesis): string {
        const source = getNode(h.source);
        const target = getNode(h.target);
        if (!source || !target) return "";

        const start = getNodeCenter(source);
        const end = getNodeCenter(target);

        if (h.curve) {
            const cx = (start.x + end.x) / 2;
            const cy = (start.y + end.y) / 2 + h.curve;
            return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
        }
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    function getLabelPos(h: Hypothesis): { x: number; y: number } {
        const source = getNode(h.source);
        const target = getNode(h.target);
        if (!source || !target) return { x: 0, y: 0 };

        const start = getNodeCenter(source);
        const end = getNodeCenter(target);

        if (h.curve) {
            const cx = (start.x + end.x) / 2;
            const cy = (start.y + end.y) / 2 + h.curve;
            return {
                x: 0.25 * start.x + 0.5 * cx + 0.25 * end.x,
                y: 0.25 * start.y + 0.5 * cy + 0.25 * end.y,
            };
        }
        return {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
        };
    }

    function handleHypothesisHover(h: Hypothesis | null): void {
        if (!isLocked) {
            activeHypothesis = h;
            activeNode = null;
        }
    }

    function handleNodeHover(n: Node | null): void {
        if (!isLocked) {
            activeNode = n;
            activeHypothesis = null;
        }
    }

    function handleClick(h: Hypothesis | null, n: Node | null): void {
        if (isLocked && activeHypothesis === h && activeNode === n) {
            // Unlock and clear
            isLocked = false;
            activeHypothesis = null;
            activeNode = null;
        } else {
            // Lock to this element
            isLocked = true;
            activeHypothesis = h;
            activeNode = n;
        }
    }

    function handleBackgroundClick(): void {
        if (isLocked) {
            isLocked = false;
            activeHypothesis = null;
            activeNode = null;
        }
    }

    function handleKeyDown(event: KeyboardEvent): void {
        if (event.key === "Escape") {
            isLocked = false;
            activeHypothesis = null;
            activeNode = null;
        }
    }

    // Check if element should be highlighted
    function isHypothesisActive(h: Hypothesis): boolean {
        if (activeHypothesis) return activeHypothesis.id === h.id;
        if (activeNode) return connectedHypotheses.has(h.id);
        return false;
    }

    function isNodeActive(n: Node): boolean {
        if (activeNode) return activeNode.id === n.id;
        if (activeHypothesis) return connectedNodes.has(n.id);
        return false;
    }

    function shouldDim(h: Hypothesis): boolean {
        return (activeHypothesis !== null || activeNode !== null) && !isHypothesisActive(h);
    }

    function shouldDimNode(n: Node): boolean {
        return (activeHypothesis !== null || activeNode !== null) && !isNodeActive(n);
    }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="w-full">
    <!-- Main Diagram -->
    <div
        class="relative bg-white"
        role="application"
        aria-label="Interaktives Hypothesenmodell"
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <svg
            viewBox="0 0 960 460"
            class="w-full h-auto"
            onclick={handleBackgroundClick}
        >
            <title>AI-TAM Strukturmodell</title>

            <!-- Arrow marker definition -->
            <defs>
                <marker
                    id="arrow"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                >
                    <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
                </marker>
                <marker
                    id="arrow-dim"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                >
                    <polygon points="0 0, 8 3, 0 6" fill="#d1d5db" />
                </marker>
                <marker
                    id="arrow-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                >
                    <polygon points="0 0, 8 3, 0 6" fill="#000" />
                </marker>
            </defs>

            <!-- Hypotheses (Edges) -->
            {#each hypotheses as h}
                {@const labelPos = getLabelPos(h)}
                {@const active = isHypothesisActive(h)}
                {@const dim = shouldDim(h)}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <g
                    class="cursor-pointer"
                    onmouseenter={() => handleHypothesisHover(h)}
                    onmouseleave={() => handleHypothesisHover(null)}
                    onclick={(e) => { e.stopPropagation(); handleClick(h, null); }}
                    role="button"
                    tabindex="0"
                    aria-label="{h.id}: {h.description}"
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClick(h, null);
                        }
                    }}
                >
                    <!-- Wide invisible hit area -->
                    <path
                        d={getPath(h)}
                        fill="none"
                        stroke="transparent"
                        stroke-width="24"
                    />

                    <!-- Visible path -->
                    <path
                        d={getPath(h)}
                        fill="none"
                        stroke={active ? "#000" : dim ? "#d1d5db" : "#6b7280"}
                        stroke-width={active ? 2.5 : 1.5}
                        marker-end={active ? "url(#arrow-active)" : dim ? "url(#arrow-dim)" : "url(#arrow)"}
                        class="transition-all duration-200"
                    />

                    <!-- Label pill -->
                    <rect
                        x={labelPos.x - 28}
                        y={labelPos.y - 12}
                        width="56"
                        height="24"
                        rx="12"
                        fill={active ? "#000" : "#fff"}
                        stroke={active ? "#000" : dim ? "#d1d5db" : "#374151"}
                        stroke-width={active ? 2 : 1}
                        class="transition-all duration-200"
                    />

                    <!-- Label text with direction -->
                    <text
                        x={labelPos.x}
                        y={labelPos.y + 4}
                        text-anchor="middle"
                        fill={active ? "#fff" : dim ? "#9ca3af" : "#374151"}
                        class="text-xs font-mono font-medium transition-all duration-200 select-none pointer-events-none"
                    >
                        {h.id} ({h.direction})
                    </text>
                </g>
            {/each}

            <!-- Nodes -->
            {#each nodes as node}
                {@const active = isNodeActive(node)}
                {@const dim = shouldDimNode(node)}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <g
                    class="cursor-pointer"
                    onmouseenter={() => handleNodeHover(node)}
                    onmouseleave={() => handleNodeHover(null)}
                    onclick={(e) => { e.stopPropagation(); handleClick(null, node); }}
                    role="button"
                    tabindex="0"
                    aria-label="{node.label}: {node.fullName}"
                    onkeydown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClick(null, node);
                        }
                    }}
                >
                    <!-- Node rectangle -->
                    <rect
                        x={node.x}
                        y={node.y}
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx={NODE_RADIUS}
                        fill="#fff"
                        stroke={active ? "#000" : dim ? "#d1d5db" : "#374151"}
                        stroke-width={active ? 2.5 : 1.5}
                        class="transition-all duration-200"
                    />

                    <!-- Node label -->
                    <text
                        x={node.x + NODE_WIDTH / 2}
                        y={node.y + 24}
                        text-anchor="middle"
                        fill={active ? "#000" : dim ? "#9ca3af" : "#000"}
                        class="text-sm font-mono font-bold transition-all duration-200 select-none pointer-events-none"
                    >
                        {node.label}
                    </text>

                    <!-- Node sublabel -->
                    <text
                        x={node.x + NODE_WIDTH / 2}
                        y={node.y + 42}
                        text-anchor="middle"
                        fill={active ? "#374151" : dim ? "#d1d5db" : "#6b7280"}
                        class="text-[9px] font-sans transition-all duration-200 select-none pointer-events-none"
                    >
                        {node.id === "stimulus" ? "Framing" : node.id === "famtec" ? "Familiarity" : node.id === "xait" ? "Trust" : node.id === "peou" ? "Ease of Use" : node.id === "pu" ? "Usefulness" : node.id === "bi" ? "Intention" : "Collaboration"}
                    </text>
                </g>
            {/each}
        </svg>

        <!-- Info Panel -->
        {#if activeHypothesis || activeNode}
            <div
                transition:fade={{ duration: 150 }}
                class="absolute bottom-4 left-4 right-4 bg-white border-2 border-black p-4"
            >
                {#if activeHypothesis}
                    <div class="flex items-start justify-between gap-4">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="font-mono font-bold text-lg">{activeHypothesis.id}</span>
                                <span class="inline-flex items-center justify-center w-8 h-8 border-2 border-black font-bold text-lg">
                                    {activeHypothesis.direction}
                                </span>
                            </div>
                            <p class="text-base">
                                {activeHypothesis.description}
                            </p>
                        </div>
                        <div class="text-right text-sm text-gray-500">
                            <span class="font-mono">{getNode(activeHypothesis.source)?.label}</span>
                            <span class="mx-2">→</span>
                            <span class="font-mono">{getNode(activeHypothesis.target)?.label}</span>
                        </div>
                    </div>
                {:else if activeNode}
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="font-mono font-bold text-lg mb-1">{activeNode.label}</div>
                            <p class="text-base">{activeNode.fullName}</p>
                        </div>
                        <div class="text-sm text-gray-500">
                            {hypotheses.filter(h => h.source === activeNode?.id || h.target === activeNode?.id).length} verbundene Hypothesen
                        </div>
                    </div>
                {/if}
                {#if isLocked}
                    <p class="text-xs text-gray-400 mt-3">
                        Klicken Sie erneut oder drücken Sie ESC zum Schließen
                    </p>
                {/if}
            </div>
        {/if}
    </div>

    <!-- Legend -->
    <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {#each hypotheses as h}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <button
                    class="flex items-center gap-2 p-2 rounded hover:bg-gray-50 transition-colors text-left {activeHypothesis?.id === h.id ? 'bg-gray-100' : ''}"
                    onmouseenter={() => handleHypothesisHover(h)}
                    onmouseleave={() => handleHypothesisHover(null)}
                    onclick={() => handleClick(h, null)}
                >
                    <span class="font-mono font-medium">{h.id}</span>
                    <span class="text-gray-400">
                        {getNode(h.source)?.label}→{getNode(h.target)?.label}
                    </span>
                    <span class="font-bold ml-auto">{h.direction}</span>
                </button>
            {/each}
        </div>
    </div>
</div>

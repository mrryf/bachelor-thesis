<script>
    import { fade } from "svelte/transition";

    // Node positions and data
    const nodes = [
        {
            id: "stimulus",
            label: "Stimulus",
            x: 50,
            y: 150,
            description:
                "Experimental Manipulation (Positive vs. Negative Framing)",
        },
        {
            id: "famtec",
            label: "FAMTEC",
            x: 50,
            y: 350,
            description: "Technology Familiarity",
        },
        {
            id: "xait",
            label: "XAIT",
            x: 250,
            y: 150,
            description: "Explainable AI Trust",
        },
        {
            id: "eou",
            label: "EOU",
            x: 450,
            y: 100,
            description: "Perceived Ease of Use",
        },
        {
            id: "puf",
            label: "PUF",
            x: 450,
            y: 300,
            description: "Perceived Usefulness",
        },
        {
            id: "bi",
            label: "BI",
            x: 650,
            y: 200,
            description: "Behavioral Intention",
        },
        {
            id: "ci",
            label: "CI",
            x: 800,
            y: 200,
            description: "Continued Intention",
        },
    ];

    // Edges connecting nodes
    const edges = [
        {
            id: "h1a",
            source: "stimulus",
            target: "xait",
            label: "H1a (+)",
            description: "H1a: Positive Frame -> Trust (+)",
            curve: -40,
        },
        {
            id: "h1b",
            source: "stimulus",
            target: "xait",
            label: "H1b (-)",
            description: "H1b: Negative Frame -> Trust (-)",
            curve: 40,
        },
        {
            id: "h2",
            source: "xait",
            target: "puf",
            label: "H2",
            description: "H2: Trust -> Usefulness (+)",
        },
        {
            id: "h3",
            source: "xait",
            target: "eou",
            label: "H3",
            description: "H3: Trust -> Ease of Use (+)",
        },
        {
            id: "h8",
            source: "famtec",
            target: "puf",
            label: "H8",
            description: "H8: Tech Familiarity -> Usefulness (+)",
        },
        {
            id: "h6",
            source: "eou",
            target: "puf",
            label: "H6",
            description: "H6: Ease of Use -> Usefulness (+)",
        },
        {
            id: "h5",
            source: "eou",
            target: "bi",
            label: "H5",
            description: "H5: Ease of Use -> Intention (+)",
        },
        {
            id: "h4",
            source: "puf",
            target: "bi",
            label: "H4",
            description: "H4: Usefulness -> Intention (+)",
        },
        {
            id: "h7",
            source: "bi",
            target: "ci",
            label: "H7",
            description: "H7: Intention -> Continued Use (+)",
        },
    ];

    let hoveredElement = null;
    let mouseX = 0;
    let mouseY = 0;

    function handleMouseOver(event, element) {
        hoveredElement = element;
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    function handleMouseMove(event) {
        if (hoveredElement) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        }
    }

    function handleMouseOut() {
        hoveredElement = null;
    }

    // Helper to find coords
    const getNode = (id) => nodes.find((n) => n.id === id);

    // Helper to generate path
    function getPath(edge) {
        const s = getNode(edge.source);
        const t = getNode(edge.target);
        const x1 = s.x + 50;
        const y1 = s.y + 25;
        const x2 = t.x + 50;
        const y2 = t.y + 25;

        if (edge.curve) {
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 + edge.curve;
            return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        }
        return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    function getLabelPos(edge) {
        const s = getNode(edge.source);
        const t = getNode(edge.target);
        const x1 = s.x + 50;
        const y1 = s.y + 25;
        const x2 = t.x + 50;
        const y2 = t.y + 25;

        if (edge.curve) {
            // Quadratic Bezier midpoint: 0.25*P0 + 0.5*P1 + 0.25*P2
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 + edge.curve;
            return {
                x: 0.25 * x1 + 0.5 * cx + 0.25 * x2,
                y: 0.25 * y1 + 0.5 * cy + 0.25 * y2,
            };
        }
        return {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2,
        };
    }
</script>

<div
    class="relative w-full overflow-hidden p-4 bg-background border rounded-lg shadow-sm"
    on:mousemove={handleMouseMove}
    role="application"
>
    <svg viewBox="0 0 900 500" class="w-full h-auto select-none font-sans">
        <!-- Definitions for markers -->
        <defs>
            <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
            >
                <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="currentColor"
                    class="text-primary"
                />
            </marker>
        </defs>

        <!-- Draw Edges -->
        {#each edges as edge}
            {@const labelPos = getLabelPos(edge)}
            <g
                class="transition-opacity duration-200 cursor-pointer group"
                on:mouseenter={(e) => handleMouseOver(e, edge)}
                on:mouseleave={handleMouseOut}
                role="button"
                tabindex="0"
            >
                <!-- Invisible wide path for easier hovering -->
                <path
                    d={getPath(edge)}
                    fill="none"
                    stroke="transparent"
                    stroke-width="20"
                />
                <!-- Visible Line -->
                <path
                    d={getPath(edge)}
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    marker-end="url(#arrowhead)"
                    class="text-border group-hover:text-primary transition-colors"
                />
                <!-- Label Background -->
                <rect
                    x={labelPos.x - 20}
                    y={labelPos.y - 10}
                    width="40"
                    height="20"
                    rx="4"
                    fill="currentColor"
                    class="text-background"
                />
                <!-- Label Text -->
                <text
                    x={labelPos.x}
                    y={labelPos.y + 4}
                    text-anchor="middle"
                    class="text-xs font-bold fill-foreground group-hover:fill-primary transition-colors"
                >
                    {edge.label}
                </text>
            </g>
        {/each}

        <!-- Draw Nodes -->
        {#each nodes as node}
            <g
                class="cursor-pointer group"
                on:mouseenter={(e) => handleMouseOver(e, node)}
                on:mouseleave={handleMouseOut}
                role="button"
                tabindex="0"
            >
                <rect
                    x={node.x}
                    y={node.y}
                    width="100"
                    height="50"
                    rx="8"
                    fill="currentColor"
                    class="text-card stroke-border stroke-2 group-hover:stroke-primary transition-colors shadow-sm"
                />
                <text
                    x={node.x + 50}
                    y={node.y + 30}
                    text-anchor="middle"
                    class="text-sm font-semibold fill-foreground group-hover:fill-primary pointer-events-none"
                >
                    {node.label}
                </text>
            </g>
        {/each}
    </svg>

    <!-- Tooltip -->
    {#if hoveredElement}
        <div
            transition:fade={{ duration: 150 }}
            class="fixed z-50 p-3 text-sm rounded shadow-lg bg-popover text-popover-foreground border border-border pointer-events-none max-w-xs"
            style="left: {mouseX + 20}px; top: {mouseY + 20}px;"
        >
            <div class="font-bold mb-1">{hoveredElement.label}</div>
            <div class="text-muted-foreground whitespace-pre-line">
                {hoveredElement.description}
            </div>
        </div>
    {/if}
</div>

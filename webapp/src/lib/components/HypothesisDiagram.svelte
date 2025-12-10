<script lang="ts">
    import { fade } from "svelte/transition";

    // Type definitions
    interface Node {
        id: string;
        label: string;
        x: number;
        y: number;
        description: string;
    }

    interface Edge {
        id: string;
        source: string;
        target: string;
        label: string;
        description: string;
        curve?: number;
    }

    interface Position {
        x: number;
        y: number;
    }

    // Constants
    const NODE_WIDTH = 110;
    const NODE_HEIGHT = 55;
    const NODE_RADIUS = 8;
    const LABEL_PADDING = 22;
    const LABEL_HEIGHT = 22;
    const HOVER_PATH_WIDTH = 20;
    const EDGE_WIDTH = 2;
    const TOOLTIP_OFFSET = 15;

    // Node positions and data (using standard TAM abbreviations)
    const nodes: Node[] = [
        {
            id: "stimulus",
            label: "Stimulus",
            x: 50,
            y: 160,
            description:
                "Experimental Manipulation (Positive vs. Negative Framing)",
        },
        {
            id: "famtec",
            label: "FAMTEC",
            x: 50,
            y: 340,
            description: "Technology Familiarity",
        },
        {
            id: "xait",
            label: "XAIT",
            x: 250,
            y: 160,
            description: "Explainable AI Trust",
        },
        {
            id: "peou",
            label: "PEOU",
            x: 470,
            y: 100,
            description: "Perceived Ease of Use",
        },
        {
            id: "pu",
            label: "PU",
            x: 470,
            y: 300,
            description: "Perceived Usefulness",
        },
        {
            id: "bi",
            label: "BI",
            x: 670,
            y: 200,
            description: "Behavioral Intention",
        },
        {
            id: "ci",
            label: "CI",
            x: 820,
            y: 200,
            description: "Continued Intention",
        },
    ];

    // Edges connecting nodes (matching the research page hypotheses)
    const edges: Edge[] = [
        {
            id: "h1a",
            source: "stimulus",
            target: "xait",
            label: "H1a",
            description: "H1a: Positive Frame → Trust (+)",
            curve: -35,
        },
        {
            id: "h1b",
            source: "stimulus",
            target: "xait",
            label: "H1b",
            description: "H1b: Negative Frame → Trust (−)",
            curve: 35,
        },
        {
            id: "h2",
            source: "xait",
            target: "pu",
            label: "H2",
            description: "H2: Trust → Usefulness (+)",
        },
        {
            id: "h3",
            source: "xait",
            target: "peou",
            label: "H3",
            description: "H3: Trust → Ease of Use (+)",
        },
        {
            id: "h4",
            source: "peou",
            target: "pu",
            label: "H4",
            description: "H4: Ease of Use → Usefulness (+)",
        },
        {
            id: "h5",
            source: "pu",
            target: "bi",
            label: "H5",
            description: "H5: Usefulness → Intention (+)",
        },
        {
            id: "h6",
            source: "peou",
            target: "bi",
            label: "H6",
            description: "H6: Ease of Use → Intention (+)",
        },
        {
            id: "h7",
            source: "pu",
            target: "ci",
            label: "H7",
            description: "H7: Usefulness → Continued Use (+)",
            curve: 30,
        },
        {
            id: "h8",
            source: "bi",
            target: "ci",
            label: "H8",
            description: "H8: Intention → Continued Use (+)",
        },
        {
            id: "h9",
            source: "famtec",
            target: "pu",
            label: "H9",
            description: "H9: Tech Familiarity → Usefulness (+)",
        },
    ];

    let hoveredElement: Node | Edge | null = $state(null);
    let mouseX = $state(0);
    let mouseY = $state(0);

    function handleMouseOver(event: MouseEvent, element: Node | Edge): void {
        hoveredElement = element;
        updateMousePosition(event);
    }

    function handleMouseMove(event: MouseEvent): void {
        if (hoveredElement) {
            updateMousePosition(event);
        }
    }

    function updateMousePosition(event: MouseEvent): void {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    function handleMouseOut(): void {
        hoveredElement = null;
    }

    function handleKeyDown(event: KeyboardEvent, element: Node | Edge): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const syntheticEvent = {
                clientX: mouseX || 0,
                clientY: mouseY || 0,
            } as MouseEvent;
            hoveredElement = hoveredElement === element ? null : element;
        }
        if (event.key === "Escape") {
            hoveredElement = null;
        }
    }

    // Helper to find node by id
    const getNode = (id: string): Node | undefined =>
        nodes.find((n) => n.id === id);

    // Helper to get node center position
    function getNodeCenter(node: Node): Position {
        return {
            x: node.x + NODE_WIDTH / 2,
            y: node.y + NODE_HEIGHT / 2,
        };
    }

    // Helper to generate SVG path for edge
    function getPath(edge: Edge): string {
        const sourceNode = getNode(edge.source);
        const targetNode = getNode(edge.target);

        if (!sourceNode || !targetNode) return "";

        const start = getNodeCenter(sourceNode);
        const end = getNodeCenter(targetNode);

        if (edge.curve) {
            const cx = (start.x + end.x) / 2;
            const cy = (start.y + end.y) / 2 + edge.curve;
            return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
        }
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Calculate label position on edge
    function getLabelPos(edge: Edge): Position {
        const sourceNode = getNode(edge.source);
        const targetNode = getNode(edge.target);

        if (!sourceNode || !targetNode) return { x: 0, y: 0 };

        const start = getNodeCenter(sourceNode);
        const end = getNodeCenter(targetNode);

        if (edge.curve) {
            // Quadratic Bezier midpoint: 0.25*P0 + 0.5*P1 + 0.25*P2
            const cx = (start.x + end.x) / 2;
            const cy = (start.y + end.y) / 2 + edge.curve;
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
</script>

<div
    class="relative w-full overflow-hidden p-6 bg-background border rounded-lg shadow-sm transition-shadow hover:shadow-md"
    onmousemove={handleMouseMove}
    role="application"
    aria-label="Interactive hypothesis diagram showing relationships between variables"
>
    <svg
        viewBox="0 0 950 500"
        class="w-full h-auto select-none font-sans"
        aria-describedby="diagram-desc"
    >
        <title>AI-TAM Structural Model</title>
        <desc id="diagram-desc">
            Interactive structural equation model showing relationships between
            experimental stimulus, technology familiarity, trust, ease of use,
            usefulness, and behavioral intentions.
        </desc>

        <!-- Definitions for markers and gradients -->
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
                    class="text-primary transition-colors"
                />
            </marker>
            <filter id="shadow">
                <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.1" />
            </filter>
        </defs>

        <!-- Draw Edges -->
        {#each edges as edge}
            {@const labelPos = getLabelPos(edge)}
            <g
                class="cursor-pointer group transition-opacity duration-200"
                onmouseenter={(e) => handleMouseOver(e, edge)}
                onmouseleave={handleMouseOut}
                onkeydown={(e) => handleKeyDown(e, edge)}
                role="button"
                tabindex="0"
                aria-label="Hypothesis {edge.label}: {edge.description}"
            >
                <!-- Invisible wide path for easier hovering -->
                <path
                    d={getPath(edge)}
                    fill="none"
                    stroke="transparent"
                    stroke-width={HOVER_PATH_WIDTH}
                />
                <!-- Visible Line -->
                <path
                    d={getPath(edge)}
                    fill="none"
                    stroke="currentColor"
                    stroke-width={EDGE_WIDTH}
                    marker-end="url(#arrowhead)"
                    class="text-muted-foreground/40 group-hover:text-primary group-focus:text-primary transition-all duration-200"
                    style="stroke-dasharray: {hoveredElement === edge ? '0' : ''};"
                />
                <!-- Label Background -->
                <rect
                    x={labelPos.x - LABEL_PADDING}
                    y={labelPos.y - LABEL_HEIGHT / 2}
                    width={LABEL_PADDING * 2}
                    height={LABEL_HEIGHT}
                    rx="5"
                    fill="currentColor"
                    class="text-card group-hover:text-primary/10 group-focus:text-primary/10 transition-colors duration-200"
                    filter="url(#shadow)"
                />
                <!-- Label Border -->
                <rect
                    x={labelPos.x - LABEL_PADDING}
                    y={labelPos.y - LABEL_HEIGHT / 2}
                    width={LABEL_PADDING * 2}
                    height={LABEL_HEIGHT}
                    rx="5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="text-muted-foreground/30 group-hover:text-primary group-focus:text-primary transition-colors duration-200"
                />
                <!-- Label Text -->
                <text
                    x={labelPos.x}
                    y={labelPos.y + 5}
                    text-anchor="middle"
                    class="text-xs font-bold fill-foreground group-hover:fill-primary group-focus:fill-primary transition-colors duration-200 pointer-events-none select-none"
                >
                    {edge.label}
                </text>
            </g>
        {/each}

        <!-- Draw Nodes -->
        {#each nodes as node}
            <g
                class="cursor-pointer group"
                onmouseenter={(e) => handleMouseOver(e, node)}
                onmouseleave={handleMouseOut}
                onkeydown={(e) => handleKeyDown(e, node)}
                role="button"
                tabindex="0"
                aria-label="{node.label}: {node.description}"
            >
                <!-- Node Shadow -->
                <rect
                    x={node.x}
                    y={node.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={NODE_RADIUS}
                    fill="currentColor"
                    class="text-muted-foreground/5"
                    transform="translate(0, 2)"
                />
                <!-- Node Background -->
                <rect
                    x={node.x}
                    y={node.y}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={NODE_RADIUS}
                    fill="currentColor"
                    class="text-card stroke-border stroke-[2.5] group-hover:stroke-primary group-focus:stroke-primary group-hover:stroke-[3] transition-all duration-200"
                    filter="url(#shadow)"
                />
                <!-- Node Text -->
                <text
                    x={node.x + NODE_WIDTH / 2}
                    y={node.y + NODE_HEIGHT / 2 + 5}
                    text-anchor="middle"
                    class="text-sm font-semibold fill-foreground group-hover:fill-primary group-focus:fill-primary transition-colors duration-200 pointer-events-none select-none"
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
            class="fixed z-50 px-4 py-3 text-sm rounded-lg shadow-xl bg-popover text-popover-foreground border-2 border-border pointer-events-none max-w-sm backdrop-blur-sm"
            style="left: {mouseX + TOOLTIP_OFFSET}px; top: {mouseY + TOOLTIP_OFFSET}px;"
        >
            <div class="font-bold mb-1.5 text-primary">
                {hoveredElement.label}
            </div>
            <div class="text-muted-foreground leading-relaxed">
                {hoveredElement.description}
            </div>
        </div>
    {/if}
</div>

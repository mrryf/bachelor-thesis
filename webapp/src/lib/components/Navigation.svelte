<script lang="ts">
    import { navItems } from "$lib/data/content";
    import { page } from "$app/stores";
    import { Button } from "$lib/components/ui/button";
    import { Separator } from "$lib/components/ui/separator";

    $: currentPath = $page.url.pathname;
</script>

<nav class="border-b bg-background sticky top-0 z-50">
    <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
            <!-- Logo/Title -->
            <a
                href="/"
                class="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
                <span class="font-bold text-lg">Vertrauen in KI</span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-1">
                {#each navItems as item}
                    <a href={item.href}>
                        <Button
                            variant={currentPath === item.href
                                ? "default"
                                : "ghost"}
                            size="sm"
                            class="text-sm"
                        >
                            <span class="font-medium mr-1">{item.number}.</span>
                            {item.title}
                        </Button>
                    </a>
                {/each}
            </div>

            <!-- Mobile Menu Button -->
            <div class="md:hidden">
                <Button variant="ghost" size="sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="4" x2="20" y1="12" y2="12" />
                        <line x1="4" x2="20" y1="6" y2="6" />
                        <line x1="4" x2="20" y1="18" y2="18" />
                    </svg>
                </Button>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div class="md:hidden pb-4 space-y-1">
            {#each navItems as item}
                <a href={item.href} class="block">
                    <Button
                        variant={currentPath === item.href
                            ? "default"
                            : "ghost"}
                        size="sm"
                        class="w-full justify-start text-sm"
                    >
                        <span class="font-medium mr-1">{item.number}.</span>
                        {item.title}
                    </Button>
                </a>
            {/each}
        </div>
    </div>
</nav>

<script lang="ts">
    import { navItems, githubUrl } from "$lib/data/content";
    import { page } from "$app/stores";
    import { Button } from "$lib/components/ui/button";
    import { Github, Menu, X } from "lucide-svelte";

    let mobileMenuOpen = $state(false);

    // Close mobile menu when route changes
    $effect(() => {
        // Access page store to create reactive dependency
        $page;
        mobileMenuOpen = false;
    });
</script>

<nav
    class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
>
    <div class="container mx-auto px-4">
        <div class="flex h-16 items-center justify-between">
            <!-- Logo/Home -->
            <a
                href="/"
                class="flex items-center space-x-2 hover:text-primary transition-colors duration-200"
            >
                <span class="font-bold text-lg">Vertrauen in KI</span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center space-x-1">
                {#each navItems as item}
                    <a href={item.href}>
                        <Button
                            variant={$page.url.pathname === item.href
                                ? "default"
                                : "ghost"}
                            size="sm"
                        >
                            {item.title}
                        </Button>
                    </a>
                {/each}

                <!-- GitHub Link -->
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" class="gap-2">
                        <Github class="h-4 w-4" />
                        <span class="sr-only">GitHub</span>
                    </Button>
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <button
                class="md:hidden p-2 hover:bg-accent rounded-md transition-all duration-200 active:scale-95"
                onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
                {#if mobileMenuOpen}
                    <X class="h-6 w-6" />
                {:else}
                    <Menu class="h-6 w-6" />
                {/if}
            </button>
        </div>

        <!-- Mobile Navigation -->
        {#if mobileMenuOpen}
            <div class="md:hidden pb-4 space-y-1 border-t pt-4">
                {#each navItems as item}
                    <a href={item.href} class="block">
                        <Button
                            variant={$page.url.pathname === item.href
                                ? "default"
                                : "ghost"}
                            size="sm"
                            class="w-full justify-start"
                        >
                            {item.title}
                        </Button>
                    </a>
                {/each}
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start gap-2"
                    >
                        <Github class="h-4 w-4" />
                        GitHub
                    </Button>
                </a>
            </div>
        {/if}
    </div>
</nav>

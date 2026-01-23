<script lang="ts">
    import { navItems, githubUrl } from "$lib/data/content";
    import { page } from "$app/stores";

    import Github from "@lucide/svelte/icons/github";
    import Menu from "@lucide/svelte/icons/menu";
    import X from "@lucide/svelte/icons/x";

    let mobileMenuOpen = $state(false);

    // Close mobile menu when route changes
    $effect(() => {
        // Access page store to create reactive dependency
        $page;
        mobileMenuOpen = false;
    });
</script>

<nav
    class="border-b-2 border-black bg-white sticky top-0 z-50"
>
    <div class="container mx-auto px-6 md:px-12">
        <div class="flex h-24 items-center justify-between">
            <!-- Logo/Home -->
            <a
                href="/"
                class="flex items-center hover:opacity-70 transition-opacity duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3"
            >
                <span class="font-display font-bold text-xl tracking-tight">Vertrauen in KI</span>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden md:flex items-center gap-2">
                {#each navItems as item}
                    <a
                        href={item.href}
                        class="px-6 py-3 text-sm uppercase tracking-wider font-medium border-b-2 transition-all duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3 {$page.url.pathname.startsWith(item.href) && item.href !== '/'
                            ? 'border-black'
                            : 'border-transparent hover:border-black'}"
                    >
                        {item.title}
                    </a>
                {/each}

                <!-- GitHub Link -->
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-colors duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3"
                    aria-label="GitHub Repository"
                >
                    <Github size={18} strokeWidth={1.5} />
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <button
                class="md:hidden p-2 border-2 border-black hover:bg-black hover:text-white transition-colors duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3"
                onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            >
                {#if mobileMenuOpen}
                    <X size={20} strokeWidth={1.5} />
                {:else}
                    <Menu size={20} strokeWidth={1.5} />
                {/if}
            </button>
        </div>

        <!-- Mobile Navigation -->
        {#if mobileMenuOpen}
            <div class="md:hidden pb-8 space-y-2 border-t-2 border-black pt-8">
                {#each navItems as item}
                    <a
                        href={item.href}
                        class="block px-6 py-4 text-sm uppercase tracking-wider font-medium border-l-2 transition-all duration-100 {$page.url.pathname.startsWith(item.href) && item.href !== '/'
                            ? 'border-black bg-black text-white'
                            : 'border-transparent hover:border-black'}"
                    >
                        {item.title}
                    </a>
                {/each}
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-6 py-4 text-sm uppercase tracking-wider font-medium border-l-2 border-transparent hover:border-black transition-all duration-100"
                >
                    <Github size={18} strokeWidth={1.5} />
                    GitHub
                </a>
            </div>
        {/if}
    </div>
</nav>

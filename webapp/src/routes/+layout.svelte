<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/Navigation.svelte";
	import Breadcrumbs from "$lib/components/Breadcrumbs.svelte";
	import Toaster from "$lib/components/ui/toast/Toaster.svelte";
</script>

<div class="min-h-screen bg-background text-foreground">
	<Navigation />
	<Breadcrumbs />
	<slot />
	<Toaster />
</div>

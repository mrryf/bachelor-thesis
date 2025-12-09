<script lang="ts">
	import "../app.css";
	import Navigation from "$lib/components/Navigation.svelte";
</script>

<div class="min-h-screen bg-background text-foreground">
	<Navigation />
	<slot />
</div>

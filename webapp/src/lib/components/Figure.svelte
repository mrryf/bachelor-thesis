<script lang="ts">
	import Lightbox from "./Lightbox.svelte";

	let {
		src = "",
		alt = "",
		caption = "",
		figureNumber = "",
	}: {
		src?: string;
		alt?: string;
		caption?: string;
		figureNumber?: string;
	} = $props();

	let lightboxOpen = $state(false);
</script>

<figure class="my-8">
	<button
		type="button"
		class="group relative w-full cursor-zoom-in overflow-hidden border-2 border-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
		onclick={() => (lightboxOpen = true)}
		aria-label="Bild vergrössern: {alt}"
	>
		<img
			{src}
			{alt}
			class="w-full transition-transform duration-300 group-hover:scale-[1.02]"
			loading="lazy"
		/>
		<div
			class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"
		></div>
	</button>
	<figcaption class="mt-3 text-sm text-muted-foreground text-center">
		<span class="font-medium">{figureNumber}:</span>
		{caption}
	</figcaption>
</figure>

<Lightbox
	bind:open={lightboxOpen}
	{src}
	{alt}
	caption="{figureNumber}: {caption}"
/>

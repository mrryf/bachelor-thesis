<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { X, ZoomIn, ZoomOut, Download } from "lucide-svelte";
	import { fade, scale } from "svelte/transition";

	let {
		open = $bindable(false),
		src = "",
		alt = "",
		caption = "",
	}: {
		open?: boolean;
		src?: string;
		alt?: string;
		caption?: string;
	} = $props();

	let zoomLevel = $state(1);
	const MIN_ZOOM = 0.5;
	const MAX_ZOOM = 3;

	function handleClose() {
		open = false;
		zoomLevel = 1; // Reset zoom on close
	}

	function handleZoomIn() {
		zoomLevel = Math.min(zoomLevel + 0.25, MAX_ZOOM);
	}

	function handleZoomOut() {
		zoomLevel = Math.max(zoomLevel - 0.25, MIN_ZOOM);
	}

	function handleDownload() {
		const link = document.createElement("a");
		link.href = src;
		link.download = alt || "image";
		link.click();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		if (e.key === "Escape") {
			handleClose();
		} else if (e.key === "+" || e.key === "=") {
			handleZoomIn();
		} else if (e.key === "-") {
			handleZoomOut();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
		transition:fade={{ duration: 200 }}
		onclick={handleClose}
		role="dialog"
		aria-modal="true"
		aria-label="Image lightbox"
	>
		<!-- Controls -->
		<div class="absolute top-4 right-4 flex gap-2 z-10">
			<Button
				variant="ghost"
				size="icon"
				class="bg-white/10 hover:bg-white/20 text-white"
				onclick={(e) => {
					e.stopPropagation();
					handleDownload();
				}}
				aria-label="Download image"
			>
				<Download class="h-5 w-5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="bg-white/10 hover:bg-white/20 text-white"
				onclick={(e) => {
					e.stopPropagation();
					handleZoomOut();
				}}
				aria-label="Zoom out"
				disabled={zoomLevel <= MIN_ZOOM}
			>
				<ZoomOut class="h-5 w-5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="bg-white/10 hover:bg-white/20 text-white"
				onclick={(e) => {
					e.stopPropagation();
					handleZoomIn();
				}}
				aria-label="Zoom in"
				disabled={zoomLevel >= MAX_ZOOM}
			>
				<ZoomIn class="h-5 w-5" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				class="bg-white/10 hover:bg-white/20 text-white"
				onclick={(e) => {
					e.stopPropagation();
					handleClose();
				}}
				aria-label="Close lightbox"
			>
				<X class="h-5 w-5" />
			</Button>
		</div>

		<!-- Zoom level indicator -->
		<div class="absolute top-4 left-4 bg-white/10 text-white px-3 py-1 rounded-md text-sm">
			{Math.round(zoomLevel * 100)}%
		</div>

		<!-- Image -->
		<div
			class="max-w-[90vw] max-h-[90vh] overflow-auto p-4"
			onclick={(e) => e.stopPropagation()}
		>
			<img
				{src}
				{alt}
				class="transition-transform duration-200"
				style="transform: scale({zoomLevel}); transform-origin: center;"
				transition:scale={{ duration: 200 }}
				draggable="false"
			/>
		</div>

		<!-- Caption -->
		{#if caption}
			<div
				class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg max-w-2xl text-center text-sm"
				onclick={(e) => e.stopPropagation()}
			>
				{caption}
			</div>
		{/if}
	</div>
{/if}

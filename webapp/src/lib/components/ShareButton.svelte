<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Share2 } from "lucide-svelte";
	import { toast } from "$lib/stores/toast.svelte";

	let {
		title = "Vertrauen in Künstliche Intelligenz",
		text = "Wie Framing das Vertrauen in LLM-basierte Applikationen beeinflusst",
		url = "",
		variant = "outline" as "default" | "outline" | "ghost",
		size = "sm" as "default" | "sm" | "lg" | "icon",
		class: className = "",
	}: {
		title?: string;
		text?: string;
		url?: string;
		variant?: "default" | "outline" | "ghost";
		size?: "default" | "sm" | "lg" | "icon";
		class?: string;
	} = $props();

	// Get current URL if not provided
	const shareUrl = $derived(url || (typeof window !== "undefined" ? window.location.href : ""));

	async function handleShare() {
		// Check if Web Share API is supported
		if (navigator.share) {
			try {
				await navigator.share({
					title,
					text,
					url: shareUrl,
				});
				toast.success("Erfolgreich geteilt!");
			} catch (err) {
				// User cancelled or error occurred
				if (err instanceof Error && err.name !== "AbortError") {
					console.error("Share error:", err);
					fallbackCopyLink();
				}
			}
		} else {
			// Fallback: Copy link to clipboard
			fallbackCopyLink();
		}
	}

	async function fallbackCopyLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			toast.success("Link in Zwischenablage kopiert!");
		} catch (err) {
			console.error("Copy error:", err);
			toast.error("Fehler beim Kopieren des Links");
		}
	}
</script>

<Button
	{variant}
	{size}
	class="gap-2 {className}"
	onclick={handleShare}
	aria-label="Seite teilen"
>
	<Share2 class="h-4 w-4" />
	{#if size !== "icon"}
		<span>Teilen</span>
	{/if}
</Button>

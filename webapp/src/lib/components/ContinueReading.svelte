<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Progress } from "$lib/components/ui/progress";
	import { readingProgress } from "$lib/stores/readingProgress.svelte";
	import { BookOpen, X } from "lucide-svelte";

	function formatTimestamp(timestamp: number): string {
		const now = Date.now();
		const diff = now - timestamp;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return "gerade eben";
		if (minutes < 60) return `vor ${minutes} Minute${minutes > 1 ? "n" : ""}`;
		if (hours < 24) return `vor ${hours} Stunde${hours > 1 ? "n" : ""}`;
		return `vor ${days} Tag${days > 1 ? "en" : ""}`;
	}
</script>

{#if readingProgress.current}
	{@const progress = readingProgress.current}
	<Card class="border-primary/50 bg-primary/5">
		<CardHeader class="pb-3">
			<div class="flex items-start justify-between">
				<div class="flex items-center gap-2">
					<BookOpen class="h-5 w-5 text-primary" />
					<CardTitle class="text-lg">Lesen fortsetzen</CardTitle>
				</div>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6 -mt-1"
					onclick={() => readingProgress.clear()}
					aria-label="Lesefortschritt löschen"
				>
					<X class="h-4 w-4" />
				</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-3">
			<div>
				<p class="text-sm font-medium">{progress.sectionTitle}</p>
				<p class="text-xs text-muted-foreground">
					{formatTimestamp(progress.timestamp)}
				</p>
			</div>
			<Progress value={progress.progress} class="h-2" />
			<a href={readingProgress.getResumeUrl()}>
				<Button class="w-full gap-2">
					<BookOpen class="h-4 w-4" />
					Weiterlesen
				</Button>
			</a>
		</CardContent>
	</Card>
{/if}

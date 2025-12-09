<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { navItems } from "$lib/data/content";
	import { ArrowRight } from "lucide-svelte";
</script>

<svelte:head>
	<title>Vertrauen in Künstliche Intelligenz - Vorstudie</title>
</svelte:head>

<div class="container mx-auto px-4 py-12 max-w-4xl">
	<header class="mb-16 text-center">
		<h1 class="text-5xl font-bold mb-6">
			Vertrauen in Künstliche Intelligenz
		</h1>
		<p class="text-2xl text-muted-foreground mb-4">
			Wie Framing das Vertrauen in LLM-basierte Applikationen und
			Antworten beeinflusst
		</p>
		<div class="text-sm text-muted-foreground space-y-1">
			<p>Vorstudie Bachelorarbeit</p>
			<p>Fabian Ryf | HSLU-W</p>
			<p>
				BSc Business Psychology (BP) | Markt- und Konsumentenpsychologie
			</p>
			<p>Betreuer: Dr. Andreas Hüsser</p>
		</div>
	</header>

	<div class="grid gap-6 md:grid-cols-2 mb-12">
		{#each navItems as item}
			<a href={item.href}>
				<Card
					class="hover:shadow-lg transition-shadow cursor-pointer h-full"
				>
					<CardContent class="p-6">
						<div class="flex items-start justify-between">
							<div>
								<div
									class="text-3xl font-bold text-primary mb-2"
								>
									{item.number}
								</div>
								<h2 class="text-xl font-semibold mb-2">
									{item.title}
								</h2>
							</div>
							<ArrowRight class="h-5 w-5 text-muted-foreground" />
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>

	<footer
		class="mt-16 pt-8 border-t text-center text-sm text-muted-foreground"
	>
		<p>Hochschule Luzern, Wirtschaft (HSLU-W)</p>
		<p class="mt-2">Abgabedatum: 05.12.2025</p>
	</footer>
</div>

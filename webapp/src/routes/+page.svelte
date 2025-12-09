<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
	} from "$lib/components/ui/card";
	import { navItems, githubUrl } from "$lib/data/content";
	import {
		ArrowRight,
		BookOpen,
		FlaskConical,
		FolderOpen,
		BookMarked,
		Download,
		Github,
	} from "lucide-svelte";

	const pageCards = [
		{
			title: "Vorstudie",
			description: "Die vollständige Vorstudie als interaktives Dokument",
			href: "/vorstudie",
			icon: BookOpen,
		},
		{
			title: "Forschung",
			description: "Hypothesen, AI-TAM Modell und Experimentdesign",
			href: "/forschung",
			icon: FlaskConical,
		},
		{
			title: "Materialien",
			description: "Abbildungen, Tabellen und Quellen",
			href: "/materialien",
			icon: FolderOpen,
		},
		{
			title: "Glossar",
			description: "Begriffe und Definitionen",
			href: "/glossar",
			icon: BookMarked,
		},
		{
			title: "Downloads",
			description: "PDF-Dokumente zum Herunterladen",
			href: "/downloads",
			icon: Download,
		},
	];
</script>

<svelte:head>
	<title>Vertrauen in Künstliche Intelligenz - Bachelorarbeit</title>
	<meta
		name="description"
		content="Wie Framing das Vertrauen in LLM-basierte Applikationen beeinflusst - Vorstudie Bachelorarbeit von Fabian Ryf, HSLU-W"
	/>
</svelte:head>

<div class="min-h-[calc(100vh-4rem)] flex flex-col">
	<!-- Hero Section -->
	<section class="flex-1 flex items-center justify-center py-16 px-4">
		<div class="max-w-4xl text-center">
			<h1 class="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
				Vertrauen in Künstliche Intelligenz
			</h1>
			<p
				class="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
			>
				Wie Framing das Vertrauen in LLM-basierte Applikationen und
				Antworten beeinflusst
			</p>
			<div class="text-sm text-muted-foreground mb-12 space-y-1">
				<p>Vorstudie Bachelorarbeit</p>
				<p>Fabian Ryf | Hochschule Luzern, Wirtschaft (HSLU-W)</p>
				<p>
					BSc Business Psychology | Markt- und Konsumentenpsychologie
				</p>
			</div>
			<div class="flex flex-wrap gap-4 justify-center">
				<a href="/vorstudie">
					<Button size="lg" class="gap-2">
						<BookOpen class="h-5 w-5" />
						Vorstudie lesen
					</Button>
				</a>
				<a href={githubUrl} target="_blank" rel="noopener noreferrer">
					<Button variant="outline" size="lg" class="gap-2">
						<Github class="h-5 w-5" />
						GitHub
					</Button>
				</a>
			</div>
		</div>
	</section>

	<!-- Quick Links Grid -->
	<section class="bg-muted/50 py-16 px-4">
		<div class="container mx-auto max-w-6xl">
			<h2 class="text-2xl font-semibold mb-8 text-center">
				Inhalte erkunden
			</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each pageCards as card}
					<a href={card.href} class="group">
						<Card
							class="h-full hover:shadow-lg transition-all duration-200 hover:border-primary/50"
						>
							<CardHeader
								class="flex flex-row items-center gap-4"
							>
								<div
									class="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
								>
									<svelte:component
										this={card.icon}
										class="h-6 w-6"
									/>
								</div>
								<CardTitle class="text-xl"
									>{card.title}</CardTitle
								>
							</CardHeader>
							<CardContent>
								<p class="text-muted-foreground">
									{card.description}
								</p>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-8 px-4 border-t">
		<div
			class="container mx-auto max-w-6xl text-center text-sm text-muted-foreground"
		>
			<p>© 2025 Fabian Ryf | Hochschule Luzern, Wirtschaft</p>
			<p class="mt-2">Betreuer: Dr. Andreas Hüsser</p>
		</div>
	</footer>
</div>

<script lang="ts">
	import { githubUrl } from "$lib/data/content";
	import BookOpen from "@lucide/svelte/icons/book-open";
	import FlaskConical from "@lucide/svelte/icons/flask-conical";
	import BookMarked from "@lucide/svelte/icons/book-marked";
	import Download from "@lucide/svelte/icons/download";
	import Github from "@lucide/svelte/icons/github";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import Target from "@lucide/svelte/icons/target";

	const pageCards = [
		{
			title: "Vorstudie",
			description: "Die vollständige Vorstudie als interaktives Dokument",
			href: "/vorstudie",
			icon: BookOpen,
		},
		{
			title: "Bachelorarbeit",
			description: "Hypothesen, AI-TAM Modell und Experimentdesign",
			href: "/bachelorarbeit",
			icon: FlaskConical,
		},
		{
			title: "Downloads",
			description: "PDF-Dokumente, Abbildungen und Daten",
			href: "/downloads",
			icon: Download,
		},
		{
			title: "Glossar",
			description: "Begriffe und Definitionen",
			href: "/glossar",
			icon: BookMarked,
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

<div class="relative">
	<!-- Hero Section -->
	<section class="min-h-screen flex items-center justify-center px-6 md:px-12 py-32">
		<div class="max-w-6xl w-full">
			<!-- Metadata Label -->
			<div class="text-mono-label mb-16 tracking-widest">
				Bachelorarbeit · HSLU-W · 2025
			</div>

			<!-- Oversized Display Typography -->
			<div class="mb-16">
				<h1 class="font-display font-bold tracking-tighter mb-8">
					<span class="block text-5xl md:text-7xl lg:text-8xl mb-4">Vertrauen</span>
					<span class="block text-5xl md:text-7xl lg:text-8xl mb-4">in Künstliche</span>
					<span class="block text-6xl md:text-8xl lg:text-9xl">Intelligenz</span>
				</h1>

				<!-- Decorative Rule with Box -->
				<div class="flex items-center gap-4 mb-12">
					<div class="h-1 bg-black flex-1"></div>
					<div class="w-4 h-4 border-2 border-black"></div>
				</div>

				<!-- Subtitle -->
				<p class="text-xl md:text-2xl lg:text-3xl max-w-3xl leading-relaxed font-serif">
					Wie Framing das Vertrauen in LLM-basierte Applikationen und Antworten beeinflusst
				</p>
			</div>

			<!-- Author Info -->
			<div class="border-t-2 border-black pt-8 max-w-3xl">
				<div class="grid md:grid-cols-2 gap-8 text-base leading-relaxed">
					<div>
						<p class="font-semibold mb-1">Fabian Ryf</p>
						<p class="text-mutedForeground">BSc Business Psychology</p>
						<p class="text-mutedForeground">Markt- und Konsumentenpsychologie</p>
					</div>
					<div>
						<p class="font-semibold mb-1">Hochschule Luzern, Wirtschaft</p>
						<p class="text-mutedForeground">Betreuer: Dr. Andreas Hüsser</p>
					</div>
				</div>
			</div>

			<!-- CTA Buttons -->
			<div class="flex flex-wrap gap-4 mt-12">
				<a
					href="/vorstudie"
					class="group inline-flex items-center gap-2 bg-black text-white px-8 py-4 text-sm uppercase tracking-widest font-medium border-2 border-black hover:bg-white hover:text-black transition-colors duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3"
				>
					<BookOpen size={20} strokeWidth={1.5} />
					Vorstudie Lesen
					<ArrowRight size={16} strokeWidth={1.5} class="group-hover:translate-x-1 transition-transform duration-100" />
				</a>
				<a
					href={githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest font-medium border-2 border-black hover:bg-black hover:text-white transition-colors duration-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-3"
				>
					<Github size={20} strokeWidth={1.5} />
					GitHub
				</a>
			</div>
		</div>
	</section>

	<!-- Forschungsfrage Section -->
	<section class="px-6 md:px-12 py-24 lg:py-32">
		<div class="max-w-4xl mx-auto">
			<div class="flex items-center gap-4 mb-12">
				<div class="w-12 h-12 border-2 border-black flex items-center justify-center">
					<Target size={24} strokeWidth={1.5} />
				</div>
				<h2 class="font-display text-3xl md:text-4xl font-bold tracking-tight">Forschungsfrage</h2>
			</div>

			<div class="border-2 border-black p-8 md:p-12 bg-white">
				<div class="text-5xl md:text-6xl leading-none mb-8 opacity-20">"</div>
				<blockquote class="text-2xl md:text-3xl font-display italic leading-tight -mt-12">
					Wie beeinflusst das Framing von Konfidenzangaben einer
					LLM-basierten Applikation das Vertrauen der Nutzer und deren
					Nutzungsabsicht?
				</blockquote>
				<div class="text-5xl md:text-6xl leading-none mt-8 text-right opacity-20">"</div>
			</div>
		</div>
	</section>

	<!-- Content Grid Section -->
	<section class="px-6 md:px-12 py-24 lg:py-32">
		<div class="max-w-6xl mx-auto">
			<h2 class="font-display text-4xl md:text-5xl font-bold tracking-tight mb-16">
				Inhalte
			</h2>

			<div class="grid md:grid-cols-2 gap-0 border-2 border-black">
				{#each pageCards as card, i}
					<a
						href={card.href}
						class="group border-black p-12 lg:p-16 hover-invert relative overflow-hidden {i < pageCards.length - 2 ? 'border-b-2' : ''} {i % 2 === 0 && i < pageCards.length - 1 ? 'md:border-r-2' : ''}"
					>
						<!-- Icon in circle -->
						<div class="mb-6">
							<div class="w-12 h-12 border-2 border-black flex items-center justify-center group-hover:border-white group-hover:bg-white transition-colors duration-100">
								<svelte:component
									this={card.icon}
									size={24}
									strokeWidth={1.5}
									class="group-hover:text-black transition-colors duration-100"
								/>
							</div>
						</div>

						<!-- Title -->
						<h3 class="font-display text-2xl lg:text-3xl font-bold mb-3 tracking-tight">
							{card.title}
						</h3>

						<!-- Description -->
						<p class="text-base lg:text-lg leading-relaxed opacity-70 group-hover:opacity-90 transition-opacity duration-100">
							{card.description}
						</p>

						<!-- Arrow indicator -->
						<div class="absolute bottom-8 right-8">
							<ArrowRight
								size={24}
								strokeWidth={1.5}
								class="group-hover:translate-x-1 group-hover:translate-y-[-0.25rem] transition-transform duration-100"
							/>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- Inverted Section - About -->
	<section class="section-inverted px-6 md:px-12 py-32 lg:py-40">
		<div class="max-w-6xl mx-auto relative z-10">
			<div class="max-w-3xl">
				<p class="text-mono-label text-white/70 mb-8">
					Über diese Arbeit
				</p>
				<p class="font-display text-3xl md:text-4xl lg:text-5xl leading-tight mb-12 font-serif italic">
					Diese Vorstudie untersucht, wie die Art und Weise der Präsentation—das Framing—das
					Vertrauen von Nutzern in KI-basierte Systeme beeinflusst.
				</p>
				<div class="flex items-start gap-4">
					<div class="w-8 h-[2px] bg-white mt-3"></div>
					<div class="text-lg leading-relaxed space-y-4">
						<p>
							Im Kontext von Large Language Models (LLMs) wird untersucht, welche
							Faktoren das Vertrauensverhältnis zwischen Mensch und Maschine prägen
							und wie verschiedene Darstellungsformen die Wahrnehmung beeinflussen.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t-2 border-black py-16 px-6 md:px-12">
		<div class="max-w-6xl mx-auto">
			<div class="grid md:grid-cols-3 gap-8 mb-12">
				<div>
					<p class="text-mono-label mb-4">Autor</p>
					<p class="font-semibold">Fabian Ryf</p>
					<p class="text-mutedForeground text-sm">Hochschule Luzern, Wirtschaft</p>
				</div>
				<div>
					<p class="text-mono-label mb-4">Betreuung</p>
					<p class="font-semibold">Dr. Andreas Hüsser</p>
				</div>
				<div>
					<p class="text-mono-label mb-4">Links</p>
					<div class="space-y-2">
						<a
							href={githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="block underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
						>
							GitHub Repository
						</a>
					</div>
				</div>
			</div>
			<div class="border-t-2 border-black pt-8">
				<p class="text-sm text-mutedForeground">© 2025 Fabian Ryf. Alle Rechte vorbehalten.</p>
			</div>
		</div>
	</footer>
</div>

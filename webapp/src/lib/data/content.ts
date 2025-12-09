export interface Section {
    id: string;
    number: string;
    title: string;
    slug: string;
    content: string;
    wordCount: number;
    subsections?: Subsection[];
}

export interface Subsection {
    id: string;
    title: string;
    content: string;
}

export interface NavItem {
    number: string;
    title: string;
    href: string;
}

// Navigation structure
export const navItems: NavItem[] = [
    { number: '1', title: 'Einleitung', href: '/einleitung' },
    { number: '2', title: 'Theoretische Einbettung', href: '/theory' },
    { number: '3', title: 'Forschungsfrage', href: '/forschungsfrage' },
    { number: '4', title: 'Forschungsdesign', href: '/methodology' }
];

// Calculate reading time (average 200 words per minute)
export function calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / 200);
}

// Placeholder content - to be extracted from LaTeX
export const sections: Section[] = [
    {
        id: 'einleitung',
        number: '1',
        title: 'Einleitung',
        slug: 'einleitung',
        wordCount: 850,
        content: `
			<p>Mit der Veröffentlichung von ChatGPT von OpenAI im Jahr 2022 wurde eine technologische Wende eingeleitet. Bereits heute vereinfachen und verändern LLM-basierte Applikationen wie ChatGPT von OpenAI, Claude von Anthropic und Gemini von Google viele Tätigkeiten des (Arbeits-)Lebens.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            {
                id: 'ausgangslage',
                title: 'Ausgangslage',
                content: '<p>Mit der Lancierung von Alva erweitert der Kanton Basel-Stadt sein bestehendes Informationsangebot...</p>'
            },
            {
                id: 'zielsetzung',
                title: 'Zielsetzung',
                content: '<p>Die vorliegende Bachelorarbeit verfolgt zwei zentrale Ziele...</p>'
            },
            {
                id: 'machbarkeit',
                title: 'Machbarkeit',
                content: '<p>Das vorliegende Forschungsdesign basiert auf einem experimentellen Testen...</p>'
            },
            {
                id: 'arbeitsplan',
                title: 'Arbeitsplan',
                content: '<p>Der folgende Arbeitsplan zeigt die zeitliche Planung der Vorstudie.</p>'
            }
        ]
    },
    {
        id: 'theory',
        number: '2',
        title: 'Theoretische Einbettung',
        slug: 'theory',
        wordCount: 1200,
        content: `
			<p>Modelltheoretisch knüpft die vorliegende Arbeit an frühere Studien in den Bereichen Vertrauen in künstliche Intelligenz, wahrgenommene Nützlichkeit sowie Benutzerfreundlichkeit und die daraus abgeleitete Nutzungsabsicht an.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            {
                id: 'tam',
                title: 'Technology Acceptance Model',
                content: '<p>Das TAM wurde entwickelt, um die mangelnde Nutzerakzeptanz...</p>'
            },
            {
                id: 'ai-tam',
                title: 'Erweiterungen des TAM zum AI-TAM',
                content: '<p>Baroni et al. erweiterten das TAM um drei zusätzliche Konstrukte...</p>'
            },
            {
                id: 'framing',
                title: 'Framing-Effekt',
                content: '<p>Der Framing-Effekt, erstmals von Kahneman und Tversky beschrieben...</p>'
            }
        ]
    },
    {
        id: 'forschungsfrage',
        number: '3',
        title: 'Forschungsfrage',
        slug: 'forschungsfrage',
        wordCount: 150,
        content: `
			<p>Aus der Auseinandersetzung mit der Literatur und den bestehenden Modellen zur Technologieakzeptanz ergibt sich folgende übergeordnete Forschungsfrage:</p>
			<p class="italic font-medium">Wie beeinflusst das Framing von Konfidenzangaben einer LLM-basierten Applikation das Vertrauen der Nutzer und deren Nutzungsabsicht?</p>
		`
    },
    {
        id: 'methodology',
        number: '4',
        title: 'Forschungsdesign',
        slug: 'methodology',
        wordCount: 950,
        content: `
			<p>Das Experiment untersucht den Einfluss von Framing bezüglich Sicherheit und Unsicherheit auf das Vertrauen in KI-gestützte Systeme.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            {
                id: 'design',
                title: 'Experimentelles Design',
                content: '<p>Das Untersuchungsdesign entspricht einem 3x2 faktoriellen Between-Subjects-Design...</p>'
            },
            {
                id: 'stimulus',
                title: 'Stimulus-Konzept',
                content: '<p>Der Stimulus besteht aus der visuellen und textlichen Darstellung...</p>'
            },
            {
                id: 'ablauf',
                title: 'Ablauf Experiment',
                content: '<p>Das geplante Experiment findet in drei Phasen statt...</p>'
            }
        ]
    }
];

// Get section by slug
export function getSectionBySlug(slug: string): Section | undefined {
    return sections.find((s) => s.slug === slug);
}

// Get next/previous sections for navigation
export function getAdjacentSections(currentSlug: string) {
    const currentIndex = sections.findIndex((s) => s.slug === currentSlug);
    return {
        previous: currentIndex > 0 ? sections[currentIndex - 1] : null,
        next: currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null
    };
}

export interface Section {
    id: string;
    number: string;
    title: string;
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
    title: string;
    href: string;
    icon?: string;
    external?: boolean;
}

// Main navigation structure
export const navItems: NavItem[] = [
    { title: 'Vorstudie', href: '/vorstudie' },
    { title: 'Forschung', href: '/forschung' },
    { title: 'Materialien', href: '/materialien' },
    { title: 'Glossar', href: '/glossar' },
    { title: 'Downloads', href: '/downloads' }
];

// GitHub link (separate for footer/header)
export const githubUrl = 'https://github.com/mrryf/bachelor-thesis';

// Calculate reading time (average 200 words per minute)
export function calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / 200);
}

// Prestudy document sections
export const sections: Section[] = [
    {
        id: 'einleitung',
        number: '1',
        title: 'Einleitung',
        wordCount: 850,
        content: `
			<p>Mit der Veröffentlichung von ChatGPT von OpenAI im Jahr 2022 wurde eine technologische Wende eingeleitet. Bereits heute vereinfachen und verändern LLM-basierte Applikationen wie ChatGPT von OpenAI, Claude von Anthropic und Gemini von Google viele Tätigkeiten des (Arbeits-)Lebens.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            { id: 'ausgangslage', title: 'Ausgangslage', content: '<p>Mit der Lancierung von Alva erweitert der Kanton Basel-Stadt sein bestehendes Informationsangebot...</p>' },
            { id: 'zielsetzung', title: 'Zielsetzung', content: '<p>Die vorliegende Bachelorarbeit verfolgt zwei zentrale Ziele...</p>' },
            { id: 'machbarkeit', title: 'Machbarkeit', content: '<p>Das vorliegende Forschungsdesign basiert auf einem experimentellen Testen...</p>' },
            { id: 'arbeitsplan', title: 'Arbeitsplan', content: '<p>Der folgende Arbeitsplan zeigt die zeitliche Planung der Vorstudie.</p>' }
        ]
    },
    {
        id: 'theory',
        number: '2',
        title: 'Theoretische Einbettung',
        wordCount: 1200,
        content: `
			<p>Modelltheoretisch knüpft die vorliegende Arbeit an frühere Studien in den Bereichen Vertrauen in künstliche Intelligenz, wahrgenommene Nützlichkeit sowie Benutzerfreundlichkeit und die daraus abgeleitete Nutzungsabsicht an.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            { id: 'tam', title: 'Technology Acceptance Model', content: '<p>Das TAM wurde entwickelt, um die mangelnde Nutzerakzeptanz...</p>' },
            { id: 'ai-tam', title: 'Erweiterungen des TAM zum AI-TAM', content: '<p>Baroni et al. erweiterten das TAM um drei zusätzliche Konstrukte...</p>' },
            { id: 'framing', title: 'Framing-Effekt', content: '<p>Der Framing-Effekt, erstmals von Kahneman und Tversky beschrieben...</p>' }
        ]
    },
    {
        id: 'forschungsfrage',
        number: '3',
        title: 'Forschungsfrage',
        wordCount: 150,
        content: `
			<blockquote class="border-l-4 border-primary pl-4 italic my-6">
				Wie beeinflusst das Framing von Konfidenzangaben einer LLM-basierten Applikation das Vertrauen der Nutzer und deren Nutzungsabsicht?
			</blockquote>
		`
    },
    {
        id: 'methodology',
        number: '4',
        title: 'Forschungsdesign',
        wordCount: 950,
        content: `
			<p>Das Experiment untersucht den Einfluss von Framing bezüglich Sicherheit und Unsicherheit auf das Vertrauen in KI-gestützte Systeme.</p>
			<p class="text-muted-foreground italic">[Vollständiger Inhalt wird aus LaTeX extrahiert...]</p>
		`,
        subsections: [
            { id: 'design', title: 'Experimentelles Design', content: '<p>Das Untersuchungsdesign entspricht einem 3x2 faktoriellen Between-Subjects-Design...</p>' },
            { id: 'stimulus', title: 'Stimulus-Konzept', content: '<p>Der Stimulus besteht aus der visuellen und textlichen Darstellung...</p>' },
            { id: 'ablauf', title: 'Ablauf Experiment', content: '<p>Das geplante Experiment findet in drei Phasen statt...</p>' }
        ]
    }
];

// Figure data
export const figures = [
    {
        id: 'ai-tam',
        src: '/images/ba_faryf_ai_tam.jpg',
        caption: 'Erweitertes TAM-Modell: Artificial Intelligence-Technology Acceptance Model (AI-TAM)',
        alt: 'AI-TAM Model Diagram'
    },
    {
        id: 'hypothesen',
        src: '/images/ba_faryf_hypothesen_design.jpg',
        caption: 'Hypothesenmodell mit Pfadbeziehungen',
        alt: 'Hypothesis Design'
    },
    {
        id: 'ablauf',
        src: '/images/ba_faryf_ablauf_experiment.jpg',
        caption: 'Ablauf des Experiments in drei Phasen',
        alt: 'Experiment Flow'
    },
    {
        id: '3x2-design',
        src: '/images/ba_faryf_experiment_design_3x2.jpg',
        caption: 'Experimentelles 3x2 faktorielles Design',
        alt: '3x2 Factorial Design'
    },
    {
        id: 'messmodell',
        src: '/images/ba_faryf_messmodell.jpg',
        caption: 'Messmodell mit latenten Konstrukten',
        alt: 'Measurement Model'
    }
];

// Glossary terms
export const glossaryTerms = [
    { term: 'TAM', definition: 'Technology Acceptance Model - Modell zur Erklärung der Nutzerakzeptanz von Technologien' },
    { term: 'AI-TAM', definition: 'Artificial Intelligence Technology Acceptance Model - Erweitertes TAM für KI-Systeme' },
    { term: 'Framing', definition: 'Art der Präsentation von Information, die die Wahrnehmung beeinflusst' },
    { term: 'Attribute Framing', definition: 'Darstellung eines Attributs in positiver oder negativer Weise' },
    { term: 'LLM', definition: 'Large Language Model - Grosses Sprachmodell' },
    { term: 'PEOU', definition: 'Perceived Ease of Use - Wahrgenommene Benutzerfreundlichkeit' },
    { term: 'PU', definition: 'Perceived Usefulness - Wahrgenommene Nützlichkeit' },
    { term: 'BI', definition: 'Behavioral Intention - Verhaltensabsicht' },
    { term: 'CI', definition: 'Collaborative Intention - Kooperationsabsicht' },
    { term: 'XAIT', definition: 'Explainable AI Trust - Vertrauen durch erklärbare KI' },
    { term: 'Konfidenz', definition: 'Grad der Sicherheit/Unsicherheit einer KI-Antwort' }
];

// Total word count for full document
export const totalWordCount = sections.reduce((sum, s) => sum + s.wordCount, 0);

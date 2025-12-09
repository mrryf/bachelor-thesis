export interface Section {
    id: string;
    title: string;
    subsections?: Section[];
    content: string;
    figures?: Figure[];
    tables?: Table[];
}

export interface Figure {
    id: string;
    src: string;
    caption: string;
    alt: string;
}

export interface Table {
    id: string;
    caption: string;
    headers: string[];
    rows: string[][];
}

// Placeholder data - will be populated from LaTeX files
export const sections: Section[] = [
    {
        id: 'einleitung',
        title: 'Einleitung',
        content: 'Content to be extracted from LaTeX...',
        subsections: [
            { id: 'ausgangslage', title: 'Ausgangslage', content: '...' },
            { id: 'zielsetzung', title: 'Zielsetzung', content: '...' },
            { id: 'machbarkeit', title: 'Machbarkeit', content: '...' },
            { id: 'arbeitsplan', title: 'Arbeitsplan', content: '...' }
        ]
    },
    {
        id: 'theory',
        title: 'Theoretische Einbettung',
        content: 'Content to be extracted from LaTeX...'
    },
    {
        id: 'forschungsfrage',
        title: 'Forschungsfrage',
        content: 'Content to be extracted from LaTeX...'
    },
    {
        id: 'methodology',
        title: 'Forschungsdesign',
        content: 'Content to be extracted from LaTeX...'
    }
];

export const figures: Figure[] = [
    {
        id: 'fig-ai-tam',
        src: '/images/ba_faryf_ai_tam.jpg',
        caption: 'Erweitertes TAM-Modell: Artificial Intelligence-Technology Acceptance Model',
        alt: 'AI-TAM Model Diagram'
    },
    {
        id: 'fig-hypothesen',
        src: '/images/ba_faryf_hypothesen_design.jpg',
        caption: 'Hypothesenmodell',
        alt: 'Hypothesis Design'
    },
    {
        id: 'fig-ablauf',
        src: '/images/ba_faryf_ablauf_experiment.jpg',
        caption: 'Ablauf des Experiments in drei Phasen',
        alt: 'Experiment Flow'
    },
    {
        id: 'fig-3x2-design',
        src: '/images/ba_faryf_experiment_design_3x2.jpg',
        caption: 'Experimentelles 3x2 Design',
        alt: '3x2 Factorial Design'
    },
    {
        id: 'fig-messmodell',
        src: '/images/ba_faryf_messmodell.jpg',
        caption: 'Messmodell',
        alt: 'Measurement Model'
    }
];

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
			<p>Mit der Veröffentlichung von ChatGPT von OpenAI im Jahr 2022 (Cunningham et al., 2025) wurde eine technologische Wende eingeleitet. Bereits heute vereinfachen und verändern LLM-basierte Applikationen wie ChatGPT von OpenAI (OpenAI, 2025), Claude von Anthropic (Anthropic, 2025) und Gemini von Google (Google Inc., 2025) viele Tätigkeiten des (Arbeits-)Lebens. Die rasante Verbreitung dieser Technologie zeigt sich eindrücklich: Innerhalb von nur sieben Monaten im Jahr 2025 konnte OpenAI seine Nutzerbasis von 350 auf über 700 Millionen wöchentlich aktive Nutzer steigern (Cunningham et al., 2025).</p>
			<p>Chatbots spielen im Alltag inzwischen in mehrfacher Hinsicht eine wichtige Rolle: Sie unterstützen bei der Informationsbeschaffung, geben praktische Anleitungen und bieten zum Beispiel Hilfe in der Programmierung sowie in Kreativprozessen. Dabei treten sie als tägliche Begleiter des Menschen auf: Ob durch eine bewusst durchgeführte Interaktion oder als ein im Hintergrund stattfindender, unbewusster Berührungspunkt (Cunningham et al., 2025).</p>
			<p>Mit ihrer relativ jungen (und öffentlichkeitswirksamen) Geschichte ist die generative künstliche Intelligenz, wie viele übergreifende technologischen Veränderungen, einem technologischen- und gesellschaftlichen Adoptionsprozess ausgesetzt. Einen theoretischen Erklärungsansatz dieses Adoptionsprozesses liefert Fred Davis 1989 mit seinem Werk «User acceptance of information systems: the technology acceptance model (TAM)». In seiner Arbeit legt Davis den Fokus auf die wahrgenommene Nützlichkeit («Perceived Usefulness») und die Einfachheit der Nutzung («Ease of Use»), woraus die Verhaltensintention («Behavourial Intention») abgeleitet wird (Davis, 1989). Im Kontext von generativer KI, oder künstlicher Intelligenz im Allgemeinen, ist jedoch der Aspekt des Vertrauens in die Technologie von besonderer Bedeutung. Neben Nützlichkeit und Einfachheit stellt die Vertrauensfrage den Aspekt dar, ob künstlicher Intelligenz vertrauenswürdig ist. Sämtliche grossen Anbieter wie ChatGPT, Claude und Gemini weisen vor- sowie während der Nutzung ausdrücklich darauf hin, dass ihre Modelle und konsequenterweise KI-Assistenten die auf diesen Modellen basieren, fehlerhaft sein können. Diese Fehleranfälligkeit sowie zusätzliche Vorbehalte, wie die Angst vor Jobverlust, Bedenken hinsichtlich der Privatsphäre oder ethische Fragen (Li & Huang, 2020), erfordern die Integration und Erfassung von «Vertrauen» als eigenständiges Konstrukt in möglichen theoretischen Modellen.</p>
		`,
        subsections: [
            {
                id: 'ausgangslage',
                title: 'Ausgangslage',
                content: `
                    <p>Mit der Lancierung von Alva erweitert der Kanton Basel-Stadt sein bestehendes Informationsangebot um eine KI-gestützte Interaktionsform. Bei Alva handelt es sich um einen LLM-basierten Chatbot, der auf der Technologie von ChatGPT basiert und die Inhalte der Kantonswebsite bs.ch als Wissensbasis nutzt, um Fragen der Bevölkerung in natürlicher Konversationsform zu beantworten.</p>
                    <p>Die Einführung von Alva markiert für den Kanton Basel-Stadt einen bedeutsamen Schritt: Es handelt sich um eine der ersten KI-gestützten Lösungen dieser Art im kantonalen Kontext. Die gewonnenen Erkenntnisse aus diesem Pilotprojekt sollen als Grundlage für weitere KI-basierte Initiativen des Kantons dienen.</p>
                    <p>Aktuell verzeichnet Alva täglich rund 700 aktive Nutzer, die im Durchschnitt 1.4 Interaktionen mit dem digitalen Assistenten durchführen. Nebst der erwarteten Effizienzsteigerung bei der Informationsbeschaffung ist es von besonderem Interesse zu untersuchen, inwiefern das Vertrauen in die KI-Lösung die Nutzungsabsicht beeinflusst.</p>
                `
            },
            {
                id: 'zielsetzung',
                title: 'Zielsetzung',
                content: `
                    <p>Die vorliegende Bachelorarbeit verfolgt zwei zentrale Ziele: Erstens soll empirisch untersucht werden, wie unterschiedliche Darstellungsformen von KI-Konfidenzwerten (positives vs. negatives Framing) das Nutzervertrauen in LLM-basierte Assistenzsysteme beeinflussen (Levin & Schneider, 1998; Kim & Song, 2022). Zweitens soll die Anwendbarkeit des Artificial Intelligence Technology Acceptance Model (AI-TAM) im Kontext eines öffentlichen KI-Assistenten validiert werden, insbesondere hinsichtlich der Mediationsrolle von Vertrauen zwischen Transparenzkommunikation und Nutzungsintention (Baroni et al., 2022).</p>
                `
            },
            {
                id: 'machbarkeit',
                title: 'Machbarkeit',
                content: `
                    <p>Das vorliegende Forschungsdesign basiert auf einem experimentellen Testen verschiedener Konfidenz-Werte innerhalb eines chatbot-basierten Umfeldes. Das Experiment soll im Idealfall in einer tatsächlichen Chatbot-Interaktion stattfinden, anstelle einer fragebogenbasierten Stimulus-Darbietung.</p>
                    <p>Die von Basel-Stadt entwickelte Lösung «Alva» (Kanton Basel-Stadt, 2025) dient als zentraler digitaler Assistent bei der Bedienung und Navigation der Website des Kantons Basel-Stadt. Alva verfügt über die sämtlichen Inhalte der Kantonswebsite als Wissensbasis und ermöglicht es Nutzern, Informationen zu gewünschten Themen abzurufen. Das Abrufen von Informationen funktioniert themen- und bereichsübergreifend, was inhaltlich anspruchsvolle Themen und Prozesse in einfache Schritte herunterbricht und die benötigten Links und Dokumente als Referenzinformationen zusätzlich zur gelieferten Antwort auf die gestellte Anfrage bereitstellt. Alva zählt zum heutigen Zeitpunkt täglich rund 550 Nutzer mit durchschnittlich 1.4 Interaktionen pro Nutzer.</p>
                    <p>Nach initialen Unterhaltungen ist der Kanton Basel-Stadt einverstanden, das vorgesehene Experiment in der Live-Umgebung von Alva durchzuführen. Die anfallenden Arbeiten zur Integration werden zu je 50% vom Auftraggeber Liip (Liip AG, 2025) und dem Kanton Basel-Stadt getragen. Die benötigte Stimulus-Konzeption und das Survey-Design obliegen in der Verantwortung des Studierenden.</p>
                `
            },
            {
                id: 'arbeitsplan',
                title: 'Arbeitsplan',
                content: `
                    <p>Der folgende Arbeitsplan zeigt die zeitliche Planung der Vorstudie.</p>
                    <p><em>Hinweis: Gantt-Chart Visualisierung wird in einer zukünftigen Version als dedizierte Komponente integriert.</em></p>
                `
            }
        ]
    },
    {
        id: 'theory',
        number: '2',
        title: 'Theoretische Einbettung',
        wordCount: 1500,
        content: `
			<p>Modelltheoretisch knüpft die vorliegende Arbeit an frühere Studien in den Bereichen Vertrauen in künstliche Intelligenz, wahrgenommene Nützlichkeit sowie Benutzerfreundlichkeit und die daraus abgeleitete Nutzungsabsicht an. Als theoretische Grundlage dient zunächst das Technology Acceptance Model, welches die Rahmenbedingungen zur Analyse von Adoptionsprozessen neuer Technologien schafft (Davis, 1989). Den zweiten Baustein liefert die Erweiterung des TAM-Modells durch Baroni et al. (2022). Diese ergänzt das Modell um zusätzliche Faktoren wie das Vertrauen in KI-gestützte Assistenten und bildet diese im Artificial Intelligence Technology Acceptance Model (AI-TAM) ab (Baroni et al., 2022). Zuletzt wird der Framing-Effekt theoretisch beleuchtet, da dieser für die gewählte Stimulus-Wahl relevant ist. Konkret wird dabei die Form des Attribute-Framing-Effekts betrachtet (Druckman, 2001; Freling et al., 2014).</p>
		`,
        subsections: [
            {
                id: 'tam',
                title: 'Technology Acceptance Model',
                content: `
                    <p>Das TAM wurde entwickelt, um die mangelnde Nutzerakzeptanz von Informationssystemen zu adressieren, die als Haupthindernis für den Erfolg neuer Technologien identifiziert wurde. Davis untersuchte 112 Angestellte und Manager eines grossen nordamerikanischen Unternehmens, die zwei unterschiedliche Softwaresysteme nutzten - ein elektronisches Mailsystem und einen Texteditor. TAM besagt, dass die tatsächliche Systemnutzung durch die Verhaltensintention bestimmt wird, welche von der Einstellung zur Nutzung abhängt. Diese Einstellung wird durch zwei zentrale Konstrukte geprägt: Perceived Usefulness, definiert als «the degree to which an individual believes that using a particular system would enhance his or her job performance», sowie Perceived Ease of Use, verstanden als «the degree to which an individual believes that using a particular system would be free of physical and mental effort».</p>
                `
            },
            {
                id: 'ai-tam',
                title: 'Erweiterungen des TAM zum AI-TAM',
                content: `
                    <p>Baroni et al. (2022) erweiterten das TAM um drei zusätzliche Konstrukte: «Explainable AI Trust» (Vertrauen in KI) aus der Literatur zu «Explainable AI» (XAI), «Collaborative Intention» (Kollaborationsabsicht) zur Messung der Bereitschaft zur Teilnahme an «Human-in-the-Loop»-Mechanismen sowie die Vertrautheit mit der Technologie und dem Anwendungskontext. Das im AI-TAM verwendete Vertrauenskonstrukt entstammt der Forschung von Hoffman et al. (2019) und erfasst, inwieweit Nutzer den Ergebnissen eines KI-Systems vertrauen. Ergänzend misst die Kollaborationsabsicht die Bereitschaft, aktiv an der Weiterentwicklung der KI mitzuwirken.</p>
                    <p><em>Hinweis: AI-TAM Modell-Visualisierung wird als dedizierte Komponente integriert.</em></p>
                `
            },
            {
                id: 'framing',
                title: 'Framing-Effekt',
                content: `
                    <p>Der Framing-Effekt, erstmals von Kahneman und Tversky in ihrer Prospect Theory beschrieben, zeigt, dass Entscheidungen davon beeinflusst werden, wie Informationen präsentiert werden (Tversky & Kahneman, 1986). Der Framing-Effekt zeigt unter anderem, wie identische Szenarien zu unterschiedlichen Präferenzen führen, je nachdem ob sie in Gewinn- oder Verlustbegriffen formuliert werden. Während sich die frühe Forschung auf riskante Entscheidungen konzentrierte, erweiterte sich das Konzept auf verschiedene Framing-Typen wie Risky Choice Framing, Goal Framing und Attribute Framing.</p>
                    <p>Freling et al. (2014) führten eine umfassende Meta-Analyse von 107 Studien zum Thema Attribute Framing durch. Attribute Framing bezeichnet die Darstellung identischer Informationen in unterschiedlicher Formulierung – beispielsweise „80% Erfolgsrate" versus „20% Misserfolgsrate". Die etablierte Forschungsmeinung ging davon aus, dass positive Formulierungen grundsätzlich wirksamer sind als negative.</p>
                    <p>Die zentrale Erkenntnis der Meta-Analyse: Die Wirksamkeit eines Frames hängt nicht allein von seiner positiven oder negativen Formulierung ab, sondern von der Passung zwischen Abstraktionsniveau und psychologischer Distanz. Konkret bedeutet dies: Abstrakte Botschaften wirken besser bei psychologisch entfernten Ereignissen (z.B. Entscheidungen für die ferne Zukunft), während konkrete Botschaften bei psychologisch nahen Ereignissen effektiver sind. Positive Formulierungen fördern dabei eher abstraktes Denken, negative Formulierungen eher konkretes Denken. Die Autoren schlussfolgern, dass nicht das Vorzeichen der Botschaft entscheidend ist, sondern die Kongruenz zwischen der Darstellungsweise und der wahrgenommenen Nähe zum Thema (Freling et al., 2014).</p>
                `
            },
            {
                id: 'attribute-framing',
                title: 'Attribute Framing',
                content: `
                    <p>Attribute Framing unterscheidet sich von anderen Framing-Typen, da hier ein einzelnes Attribut in äquivalenten aber unterschiedlich valenten Begriffen beschrieben wird. Levin und Gaeth demonstrierten dies mit Hackfleisch, das entweder als «75% mager» oder «25% fett» beschrieben wurde (Levin & Gaeth, 1988). Der Attribute Framing-Effekt manifestiert sich in einer valenz-konsistenten Verschiebung: Positive Frames führen zu günstigeren Bewertungen als negative. Ihre Studie zeigte zudem, dass direkte Produkterfahrung den Framing-Effekt abschwächt. Dieser Befund wird durch ein Averaging-Modell erklärt, bei dem zusätzliche Informationsquellen den Einfluss einzelner Frames reduzieren. Dolgopolova et al. (2022) fanden bei Lebensmittelentscheidungen weitere Effekte: Positive Frames erzeugten positivere Einstellungen, jedoch keinen signifikanten Effekt auf Kaufintentionen. Der Framing-Effekt variiert somit je nach abhängiger Variable. Für die KI-Akzeptanz ist Attribute Framing relevant, da KI-Systeme durch unterschiedliche Konfidenz-Darstellungen charakterisiert werden können (vgl. Levin & Schneider, 1998; Kim & Song, 2022). Das AI-TAM bietet den Rahmen, um diese Effekte auf Vertrauen und Nutzungsabsicht zu untersuchen.</p>
                `
            },
            {
                id: 'latente-konstrukte',
                title: 'Latente Konstrukte',
                content: `
                    <p>Die latenten Konstrukte werden mittels einer Online-Befragung nach der Nutzung der KI-Assistenz erhoben. Die verwendeten Konstrukte basieren auf dem AI-TAM von Baroni et al. (2022) und wurden aus drei Quellen adaptiert: Ibrahim et al. (2025) für die Kernkonstrukte wahrgenommene Nützlichkeit, Einfachheit der Nutzung, Verhaltensintention und Vertrauen in KI; Topsakal et al. (2025) für die technologische Vorerfahrung; sowie Grassi et al. (2022) für die Kollaborationsintention. Alle Items werden auf einer 5-stufigen Likert-Skala erhoben.</p>
                `
            },
            {
                id: 'hypothesen',
                title: 'Hypothesenübersicht',
                content: `
                    <p><em>Hinweis: Hypothesenmodell und Hypothesentabellen werden als dedizierte Komponente integriert. Siehe Forschung-Seite für interaktives Hypothesendiagramm.</em></p>
                `
            }
        ]
    },
    {
        id: 'forschungsfrage',
        number: '3',
        title: 'Forschungsfrage',
        wordCount: 100,
        content: `
			<p>Aus der Auseinandersetzung mit der Literatur und den bestehenden Modellen zur Technologieakzeptanz ergibt sich folgende übergeordnete Forschungsfrage:</p>
			<blockquote class="border-l-4 border-primary pl-4 italic my-6">
				Wie beeinflusst das Framing von Konfidenzangaben einer LLM-basierten Applikation das Vertrauen der Nutzer und deren Nutzungsabsicht?
			</blockquote>
		`
    },
    {
        id: 'methodology',
        number: '4',
        title: 'Forschungsdesign',
        wordCount: 1200,
        content: `
			<p>Das Experiment untersucht den Einfluss von Framing bezüglich Sicherheit und Unsicherheit auf das Vertrauen in KI-gestützte Systeme. In einem 3x2 Between-Subjects-Design wird die Darstellung von Konfidenzwerten (Sicherheit vs. Unsicherheit) bei variierenden Accuracy-Scores (hoch, mittel, niedrig) manipuliert. Daraus ergeben sich sechs Experimentalgruppen sowie eine Kontrollgruppe ohne Konfidenzwert-Anzeige. Die experimentelle Manipulation erfolgt während der realen Interaktion mit einem KI-Assistenten.</p>
		`,
        subsections: [
            { id: 'design', title: 'Experimentelles Design', content: '<p>Das Untersuchungsdesign entspricht einem 3x2 faktoriellen Between-Subjects-Design. Die erste unabhängige Variable (Framing) variiert die Darstellung als Sicherheit versus Unsicherheit, die zweite unabhängige Variable (Konfidenzwert) variiert den Konfidenzwert in drei Stufen (hoch, mittel, niedrig).</p><p><em>Hinweis: Experiment-Design-Tabellen werden als dedizierte Kompon enten integriert.</em></p>' },
            { id: 'stimulus', title: 'Stimulus-Konzept', content: '<p>Der Stimulus besteht aus der visuellen und textlichen Darstellung einer Sicherheits- bzw. Unsicherheitsanzeige, die direkt nach jeder LLM-Antwort entsprechend der zugewiesenen Stimulusgruppe eingeblendet wird. Die Manipulation erfolgt in Echtzeit während der natürlichen Interaktion mit dem digitalen Assistenten (Kanton Basel-Stadt, 2025).</p>' },
            { id: 'methodik', title: 'Methodische Einordnung', content: '<p>Das vorliegende Forschungsdesign verbindet ein kontrolliertes Experiment mit einer Felderhebung im realen Nutzungskontext. Die Wahl dieser Methode orientiert sich an der Fragestellung und dem untersuchten Gegenstandsbereich (vgl. Kelle, 2008, S. 174f.).</p>' },
            { id: 'ablauf', title: 'Ablauf Experiment', content: '<p>Das geplante Experiment findet in drei Phasen statt. In der ersten Phase werden die Nutzenden über das Experiment informiert und können sich für oder gegen eine Teilnahme entscheiden. In Phase 2 steht die Interaktion mit dem Chatbot Alva im Zentrum. In Phase 3 werden die Nutzenden aufgefordert, die dazugehörige Umfrage auszufüllen und das Experiment abzuschliessen.</p>' }
        ]
    },
    {
        id: 'reflexion',
        number: '5',
        title: 'Selbstreflexion und Ausblick',
        wordCount: 450,
        content: '',
        subsections: [
            { id: 'selbstreflexion', title: 'Selbstreflexion', content: '<p>Die bisherige Arbeit an meiner Bachelor-Thesis bedeutete für mich einen grossen Wissensgewinn in einem Themenfeld, das mich seit Längerem fasziniert. Von Anfang an war mir klar, dass ich ein Experiment durchführen wollte. Die Möglichkeit, eigene Hypothesen empirisch zu prüfen, reizte mich besonders. Dabei konnte ich meinen Interessen folgen: Künstliche Intelligenz, Mensch-Maschine-Interaktion und die psychologischen Faktoren, die unsere Wahrnehmung von Technologie beeinflussen.</p><p>Das Ausarbeiten des Forschungsdesigns war eine spannende Erfahrung. Zum ersten Mal hatte ich die Gelegenheit, ein Design so auszugestalten, wie ich es mir vorstellte. Von der Definition der Forschungsfrage über die Hypothesenbildung bis zur Operationalisierung der Konstrukte war dieser Prozess lehrreich und zeigte mir, wie viele Entscheidungen in einem scheinbar einfachen experimentellen Setup stecken.</p>' },
            { id: 'ausblick', title: 'Weiteres Vorgehen', content: '<p>Als nächster Schritt steht die Operationalisierung der Konstrukte an, welche bereits begonnen hat. Parallel dazu werden die User Stories erstellt, welche die technischen Anforderungen für die Integration des Experiments definieren. Sobald die Operationalisierung abgeschlossen ist, folgt ein Pre-Test zur Überprüfung der Stimuli und des Fragebogens. Die Erkenntnisse daraus dienen gegebenenfalls zur Anpassung der Stimuli oder zur Überarbeitung der Items.</p><p>Im Januar und Februar 2026 wird die benötigte Experiment-Logik auf der Website des Kantons Basel-Stadt implementiert. Das Experiment selbst ist für den Zeitraum von Mitte Februar bis Mitte April 2026 geplant. Im Anschluss erfolgen die Auswertung der erhobenen Daten und die Erstellung der Bachelor-Arbeit.</p>' }
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

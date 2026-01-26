# Specs: Vorstudie Content Synchronization

## Overview

This document specifies the content synchronization requirements between the **LaTeX pre-study document** (single source of truth) and the **SvelteKit web application**.

### Source of Truth
- **File**: `content/prestudy/main.tex` (with subfiles in `sections/` and `sections_required/`)
- **Target**: `webapp/src/lib/data/content.ts`

---

## Architecture Summary

### TEX Structure
```
content/prestudy/
├── main.tex                          # Main document entry
├── sections/                         # Content sections
│   ├── 01_introduction.tex
│   ├── 02_theory.tex
│   ├── 03_methodology.tex
│   ├── 04_ausgangslage.tex
│   ├── 05_machbarkeit.tex
│   ├── 06_zielsetzung.tex
│   ├── 07_working_plan.tex
│   └── ...
├── sections_required/                # University-required sections
│   ├── 01_einleitung.tex
│   ├── 02_forschungsfrage.tex
│   ├── 04_selbstreflexion.tex
│   └── ...
└── content/resources/tables/         # Shared tables
    ├── 05_milestones.tex
    ├── 06_hypothesen_ausformuliert.tex
    └── 07_glossar.tex
```

### Web App Structure
```
webapp/src/lib/data/content.ts
├── sections[]                        # Main content sections
│   ├── einleitung (Section 1)
│   ├── theory (Section 2)
│   ├── forschungsfrage (Section 3)
│   ├── methodology (Section 4)
│   └── reflexion (Section 5)
├── glossaryTerms[]                   # Glossary definitions
└── figures[]                         # Figure references
```

---

## Content Mapping & Discrepancies

### Section 1: Einleitung

| Subsection | TEX Source | Web App | Status |
|------------|------------|---------|--------|
| Main intro text | `sections/01_introduction.tex` | ✅ Present | **SYNCED** |
| Ausgangslage | `sections/04_ausgangslage.tex` | ✅ Present | **SYNCED** |
| Zielsetzung | `sections/06_zielsetzung.tex` | ✅ Present | **SYNCED** |
| Machbarkeit | `sections/05_machbarkeit.tex` | ✅ Present | **SYNCED** |
| Arbeitsplan | `sections/07_working_plan.tex` | ⚠️ Placeholder only | **NEEDS UPDATE** |

#### Arbeitsplan Discrepancy
**TEX Content** (missing in web app):
- Gantt chart visualization
- Milestones table with 6 entries:
  - Gespräch Machbarkeit intern (Juli 2025)
  - Gespräch Machbarkeit extern (Oktober 2025)
  - Entwicklung Anforderungen (Oktober 2025)
  - Schätzung benötigter Arbeiten (November 2025)
  - Kommunikation Investment extern (November 2025)
  - Übereinkunft Investment-Teilung (November 2025)

**Web App Current State**:
```
"Hinweis: Gantt-Chart Visualisierung wird in einer zukünftigen Version als dedizierte Komponente integriert."
```

---

### Section 2: Theoretische Einbettung

| Subsection | TEX Source | Web App | Status |
|------------|------------|---------|--------|
| Main intro | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| TAM | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| AI-TAM | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| Framing-Effekt | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| Attribute Framing | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| Latente Konstrukte | `sections/02_theory.tex` | ✅ Present | **SYNCED** |
| Hypothesenübersicht | `tables/06_hypothesen_ausformuliert.tex` | ⚠️ Figure only | **NEEDS UPDATE** |

#### Hypothesen Discrepancy
**TEX Content** (table with 8 hypotheses not in web app):

| ID | Hypothesis |
|----|------------|
| H1a | Die Darstellung als Sicherheit (positiver Frame) führt zu einem höheren Vertrauen in künstliche Intelligenz. |
| H1b | Die Darstellung als Unsicherheit (negativer Frame) führt zu einem niedrigeren Vertrauen in künstliche Intelligenz. |
| H2 | Vertrauen in künstliche Intelligenz hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit. |
| H3 | Vertrauen in künstliche Intelligenz hat einen positiven Einfluss auf die wahrgenommene Einfachheit in der Nutzung. |
| H4 | Die wahrgenommene Nützlichkeit hat einen positiven Einfluss auf die Nutzungsintention. |
| H5 | Die wahrgenommene Einfachheit in der Nutzung hat einen positiven Einfluss auf die Nutzungsintention. |
| H6 | Die wahrgenommene Einfachheit in der Nutzung hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit. |
| H7 | Die Nutzungsintention hat einen positiven Einfluss auf die Kollaborationsintention. |
| H8 | Die Vertrautheit mit Technologie hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit. |

**Web App Current State**: Only shows figure reference, no hypothesis table content.

---

### Section 3: Forschungsfrage

| Content | TEX Source | Web App | Status |
|---------|------------|---------|--------|
| Research question | `sections_required/02_forschungsfrage.tex` | ✅ Present | **SYNCED** |

---

### Section 4: Forschungsdesign

| Subsection | TEX Source | Web App | Status |
|------------|------------|---------|--------|
| Main intro | `sections/03_methodology.tex` | ✅ Present | **SYNCED** |
| Design | `sections/03_methodology.tex` | ✅ Present | **SYNCED** |
| Stimulus-Konzept | `sections/03_methodology.tex` | ✅ Present | **SYNCED** |
| Methodische Einordnung | `sections/03_methodology.tex` | ✅ Present | **SYNCED** |
| Ablauf Experiment | `sections/03_methodology.tex` | ✅ Present | **SYNCED** |

---

### Section 5: Selbstreflexion und Ausblick

| Subsection | TEX Source | Web App | Status |
|------------|------------|---------|--------|
| Selbstreflexion | `sections_required/04_selbstreflexion.tex` | ⚠️ Partial | **NEEDS UPDATE** |
| Weiteres Vorgehen | `sections_required/04_selbstreflexion.tex` | ✅ Present | **SYNCED** |

#### Selbstreflexion Discrepancy
**TEX Content** (2 paragraphs missing in web app):

1. **Paragraph 3** (missing):
> "Besonders zufrieden bin ich mit meinem Betreuungssetup. Mein Dozent erweist sich als wertvoller Sparringpartner, dessen Erfahrung mir half, mein Design zu schärfen und methodische Fallstricke zu vermeiden. Auf Seiten des Praxispartners darf ich mit einer äusserst versierten Ansprechpartnerin zusammenarbeiten, die das Projekt von Beginn an unterstützte und die nötigen Rahmenbedingungen schuf."

2. **Paragraph 4** (missing):
> "Was mich besonders freut: Das Experiment wird in einer realen Umgebung durchgeführt. Anstatt einer simulierten Trockenübung können echte Nutzende des KI-Assistenten Alva an der Studie teilnehmen. Dies erhöht nicht nur die externe Validität der Ergebnisse, sondern gibt der Arbeit auch eine praktische Relevanz, die über den akademischen Kontext hinausgeht."

---

## Glossary Comparison

### TEX Glossary (15 terms)
| Abkürzung | Begriff Englisch | Begriff Deutsch |
|-----------|------------------|-----------------|
| LLM | Large Language Model | Grosses Sprachmodell |
| KI | Artificial Intelligence (AI) | Künstliche Intelligenz |
| TAM | Technology Acceptance Model | Technologieakzeptanzmodell |
| AI-TAM | AI Technology Acceptance Model | KI-Technologieakzeptanzmodell |
| XAIT | Explainable AI Trust | Erklärbares KI-Vertrauen |
| XAI | Explainable Artificial Intelligence | Erklärbare Künstliche Intelligenz |
| PUF | Perceived Usefulness | Wahrgenommene Nützlichkeit |
| EOU | Ease of Use | Einfachheit der Nutzung |
| BI | Behavioral Intention | Verhaltensintention |
| CI | Collaborative Intention | Kollaborationsintention |
| FAM-TEC | Familiarity with Technology | Vertrautheit mit Technologie |
| CLT | Construal Level Theory | Konstruktebenen-Theorie |
| SEM | Structural Equation Model | Strukturgleichungsmodell |
| UV | Independent Variable | Unabhängige Variable |
| N | Sample Size | Stichprobengrösse |

### Web App Glossary (11 terms)
| Term | Definition |
|------|------------|
| TAM | Technology Acceptance Model - Modell zur Erklärung der Nutzerakzeptanz von Technologien |
| AI-TAM | Artificial Intelligence Technology Acceptance Model - Erweitertes TAM für KI-Systeme |
| Framing | Art der Präsentation von Information, die die Wahrnehmung beeinflusst |
| Attribute Framing | Darstellung eines Attributs in positiver oder negativer Weise |
| LLM | Large Language Model - Grosses Sprachmodell |
| PEOU | Perceived Ease of Use - Wahrgenommene Benutzerfreundlichkeit |
| PU | Perceived Usefulness - Wahrgenommene Nützlichkeit |
| BI | Behavioral Intention - Verhaltensabsicht |
| CI | Collaborative Intention - Kooperationsabsicht |
| XAIT | Explainable AI Trust - Vertrauen durch erklärbare KI |
| Konfidenz | Grad der Sicherheit/Unsicherheit einer KI-Antwort |

### Glossary Discrepancies

#### Missing in Web App (7 terms):
- **KI** - Künstliche Intelligenz
- **XAI** - Explainable Artificial Intelligence
- **FAM-TEC** - Familiarity with Technology
- **CLT** - Construal Level Theory
- **SEM** - Structural Equation Model
- **UV** - Unabhängige Variable
- **N** - Stichprobengrösse

#### Only in Web App (2 terms):
- **Framing** - General framing definition
- **Konfidenz** - Confidence definition

#### Naming Differences:
| TEX | Web App | Note |
|-----|---------|------|
| PUF | PU | Different abbreviation |
| EOU | PEOU | Different abbreviation |

---

## Summary of Required Changes

### Priority 1: Content Additions
1. **Selbstreflexion**: Add 2 missing paragraphs about supervision setup and real-world experiment
2. **Hypothesen**: Add hypothesis table content (H1a-H8) to Theory section

### Priority 2: Feature Additions
3. **Arbeitsplan**: Implement milestones table component or add milestone data

### Priority 3: Glossary Sync
4. **Glossary**: Add 7 missing terms from TEX
5. **Glossary**: Harmonize abbreviation naming (PUF/PU, EOU/PEOU)

---

## File References

### Source Files (TEX)
- `content/prestudy/sections_required/04_selbstreflexion.tex` - Selbstreflexion section
- `content/resources/tables/06_hypothesen_ausformuliert.tex` - Hypothesis table
- `content/resources/tables/05_milestones.tex` - Milestones table
- `content/resources/tables/07_glossar.tex` - Glossary table

### Target File (Web App)
- `webapp/src/lib/data/content.ts` - Main content data file

---

## Notes

- The web app uses HTML formatting within content strings
- Figures are referenced via `/images/` path in the web app
- The TEX document uses APA7 citation style which is not rendered in web app (citations shown as inline references)

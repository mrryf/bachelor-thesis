# Implementation Plan: Vorstudie Content Synchronization

## Overview

This plan details the implementation steps to synchronize content from the LaTeX pre-study document to the SvelteKit web application, based on the discrepancies identified in `specs.md`.

**Target File:** `webapp/src/lib/data/content.ts`

---

## Phase 1: Content Additions (Priority 1)

### Task 1.1: Update Selbstreflexion Section

**Location:** `sections[4].subsections[0]` (Section 5, Selbstreflexion subsection)

**Current State:**
```typescript
content: '<p>Die bisherige Arbeit an meiner Bachelor-Thesis bedeutete für mich einen grossen Wissensgewinn...</p><p>Das Ausarbeiten des Forschungsdesigns war eine spannende Erfahrung...</p>'
```

**Required Change:** Add 2 missing paragraphs after the existing 2 paragraphs.

**New Paragraphs to Add:**

```html
<p>Besonders zufrieden bin ich mit meinem Betreuungssetup. Mein Dozent erweist sich als wertvoller Sparringpartner, dessen Erfahrung mir half, mein Design zu schärfen und methodische Fallstricke zu vermeiden. Auf Seiten des Praxispartners darf ich mit einer äusserst versierten Ansprechpartnerin zusammenarbeiten, die das Projekt von Beginn an unterstützte und die nötigen Rahmenbedingungen schuf.</p>

<p>Was mich besonders freut: Das Experiment wird in einer realen Umgebung durchgeführt. Anstatt einer simulierten Trockenübung können echte Nutzende des KI-Assistenten Alva an der Studie teilnehmen. Dies erhöht nicht nur die externe Validität der Ergebnisse, sondern gibt der Arbeit auch eine praktische Relevanz, die über den akademischen Kontext hinausgeht.</p>
```

**Source:** `content/prestudy/sections_required/04_selbstreflexion.tex` (lines 17-19)

---

### Task 1.2: Add Hypothesis Table to Theory Section

**Location:** `sections[1].subsections[5]` (Section 2, Hypothesenübersicht subsection)

**Current State:**
```typescript
content: '<p>Das folgende Hypothesenmodell zeigt die Pfadbeziehungen zwischen den Konstrukten des AI-TAM.</p>'
```

**Required Change:** Add hypothesis table after the introductory paragraph.

**Content to Add:**

```html
<div class="hypothesis-table my-6">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b">
        <th class="text-left py-2 pr-4">Bereich</th>
        <th class="text-left py-2 pr-4">Nr.</th>
        <th class="text-left py-2">Hypothese</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b"><td colspan="3" class="py-2 font-semibold">Framing-Hypothesen</td></tr>
      <tr class="border-b">
        <td class="py-2 pr-4">Framing</td>
        <td class="py-2 pr-4">H1a</td>
        <td class="py-2">Die Darstellung als Sicherheit (positiver Frame) führt zu einem höheren Vertrauen in künstliche Intelligenz.</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H1b</td>
        <td class="py-2">Die Darstellung als Unsicherheit (negativer Frame) führt zu einem niedrigeren Vertrauen in künstliche Intelligenz.</td>
      </tr>
      <tr class="border-b"><td colspan="3" class="py-2 font-semibold">AI-TAM-Hypothesen</td></tr>
      <tr class="border-b">
        <td class="py-2 pr-4">AI-TAM</td>
        <td class="py-2 pr-4">H2</td>
        <td class="py-2">Vertrauen in künstliche Intelligenz hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit.</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H3</td>
        <td class="py-2">Vertrauen in künstliche Intelligenz hat einen positiven Einfluss auf die wahrgenommene Einfachheit in der Nutzung.</td>
      </tr>
      <tr class="border-b"><td colspan="3" class="py-2 font-semibold">TAM-Hypothesen</td></tr>
      <tr class="border-b">
        <td class="py-2 pr-4">TAM</td>
        <td class="py-2 pr-4">H4</td>
        <td class="py-2">Die wahrgenommene Nützlichkeit hat einen positiven Einfluss auf die Nutzungsintention.</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H5</td>
        <td class="py-2">Die wahrgenommene Einfachheit in der Nutzung hat einen positiven Einfluss auf die Nutzungsintention.</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H6</td>
        <td class="py-2">Die wahrgenommene Einfachheit in der Nutzung hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit.</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H7</td>
        <td class="py-2">Die Nutzungsintention hat einen positiven Einfluss auf die Kollaborationsintention.</td>
      </tr>
      <tr>
        <td class="py-2 pr-4"></td>
        <td class="py-2 pr-4">H8</td>
        <td class="py-2">Die Vertrautheit mit Technologie hat einen positiven Einfluss auf die wahrgenommene Nützlichkeit.</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Source:** `content/resources/tables/06_hypothesen_ausformuliert.tex`

---

## Phase 2: Feature Additions (Priority 2)

### Task 2.1: Add Milestones Table to Arbeitsplan Section

**Location:** `sections[0].subsections[3]` (Section 1, Arbeitsplan subsection)

**Current State:**
```typescript
content: `
    <p>Der folgende Arbeitsplan zeigt die zeitliche Planung der Vorstudie.</p>
    <p><em>Hinweis: Gantt-Chart Visualisierung wird in einer zukünftigen Version als dedizierte Komponente integriert.</em></p>
`
```

**Required Change:** Replace placeholder with milestones table.

**New Content:**

```html
<p>Der folgende Arbeitsplan zeigt die zeitliche Planung der Vorstudie.</p>
<div class="milestones-table my-6">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b">
        <th class="text-left py-2 pr-4">Meilenstein</th>
        <th class="text-left py-2 pr-4">Zeitraum</th>
        <th class="text-left py-2">Beteiligte</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b">
        <td class="py-2 pr-4">Gespräch Machbarkeit intern</td>
        <td class="py-2 pr-4">Juli 2025</td>
        <td class="py-2">Liip</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4">Gespräch Machbarkeit extern</td>
        <td class="py-2 pr-4">Oktober 2025</td>
        <td class="py-2">Kanton Basel-Stadt</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4">Entwicklung Anforderungen (Logik & Userflow)</td>
        <td class="py-2 pr-4">Oktober 2025</td>
        <td class="py-2">Studierender</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4">Schätzung benötigter Arbeiten</td>
        <td class="py-2 pr-4">November 2025</td>
        <td class="py-2">Product Owner, Frontend Developer</td>
      </tr>
      <tr class="border-b">
        <td class="py-2 pr-4">Kommunikation Investment extern</td>
        <td class="py-2 pr-4">November 2025</td>
        <td class="py-2">Kanton Basel-Stadt</td>
      </tr>
      <tr>
        <td class="py-2 pr-4">Übereinkunft Investment-Teilung</td>
        <td class="py-2 pr-4">November 2025</td>
        <td class="py-2">Liip, Kanton Basel-Stadt</td>
      </tr>
    </tbody>
  </table>
</div>
```

**Source:** `content/resources/tables/05_milestones.tex`

---

## Phase 3: Glossary Synchronization (Priority 3)

### Task 3.1: Add Missing Glossary Terms

**Location:** `glossaryTerms` array

**Terms to Add (7 new entries):**

```typescript
{ term: 'KI', definition: 'Künstliche Intelligenz - Artificial Intelligence (AI)' },
{ term: 'XAI', definition: 'Explainable Artificial Intelligence - Erklärbare Künstliche Intelligenz' },
{ term: 'FAM-TEC', definition: 'Familiarity with Technology - Vertrautheit mit Technologie' },
{ term: 'CLT', definition: 'Construal Level Theory - Konstruktebenen-Theorie' },
{ term: 'SEM', definition: 'Structural Equation Model - Strukturgleichungsmodell' },
{ term: 'UV', definition: 'Unabhängige Variable - Independent Variable' },
{ term: 'N', definition: 'Sample Size - Stichprobengrösse' },
```

**Source:** `content/resources/tables/07_glossar.tex`

---

### Task 3.2: Harmonize Abbreviation Naming

**Decision Required:** The TEX source uses different abbreviations than the web app:

| TEX | Web App | Recommendation |
|-----|---------|----------------|
| PUF (Perceived Usefulness) | PU | Keep **PU** (more common in literature) |
| EOU (Ease of Use) | PEOU | Keep **PEOU** (more common in literature) |

**Action:** No change needed - the web app already uses the more commonly accepted abbreviations (PU and PEOU). The TEX glossary reflects internal notation, while the web app follows standard TAM literature conventions.

---

## Implementation Checklist

### Phase 1: Content Additions
- [ ] **Task 1.1:** Add 2 paragraphs to Selbstreflexion content
- [ ] **Task 1.2:** Add hypothesis table HTML to Hypothesenübersicht content

### Phase 2: Feature Additions
- [ ] **Task 2.1:** Replace Arbeitsplan placeholder with milestones table

### Phase 3: Glossary Sync
- [ ] **Task 3.1:** Add 7 missing glossary terms
- [ ] **Task 3.2:** Review and confirm abbreviation naming (no change needed)

### Post-Implementation
- [ ] Update `wordCount` values if significantly changed
- [ ] Test rendering in web app
- [ ] Verify table styling matches existing design system

---

## File Changes Summary

| File | Changes |
|------|---------|
| `webapp/src/lib/data/content.ts` | Modify sections array (3 edits) + glossaryTerms array (7 additions) |

---

## Notes

- All HTML content should use Tailwind CSS classes consistent with existing styling
- Tables should be responsive and readable on mobile devices
- The `&` character in "Logik & Userflow" needs to be properly escaped or rendered in HTML

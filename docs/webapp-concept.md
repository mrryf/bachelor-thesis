# Thesis Web Application - Concept Document

## Project Overview

**Title:** Trust in Artificial Intelligence - How Framing Influences Trust in LLM-based Applications

**Purpose:** Create an interactive web application to present the prestudy research on how confidence value framing (positive vs. negative) affects user trust in AI assistants, using the AI-TAM (Artificial Intelligence Technology Acceptance Model) framework.

**Target Audience:** 
- Academic reviewers and thesis evaluators
- Research community interested in AI trust and technology acceptance
- Practitioners in UX/AI design
- General audience interested in AI psychology

---

## 1. Technical Architecture & Stack

### Recommended Approach: **Single Page Application (SPA)**

Given the content is primarily educational/presentational with interactive elements, a modern SPA is ideal.

### Tech Stack

#### Core Technologies
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript (ES6+)** - Interactive components, no framework overhead needed

#### Optional Enhancements
- **Chart.js / D3.js** - For data visualizations (AI-TAM model, hypothesis diagrams)
- **AOS (Animate On Scroll)** - Smooth scroll animations
- **Prism.js** - Code syntax highlighting if needed
- **MathJax** - LaTeX formula rendering

#### Build Tools (Optional for Production)
- **Vite** - Fast development server and bundling
- **PostCSS** - CSS processing and optimization

### Architecture Pattern

```
webapp/
├── index.html              # Main entry point
├── assets/
│   ├── css/
│   │   ├── main.css        # Core styles
│   │   ├── components.css  # Reusable components
│   │   └── themes.css      # Color schemes, dark mode
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── navigation.js   # Routing/navigation
│   │   ├── visualizations.js # Charts and diagrams
│   │   └── interactions.js # Interactive experiments
│   ├── images/             # Figures from thesis
│   └── data/
│       └── content.json    # Structured content data
└── components/
    ├── hero.html           # Landing section
    ├── theory.html         # Theoretical framework
    ├── methodology.html    # Research design
    └── experiment.html     # Interactive experiment demo
```

### Data Flow

1. **Content Source:** LaTeX files → Structured JSON
2. **Rendering:** JavaScript dynamically loads and renders content
3. **Interactivity:** Event-driven updates to DOM
4. **State Management:** Simple object-based state (no Redux needed)

---

## 2. UX Considerations

### Design Principles

#### 1. **Progressive Disclosure**
- Start with high-level overview
- Allow users to dive deeper into sections
- Collapsible sections for detailed content
- "Read More" patterns for lengthy theoretical sections

#### 2. **Narrative Flow**
Follow the thesis structure as a story:
```
Introduction → Problem → Theory → Methodology → Experiment → Findings → Reflection
```

#### 3. **Visual Hierarchy**
- **Primary:** Key findings, main hypotheses
- **Secondary:** Supporting theory, methodology details
- **Tertiary:** References, footnotes, technical details

#### 4. **Accessibility**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- High contrast mode option
- Responsive text sizing

#### 5. **Engagement Patterns**
- **Interactive Experiment Demo:** Let users experience the framing effect
- **Model Visualization:** Interactive AI-TAM model diagram
- **Hypothesis Explorer:** Click through hypotheses with visual connections
- **Timeline:** Gantt chart as interactive timeline

### User Journeys

#### Journey 1: Academic Reviewer
```
Landing → Abstract → Jump to Methodology → Review Hypotheses → Check References
```

#### Journey 2: Casual Learner
```
Landing → What is AI Trust? → See Interactive Demo → Explore Theory → Learn More
```

#### Journey 3: Researcher
```
Landing → Methodology → Experimental Design → Download Data/Materials → Citations
```

### Interaction Patterns

1. **Sticky Navigation** - Always accessible section menu
2. **Scroll Progress Indicator** - Show reading progress
3. **Smooth Scrolling** - Between sections
4. **Tooltips** - For technical terms (glossary integration)
5. **Modal Overlays** - For detailed figures and tables
6. **Lazy Loading** - Images and heavy content

---

## 3. Components

### Core Components

#### 3.1 Navigation Components

**Primary Navigation**
- Fixed header with section links
- Hamburger menu for mobile
- Progress indicator
- Dark/light mode toggle

**Secondary Navigation**
- Floating table of contents (desktop)
- "Back to top" button
- Previous/Next section buttons

#### 3.2 Content Components

**Hero Section**
```
- Title: "Trust in Artificial Intelligence"
- Subtitle: Framing effect visualization
- CTA: "Explore the Research" / "Try the Demo"
- Background: Animated gradient or AI-themed visual
```

**Section Container**
```
- Section header with icon
- Collapsible subsections
- Citation tooltips
- Figure/table integration
```

**Theory Card**
```
- Model name (e.g., "TAM", "AI-TAM")
- Visual representation
- Key constructs
- Expandable details
```

**Hypothesis Card**
```
- Hypothesis number and statement
- Visual connection to model
- Expected outcome
- Related literature
```

#### 3.3 Interactive Components

**Framing Experiment Demo**
```html
Interactive component where users:
1. See a chatbot interface (Alva simulation)
2. Ask a question
3. Receive answer with confidence indicator
4. Experience different frames (positive/negative)
5. Rate their trust level
6. See how framing affected their perception
```

**AI-TAM Model Visualizer**
```
- Interactive node diagram
- Click nodes to see construct definitions
- Highlight paths between constructs
- Show hypothesis connections
```

**Confidence Frame Comparator**
```
Side-by-side comparison:
- "Confidence: 80%" vs "Uncertainty: 20%"
- Visual styling differences
- User perception survey
```

#### 3.4 Data Visualization Components

**Gantt Chart (Timeline)**
- Interactive project timeline
- Milestone markers
- Zoom and pan functionality

**Hypothesis Network**
- Graph visualization of hypothesis relationships
- Filter by construct
- Show/hide connections

**Statistical Diagrams**
- Experimental design (3x2 factorial)
- Group allocation visualization

#### 3.5 Utility Components

**Citation Tooltip**
```
Hover over citation → Show:
- Author, Year
- Title
- Quick preview
- Link to full reference
```

**Glossary Popup**
```
Click term → Modal with:
- Definition
- Related concepts
- Usage in context
```

**Figure Lightbox**
```
Click figure → Full-screen view with:
- High-resolution image
- Caption
- Download option
- Navigation between figures
```

**Download Center**
```
- PDF version of prestudy
- Supplementary materials
- Data files (if applicable)
- Citation export (BibTeX, RIS)
```

---

## 4. Information Architecture

### Site Structure

```
┌─────────────────────────────────────────┐
│           LANDING / HOME                │
│  - Hero with key message                │
│  - Quick navigation cards               │
│  - Interactive demo teaser              │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    ┌───────┐  ┌────────┐  ┌──────────┐
    │ INTRO │  │ THEORY │  │ RESEARCH │
    └───────┘  └────────┘  └──────────┘
        │           │           │
        ▼           ▼           ▼
   ┌─────────────────────────────────┐
   │  1. Ausgangslage (Context)      │
   │  2. Zielsetzung (Objectives)    │
   │  3. Machbarkeit (Feasibility)   │
   │  4. Arbeitsplan (Timeline)      │
   └─────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────┐
   │  1. TAM Model                   │
   │  2. AI-TAM Extension            │
   │  3. Framing Effect              │
   │  4. Attribute Framing           │
   │  5. Hypotheses                  │
   └─────────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────┐
   │  1. Experimental Design         │
   │  2. Stimulus Concept            │
   │  3. Methodology                 │
   │  4. Experiment Flow             │
   └─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ DEMO    │ │REFLECT  │ │RESOURCES│
   │         │ │         │ │         │
   └─────────┘ └─────────┘ └─────────┘
```

### Content Hierarchy

#### Level 1: Main Sections
1. **Home** - Overview and introduction
2. **Introduction** - Context, objectives, feasibility
3. **Theory** - Theoretical framework
4. **Methodology** - Research design
5. **Interactive Demo** - Experience the experiment
6. **Reflection** - Self-reflection and outlook
7. **Resources** - References, downloads, glossary

#### Level 2: Subsections (Example: Theory)
- Technology Acceptance Model (TAM)
  - Core constructs
  - Original research
- AI-TAM Extension
  - Additional constructs
  - Model visualization
- Framing Effect
  - Prospect theory
  - Attribute framing
- Hypotheses
  - H1-H8 with visual connections

#### Level 3: Content Blocks
- Text paragraphs
- Figures with captions
- Tables
- Citations
- Definitions

### Navigation Patterns

#### Primary Navigation (Header)
```
[Logo] Home | Introduction | Theory | Methodology | Demo | Resources
                                                    [Dark Mode] [Language]
```

#### Secondary Navigation (Sidebar - Desktop)
```
Table of Contents
├─ 1. Introduction
│  ├─ 1.1 Context
│  ├─ 1.2 Objectives
│  └─ 1.3 Feasibility
├─ 2. Theory
│  ├─ 2.1 TAM
│  ├─ 2.2 AI-TAM
│  └─ 2.3 Framing
└─ 3. Methodology
   └─ ...
```

#### Mobile Navigation
- Hamburger menu
- Bottom navigation bar for key sections
- Swipe gestures between sections

### Content Organization Principles

1. **Chunking:** Break long sections into digestible subsections
2. **Labeling:** Clear, descriptive headings
3. **Consistency:** Same structure for similar content types
4. **Wayfinding:** Breadcrumbs, progress indicators, "you are here" markers
5. **Search:** Quick search functionality for terms and concepts

---

## 5. Visual Design System

### Color Palette

#### Primary Colors
```css
--primary-blue: #2563eb;      /* Trust, technology */
--primary-dark: #1e293b;      /* Text, headers */
--primary-light: #f1f5f9;     /* Backgrounds */
```

#### Semantic Colors
```css
--positive-frame: #10b981;    /* Green - confidence/certainty */
--negative-frame: #ef4444;    /* Red - uncertainty/error */
--neutral: #64748b;           /* Gray - control group */
--accent: #8b5cf6;            /* Purple - interactive elements */
```

#### Dark Mode
```css
--dark-bg: #0f172a;
--dark-surface: #1e293b;
--dark-text: #e2e8f0;
```

### Typography

```css
/* Headings */
--font-heading: 'Inter', 'Segoe UI', sans-serif;
--h1-size: 3.5rem;   /* Hero titles */
--h2-size: 2.5rem;   /* Section headers */
--h3-size: 1.75rem;  /* Subsections */

/* Body */
--font-body: 'Inter', 'Segoe UI', sans-serif;
--body-size: 1.125rem;
--line-height: 1.75;

/* Code/Technical */
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Spacing System
```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 1.5rem;   /* 24px */
--space-lg: 2.5rem;   /* 40px */
--space-xl: 4rem;     /* 64px */
```

### Component Styles

#### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: var(--space-lg);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```

#### Buttons
```css
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: scale(1.05);
}
```

---

## 6. Key Features & Functionality

### Must-Have Features (MVP)

1. **Responsive Design** - Mobile, tablet, desktop
2. **Section Navigation** - Smooth scrolling between sections
3. **Content Presentation** - All prestudy content formatted
4. **Figure Display** - All images/diagrams with captions
5. **Citation System** - Clickable references
6. **Dark Mode** - Toggle between themes

### Should-Have Features

7. **Interactive AI-TAM Model** - Clickable diagram
8. **Framing Demo** - Simple experiment simulation
9. **Glossary** - Term definitions
10. **Download Center** - PDF and materials
11. **Search** - Find content quickly
12. **Progress Tracking** - Reading progress indicator

### Nice-to-Have Features

13. **Animated Transitions** - Smooth page animations
14. **3D Visualizations** - Advanced model representations
15. **Multi-language** - German/English toggle
16. **Annotations** - User can highlight and note
17. **Share Functionality** - Share specific sections
18. **Print Optimization** - Print-friendly version

---

## 7. Content Mapping (LaTeX → Web)

### Section Mapping

| LaTeX Section | Web Section | Component Type |
|--------------|-------------|----------------|
| `01_einleitung.tex` | Introduction | Multi-subsection page |
| `02_theory.tex` | Theoretical Framework | Interactive model page |
| `03_methodology.tex` | Research Design | Diagram-heavy page |
| `02_forschungsfrage.tex` | Research Question | Highlight card |
| `04_selbstreflexion.tex` | Reflection | Text page |
| Figures | Gallery + Lightbox | Image component |
| Tables | Responsive tables | Table component |
| Bibliography | References | Searchable list |

### Content Extraction Strategy

1. **Manual Extraction:** Copy key content from .tex files
2. **Structure as JSON:** Create `content.json` with structured data
3. **Asset Migration:** Move images to `/assets/images/`
4. **Citation Database:** Extract bibliography to JSON
5. **Dynamic Rendering:** JavaScript renders content from JSON

---

## 8. Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up project structure
- [ ] Create HTML skeleton
- [ ] Implement CSS design system
- [ ] Build navigation components
- [ ] Set up responsive grid

### Phase 2: Content (Week 2)
- [ ] Extract content from LaTeX
- [ ] Structure content as JSON
- [ ] Implement content rendering
- [ ] Add all figures and tables
- [ ] Implement citation system

### Phase 3: Interactivity (Week 3)
- [ ] Build AI-TAM interactive model
- [ ] Create framing experiment demo
- [ ] Add glossary functionality
- [ ] Implement search
- [ ] Add animations

### Phase 4: Polish (Week 4)
- [ ] Optimize performance
- [ ] Cross-browser testing
- [ ] Accessibility audit
- [ ] Mobile optimization
- [ ] Deploy to hosting

---

## 9. Technical Considerations

### Performance
- Lazy load images
- Minify CSS/JS
- Use CDN for libraries
- Implement service worker for offline access
- Optimize images (WebP format)

### SEO
- Semantic HTML5
- Meta tags for each section
- Open Graph tags
- Structured data (Schema.org)
- Sitemap

### Browser Support
- Modern browsers (last 2 versions)
- Progressive enhancement
- Graceful degradation for older browsers

### Hosting Options
- **GitHub Pages** - Free, simple
- **Netlify** - Free tier, CI/CD
- **Vercel** - Free tier, optimized
- **University Server** - If available

---

## 10. Next Steps

### Immediate Actions
1. **Review & Approve Concept** - Get feedback on this document
2. **Choose Tech Stack** - Vanilla JS vs. Vite build
3. **Create Wireframes** - Sketch key pages
4. **Set Up Repository** - Initialize project structure
5. **Extract First Section** - Start with introduction

### Questions to Resolve
- [ ] Should we include actual experiment functionality or just simulation?
- [ ] Language: German only, English only, or bilingual?
- [ ] Target deployment date?
- [ ] Any specific university requirements for thesis websites?
- [ ] Should we integrate with existing thesis repository?

---

## Appendix: Inspiration & References

### Design Inspiration
- **Distill.pub** - Interactive research articles
- **Observable** - Data visualization narratives
- **Stripe Docs** - Clean, modern documentation
- **Linear** - Smooth animations and interactions

### Technical References
- **Chart.js** - https://www.chartjs.org/
- **AOS** - https://michalsnik.github.io/aos/
- **Prism.js** - https://prismjs.com/
- **MathJax** - https://www.mathjax.org/

---

**Document Version:** 1.0  
**Created:** 2025-12-09  
**Author:** AI Assistant (Antigravity)  
**Status:** Draft for Review

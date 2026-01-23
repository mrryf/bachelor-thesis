# Thesis Webapp

Web presentation of the bachelor thesis prestudy on "Trust in Artificial Intelligence".

## Tech Stack

- **SvelteKit** - Static site generation
- **Svelte 5** - Reactive components with runes
- **TailwindCSS** - Utility-first styling with typography plugin
- **TypeScript** - Type safety
- **shadcn-svelte** - UI component library (bits-ui based)
- **Vitest** - Unit and component testing
- **Lucide Icons** - Icon library

## Project Structure

```
webapp/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout with navigation
│   │   ├── +page.svelte         # Homepage
│   │   ├── vorstudie/           # Pre-study content pages
│   │   ├── bachelorarbeit/      # Bachelor thesis pages
│   │   ├── downloads/           # Downloadable resources
│   │   └── glossar/             # Glossary page
│   ├── lib/
│   │   ├── components/          # Custom components
│   │   │   ├── ui/              # shadcn UI components
│   │   │   ├── Navigation.svelte
│   │   │   ├── HypothesisDiagram.svelte
│   │   │   ├── CitationHelper.svelte
│   │   │   ├── GlossaryTerm.svelte
│   │   │   ├── Lightbox.svelte
│   │   │   └── ...
│   │   ├── actions/             # Svelte actions
│   │   │   ├── enhanceCitations.ts
│   │   │   └── enhanceGlossaryTerms.ts
│   │   ├── data/
│   │   │   ├── content.ts       # Thesis content from LaTeX
│   │   │   └── references.json  # Zotero bibliography
│   │   ├── stores/              # Svelte stores
│   │   └── utils/               # Utility functions
│   ├── app.css                  # Global styles + Tailwind
│   └── app.html                 # HTML template
├── static/images/               # Thesis images
├── tailwind.config.js           # Tailwind configuration
├── svelte.config.js             # SvelteKit config (static adapter)
└── package.json
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Features

### Content System
- Full thesis content extracted from LaTeX source
- Structured sections with metadata
- Tables support with responsive design
- Figure components with lightbox functionality

### Interactive Elements
- **Citations**: Hover tooltips showing full references from Zotero
- **Glossary**: Automatic term highlighting with definitions
- **Hypothesis Diagram**: Interactive visualization of research hypotheses
- **Reading Progress**: Progress indicator showing scroll position

### Navigation
- Multi-page architecture (Vorstudie, Bachelorarbeit, Downloads, Glossar)
- Section navigation with breadcrumbs
- Responsive design for mobile and desktop

### UI Components (shadcn-svelte)
- Breadcrumb, Button, Card, Input, Separator
- Callout, Progress, Sheet, Toast, Tooltip

## Configuration

### Tailwind Colors

Custom colors defined in `tailwind.config.js`:
- `positive` - #10b981 (green for positive framing)
- `negative` - #ef4444 (red for negative framing)
- `neutral` - #64748b (gray for control)

All shadcn-svelte theme colors are configured for dark mode support.

## Current Status

✅ Project setup complete
✅ TailwindCSS configured with typography
✅ Content extracted from LaTeX
✅ shadcn-svelte components integrated
✅ Citation system with Zotero references
✅ Glossary with term tooltips
✅ Interactive hypothesis visualization
✅ Multi-page navigation
✅ Unit tests with Vitest
✅ Image lightbox component
✅ Reading progress indicator

# Thesis Webapp

Web presentation of the bachelor thesis prestudy on "Trust in Artificial Intelligence".

## Tech Stack

- **SvelteKit** - Static site generation
- **Svelte 5** - Reactive components
- **TailwindCSS** - Utility-first styling (fully configurable)
- **TypeScript** - Type safety
- **shadcn-svelte** - UI components (to be added)

## Project Structure

```
webapp/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout
│   │   └── +page.svelte         # Main page
│   ├── lib/
│   │   ├── components/ui/       # shadcn components (to be added)
│   │   ├── data/content.ts      # Content structure
│   │   └── utils/cn.ts          # Tailwind utilities
│   ├── app.css                  # Global styles + Tailwind
│   └── app.html                 # HTML template
├── static/images/               # Thesis images (5 files)
├── tailwind.config.js           # Tailwind configuration
├── svelte.config.js             # SvelteKit config
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
```

## Next Steps

1. Extract content from LaTeX files to `src/lib/data/content.ts`
2. Create Svelte components:
   - `Section.svelte` - Content sections
   - `Figure.svelte` - Images with captions
   - `Table.svelte` - Data tables
   - `Navigation.svelte` - Table of contents
3. Add shadcn-svelte components (Card, Dialog, etc.)
4. Implement dark mode toggle
5. Add responsive navigation

## Configuration

### Tailwind Colors

Custom colors defined in `tailwind.config.js`:
- `positive` - #10b981 (green for positive framing)
- `negative` - #ef4444 (red for negative framing)
- `neutral` - #64748b (gray for control)

All shadcn-svelte theme colors are also configured for dark mode support.

## Current Status

✅ Project setup complete
✅ TailwindCSS configured
✅ Images copied from prestudy
✅ Basic layout and page structure
✅ TypeScript configuration
⏳ Content extraction from LaTeX
⏳ Component development
⏳ shadcn-svelte integration

# Bachelor Thesis: Trust in Artificial Intelligence

![Build Status](https://github.com/mrryf/bachelor-thesis/actions/workflows/latex-build.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.x-blue.svg)
![LaTeX](https://img.shields.io/badge/latex-TeX%20Live-green.svg)

Research project investigating the impact of accuracy framing on user trust in AI systems using the AI-TAM model. Contains LaTeX documents, a SvelteKit web presentation, and comprehensive build tooling.

## Quick Start

```bash
git clone https://github.com/mrryf/bachelor-thesis.git
cd bachelor-thesis
make install    # Install dependencies
make build      # Build prestudy PDF
make test       # Run all tests
```

Output: `content/prestudy/main.pdf`

## Project Components

### LaTeX Documents (`content/`)
- **Prestudy** (`content/prestudy/`): Complete Vorstudie document
- **Thesis** (`content/thesis/`): Main bachelor thesis (in progress)
- Modular structure using `subfiles` package
- Automated bibliography via Zotero API

### SvelteKit Webapp (`webapp/`)
- Interactive web presentation of the research
- Built with SvelteKit, Svelte 5, TypeScript, TailwindCSS
- Features: dark mode, responsive design, glossary, diagrams
- Deployed to Netlify

### Documentation (`docs/`)
- MkDocs-powered documentation site
- Deployed to GitHub Pages

## Tech Stack

| Component | Technologies |
|-----------|-------------|
| LaTeX | APA7 class, BibTeX, latexmk |
| Webapp | SvelteKit, Svelte 5, TypeScript, TailwindCSS, shadcn-svelte |
| Testing | Python unittest (LaTeX), Vitest (webapp) |
| CI/CD | GitHub Actions, Netlify, GitHub Pages |

## Prerequisites

**LaTeX**: MacTeX (macOS), TeX Live (Linux), or MiKTeX (Windows)
```bash
brew install --cask mactex  # macOS
```

**Development**: Python 3.x, Node.js 20+, Make

## Installation

```bash
make install  # Installs Python and npm dependencies
```

Or manually:
```bash
pip install -r requirements-dev.txt
cd webapp && npm install
```

## Usage

Run `make help` to see all available commands.

### Building Documents

```bash
make build          # Build prestudy PDF
make build-all      # Build prestudy + thesis
./scripts/build.sh --prestudy  # Direct script usage
```

### Webapp Development

```bash
cd webapp
npm run dev         # Start dev server
npm run build       # Production build
npm run preview     # Preview production build
```

### Bibliography

```bash
make sync-zotero    # Sync references from Zotero
```

Requires `ZOTERO_API_KEY` and `ZOTERO_USER_ID` environment variables. A pre-generated `bibliography.bib` is included as fallback.

## Testing

```bash
make test           # Run all tests
make lint           # Python linting (Ruff)
make ci             # Full CI pipeline locally
```

**Test suites** (6 modules in `tests/`):
- `test_structure.py` - LaTeX structure validation
- `test_citations.py` - Citation-bibliography matching
- `test_formal_guidelines.py` - Required sections check
- `test_formatting_rules.py` - Formatting validation
- `test_bibliography_counts.py` - Bibliography integrity
- `test_items_csv.py` - Survey data validation

**Webapp tests**:
```bash
cd webapp && npm test
```

## CI/CD

GitHub Actions workflows:
- **latex-build.yml**: Lint, test, compile PDFs, release artifacts
- **ci.yml**: Webapp tests, build, coverage
- **docs.yml**: Deploy documentation to GitHub Pages
- **dependency-review.yml**: Security scanning

## Project Structure

```
bachelor-thesis/
├── content/
│   ├── prestudy/           # Prestudy LaTeX source
│   │   ├── main.tex
│   │   └── sections/
│   ├── thesis/             # Thesis LaTeX source
│   └── resources/
│       ├── bibliography.bib
│       ├── images/
│       └── data/           # Survey data (CSV)
├── webapp/                 # SvelteKit application
├── docs/                   # MkDocs documentation
├── scripts/                # Build utilities
│   ├── build.sh
│   ├── sync_zotero.py
│   └── generate_item_tables.py
├── tests/                  # Test suites
├── .github/workflows/      # CI/CD configuration
├── Makefile
└── mkdocs.yml
```

## Deployment

| Component | Platform | Trigger |
|-----------|----------|---------|
| PDF | GitHub Releases | Push to main |
| Webapp | Netlify | Push to main |
| Docs | GitHub Pages | Manual deploy |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Ensure tests pass (`make test`)
4. Open a Pull Request

See [`docs/contributing.md`](docs/contributing.md) for details.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

Academic research project. All content subject to academic integrity policies.

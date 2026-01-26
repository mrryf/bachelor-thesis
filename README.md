# Bachelor Thesis: Trust in Artificial Intelligence

![Build Status](https://github.com/mrryf/bachelor-thesis/actions/workflows/latex-build.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.x-blue.svg)
![LaTeX](https://img.shields.io/badge/latex-TeX%20Live-green.svg)

This repository contains the complete research project for the Bachelor Thesis on **"Trust in Artificial Intelligence"** (Vertrauen in Künstliche Intelligenz), investigating the impact of accuracy framing on user trust in AI systems using the AI-TAM model. It includes LaTeX source code, automated build tooling, comprehensive testing infrastructure, and a SvelteKit web presentation.

## Table of Contents
- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Building LaTeX Documents](#building-latex-documents)
  - [Webapp Development](#webapp-development)
  - [Bibliography Management](#bibliography-management)
- [Testing & Verification](#testing--verification)
- [Documentation](#documentation)
- [PageIndex MCP Integration](#pageindex-mcp-integration)
- [Continuous Integration](#continuous-integration-ci)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Quick Start

Get up and running in seconds:

```bash
# 1. Clone the repo
git clone https://github.com/mrryf/bachelor-thesis.git
cd bachelor-thesis

# 2. Install dependencies
make install

# 3. Build the Prestudy PDF
make build

# 4. Run all tests
make test
```

The compiled PDF will be available at `content/prestudy/main.pdf`.

## Project Overview

This is a comprehensive academic research project with three major components:

### 1. **LaTeX Thesis Documents** 📄
- **Prestudy (`content/prestudy/`)**: Contains the complete Vorstudie document
- **Thesis (`content/thesis/`)**: Reserved for the main bachelor thesis work
- Modular structure using the `subfiles` package
- Automated bibliography management via Zotero API
- Survey item table generation from CSV data

### 2. **SvelteKit Web Application** 🌐
- Interactive web presentation of the research (`webapp/`)
- Built with SvelteKit, Svelte 5, and TailwindCSS
- Contains full thesis content with enhanced navigation
- Deployed automatically to Netlify
- Features: dark mode, responsive design, glossary, interactive diagrams

### 3. **Documentation Site** 📚
- Comprehensive MkDocs-powered documentation (`docs/`)
- API reference for all scripts and tests
- Build system guides and troubleshooting
- CI/CD workflow documentation
- Deployed to GitHub Pages

### Key Features
- **Automated Build System**: Makefile interface, shell scripts, and GitHub Actions
- **Quality Assurance**: 6 different test suites ensuring document integrity
- **Continuous Integration**: Automated builds, tests, and deployments
- **Bibliography Management**: Integrated with Zotero for automated reference updates
- **Survey Data Processing**: Automated LaTeX table generation from CSV
- **PageIndex MCP Integration**: Semantic search across thesis and research papers via Claude Code

## Tech Stack

### LaTeX Documents
- **Language**: LaTeX (APA7 class)
- **Build System**: `latexmk`, Docker (CI)
- **Bibliography**: BibTeX, Zotero API

### Webapp
- **Framework**: SvelteKit (static site generation)
- **UI**: Svelte 5, TailwindCSS, shadcn-svelte
- **Language**: TypeScript
- **Deployment**: Netlify

### Build & Testing
- **Language**: Python 3.x, Bash
- **Testing**: `unittest` (Python)
- **Linting**: Ruff
- **Documentation**: MkDocs with Material theme
- **CI/CD**: GitHub Actions

## Prerequisites

### For LaTeX Build
- **macOS**: [MacTeX](https://www.tug.org/mactex/)
  ```bash
  brew install --cask mactex
  ```
- **Linux/Windows**: TeX Live or MiKTeX

### For Development
- **Python 3.x** with pip
- **Node.js 20+** and npm (for webapp)
- **Make** (usually pre-installed)

```bash
# Install Python dependencies
pip install -r requirements-dev.txt

# Install webapp dependencies
cd webapp && npm install
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mrryf/bachelor-thesis.git
    cd bachelor-thesis
    ```

2.  **Install all dependencies:**
    ```bash
    make install
    ```

## Usage

The project uses a **Makefile** for common tasks. Run `make help` to see all available commands.

### Building LaTeX Documents

**Build Prestudy PDF:**
```bash
make build
```

**Build all documents (prestudy + thesis):**
```bash
make build-all
```

**Using build script directly:**
```bash
./scripts/build.sh --prestudy
./scripts/build.sh --thesis
./scripts/build.sh --all
```

**Manual build:**
```bash
cd content/prestudy
latexmk -pdf main.tex
```

### Webapp Development

**Start development server:**
```bash
cd webapp
npm run dev
```

**Build for production:**
```bash
cd webapp
npm run build
npm run preview  # Preview production build
```

See [`webapp/README.md`](webapp/README.md) for detailed webapp documentation.

### Bibliography Management

Sync the latest references from Zotero:

```bash
make sync-zotero
```

Or manually:
```bash
export ZOTERO_API_KEY="your_api_key"
export ZOTERO_USER_ID="your_user_id"
python scripts/sync_zotero.py
```

> **Note:** A pre-generated `bibliography.bib` is included if you don't have Zotero access.

### Generate Survey Item Tables

```bash
make generate-tables
```

## Testing & Verification

**Run all tests:**
```bash
make test
```

**Run specific tests (6 test suites):**
```bash
python tests/test_structure.py         # LaTeX structure validation
python tests/test_citations.py         # Citation-bibliography matching
python tests/test_formal_guidelines.py # Required sections check
python tests/test_formatting_rules.py  # Formatting validation
python tests/test_bibliography_counts.py # Bibliography integrity
python tests/test_items_csv.py         # Survey data validation
```

**Verify document lists:**
```bash
python scripts/check_toc.py content/prestudy
```

**Check for unused citations:**
```bash
python scripts/check_unused_citations.py
```

**Sanitize bibliography file:**
```bash
python scripts/sanitize_bib.py
```

**Run linting:**
```bash
make lint
```

**Run full CI pipeline locally:**
```bash
make ci
```

## Documentation

Comprehensive documentation is available in multiple formats:

### MkDocs Documentation Site
Build and serve locally:
```bash
make docs
```

Build for deployment:
```bash
make docs-build
```

Visit the [documentation site](https://mrryf.github.io/bachelor-thesis/) for:
- Installation and setup guides
- Build system documentation
- API reference for scripts and tests
- CI/CD workflow details
- Troubleshooting guides

### Additional Documentation
- **Webapp Design**: [`docs/webapp-concept.md`](docs/webapp-concept.md)
- **Configuration**: [`docs/configuration.md`](docs/configuration.md)
- **Troubleshooting**: [`docs/troubleshooting.md`](docs/troubleshooting.md)
- **Contributing**: [`docs/contributing.md`](docs/contributing.md)

## PageIndex MCP Integration

This project integrates with [PageIndex](https://pageindex.io) via the Model Context Protocol (MCP) to enable semantic search and retrieval across thesis documents and research papers directly from Claude Code.

### Overview

PageIndex processes and indexes PDF documents, allowing Claude to query specific pages, retrieve document structures, and perform cross-document synthesis without manually reading files. This is particularly useful for:

- Quickly locating specific sections in the thesis or prestudy
- Cross-referencing research papers during writing
- Finding relevant citations across the indexed library

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code CLI                       │
├─────────────────────────────────────────────────────────┤
│  MCP Transport (stdio)                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │               PageIndex MCP                      │    │
│  │  - process_document()   - get_page_content()    │    │
│  │  - find_relevant_documents()                    │    │
│  │  - get_document_structure()                     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   PageIndex Cloud                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Prestudy  │  │  Research  │  │   Thesis   │        │
│  │  main.pdf  │  │   Papers   │  │  (future)  │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Setup

**Prerequisites:**
- A PageIndex account and API key (sign up at [pageindex.io](https://pageindex.io))
- Claude Code CLI installed

**Installation:**

```bash
# Add PageIndex MCP to Claude Code
claude mcp add --transport stdio pageindex -- npx -y @pageindex/mcp

# Verify connection
claude mcp list
```

> **Note:** A PageIndex API key is required to use this integration. The key is configured during the MCP setup process.

### Indexed Documents

| Category | Documents | Description |
|----------|-----------|-------------|
| Prestudy | 1 document (31 pages) | Current prestudy work |
| Research Papers | 63 documents (~2,800 pages) | TAM/AI-TAM, Framing, Trust in AI, Methodology |
| Thesis | TBD | Future thesis work |

### Usage

```bash
# In Claude Code, query documents using PageIndex tools:

# Find papers by topic
find_relevant_documents(limit: 10)

# Get specific pages (most efficient)
get_page_content("main.pdf", pages: "13-14")

# Get document structure (use sparingly - higher token cost)
get_document_structure("main.pdf")
```

### Syncing Documents

After significant changes to prestudy or thesis documents:

1. Compile the PDF: `./scripts/build.sh --prestudy`
2. In Claude Code, remove old version: `remove_document(["main.pdf"])`
3. Upload new version: `process_document("/path/to/main.pdf")`
4. Verify: `get_document("main.pdf", wait_for_completion: true)`

The Zotero sync script can also detect new research papers for indexing:

```bash
python scripts/sync_zotero.py --pageindex
```

### Documentation

For detailed documentation including tiered query strategies, token cost optimization, and troubleshooting, see:
- [`docs/pageindex-integration.md`](docs/pageindex-integration.md) - Full integration guide
- [`docs/specs/zotero-pageindex-sync.md`](docs/specs/zotero-pageindex-sync.md) - Automated sync extension

## Continuous Integration (CI)

GitHub Actions automatically builds and verifies everything on every push to `main`:

### Workflows

**LaTeX Build** (`.github/workflows/latex-build.yml`):
- `lint_python`: Python code quality (Ruff)
- `test_structure`: LaTeX structure validation
- `test_citations`: Citation-bibliography matching
- `test_formal_guidelines`: Required sections verification
- `test_formatting`: Formatting rules validation
- `test_bibliography_counts`: Bibliography integrity
- `test_items_csv`: Survey data validation
- `build_latex`: Full PDF compilation + verification

**Webapp CI** (`.github/workflows/ci.yml`):
- Runs Vitest test suite
- Builds static site
- Generates coverage reports
- TypeScript and Svelte checks

**Documentation** (`.github/workflows/docs.yml`):
- Builds and deploys MkDocs to GitHub Pages

**Security** (`.github/workflows/dependency-review.yml`):
- Scans dependencies for vulnerabilities

**Artifacts**:
- Compiled PDFs (`main.pdf`, `main_required.pdf`)
- Automatic releases on successful builds

## Deployment

### LaTeX PDF
- **Automated**: PDFs are built and released automatically via GitHub Actions on every push to `main`
- **Access**: Download from GitHub Releases or CI artifacts

### Webapp
- **Platform**: Netlify
- **Trigger**: Automatic deployment on commits to `main`
- **Configuration**: [`netlify.toml`](netlify.toml)
- **Base directory**: `webapp/`
- **Build command**: `npm run build`

### Documentation
- **Platform**: GitHub Pages
- **URL**: https://mrryf.github.io/bachelor-thesis/
- **Trigger**: Manual deployment via `mkdocs gh-deploy`

## Project Structure

```
bachelor-thesis/
├── content/                    # LaTeX source files
│   ├── prestudy/              # Current prestudy work
│   │   ├── main.tex           # Full version (with abstract)
│   │   ├── main_required.tex  # Required version (without abstract)
│   │   └── sections/          # Individual chapters
│   ├── thesis/                # Future thesis work
│   ├── resources/             # Shared resources
│   │   ├── bibliography.bib   # Zotero-synced references
│   │   ├── images/            # Figures and diagrams
│   │   ├── data/              # Survey data (CSV)
│   │   ├── tables/            # Generated LaTeX tables
│   │   └── docs/              # Supporting documents
│   └── lib/                   # LaTeX libraries (APA7 class)
│
├── webapp/                     # SvelteKit web application
│   ├── src/                   # Source code
│   │   ├── routes/            # SvelteKit pages
│   │   └── lib/               # Components and utilities
│   ├── static/                # Static assets
│   └── package.json           # Dependencies
│
├── docs/                       # MkDocs documentation
│   ├── index.md               # Documentation home
│   ├── getting-started/       # Setup guides
│   ├── scripts/               # Script documentation
│   └── api/                   # API reference
│
├── scripts/                    # Build and utility scripts
│   ├── build.sh               # LaTeX build orchestration
│   ├── sync_zotero.py         # Bibliography sync
│   ├── generate_item_tables.py # Table generation
│   ├── check_toc.py           # Document verification
│   ├── check_unused_citations.py # Citation usage analysis
│   └── sanitize_bib.py        # Bibliography sanitization
│
├── tests/                      # Automated test suites
│   ├── test_structure.py
│   ├── test_citations.py
│   ├── test_formal_guidelines.py
│   ├── test_formatting_rules.py
│   ├── test_bibliography_counts.py
│   └── test_items_csv.py
│
├── .github/                    # CI/CD configuration
│   └── workflows/
│       └── latex-build.yml    # Main CI pipeline
│
├── Makefile                    # Build automation
├── mkdocs.yml                  # Documentation config
├── netlify.toml                # Webapp deployment config
├── requirements.txt            # Python dependencies
└── requirements-dev.txt        # Dev dependencies
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/YourFeature`)
3.  Make your changes with clear commit messages
4.  Ensure all tests pass (`make test`)
5.  Push to your branch (`git push origin feature/YourFeature`)
6.  Open a Pull Request

See [`docs/contributing.md`](docs/contributing.md) for detailed guidelines.

## Security

This project takes security seriously. Please see our [Security Policy](SECURITY.md) for details on reporting vulnerabilities and supported versions.

## License

This project is part of academic research. All content is subject to academic integrity policies.

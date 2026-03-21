# Bachelor Thesis: Trust in Artificial Intelligence

![Build Status](https://github.com/mrryf/bachelor-thesis/actions/workflows/latex-build.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![LaTeX](https://img.shields.io/badge/latex-TeX%20Live%202025-green.svg)

Quantitative study investigating how framing affects trust in LLM-based applications, using the AI-TAM model. Contains LaTeX thesis documents, a SvelteKit survey webapp, and automated build tooling.

## Quick Start

```bash
git clone https://github.com/mrryf/bachelor-thesis.git
cd bachelor-thesis
make venv       # Create Python venv and install deps
make build      # Build thesis PDF
make test       # Run all tests (pytest)
```

Output: `content/thesis/main.pdf`

## Project Structure

```
bachelor-thesis/
├── content/
│   ├── thesis/            # Thesis LaTeX source (main document)
│   ├── prestudy/          # Prestudy (frozen, submitted Dec 2025)
│   └── resources/         # Shared bibliography, images, data
├── webapp/                # SvelteKit survey application
├── apps/                  # Electron research config manager
├── scripts/               # Build and sync utilities
├── tests/                 # pytest test suite (8 modules)
├── .github/workflows/     # CI: test + build thesis
└── Makefile
```

## Building & Testing

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `make build`        | Build thesis PDF              |
| `make build-all`    | Build thesis + prestudy       |
| `make test`         | Run pytest test suite         |
| `make lint`         | Python linting (Ruff)         |
| `make sync-zotero`  | Sync bibliography from Zotero |
| `make chktex`       | LaTeX syntax linting          |
| `make bib-validate` | Bibliography validation       |

## Prerequisites

- **TeX Live** 2025+ (or MacTeX): `brew install --cask mactex`
- **Python** 3.13+: managed via pyenv
- **Node.js** 20+ (for webapp only)

## Releases

PDF releases are created on tagged pushes (`git tag v1.0 && git push --tags`).

## License

Academic research project. All rights reserved.

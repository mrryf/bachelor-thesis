# Bachelor Thesis: Trust in Artificial Intelligence

![Build Status](https://github.com/mrryf/bachelor-thesis/actions/workflows/latex-build.yml/badge.svg)
![Python](https://img.shields.io/badge/python-3.x-blue.svg)
![LaTeX](https://img.shields.io/badge/latex-TeX%20Live-green.svg)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-blue.svg)

This repository contains the LaTeX source code and associated resources for the Bachelor Thesis on **"Trust in Artificial Intelligence"** (Vertrauen in Künstliche Intelligenz). The thesis investigates the impact of accuracy framing on user trust in AI systems using the AI-TAM model.

## Table of Contents
- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Testing & Verification](#testing--verification)
- [Continuous Integration](#continuous-integration-ci)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Quick Start

Get up and running in seconds:

```bash
# 1. Clone the repo
git clone https://github.com/mrryf/bachelor-thesis.git
cd bachelor-thesis

# 2. Install dependencies
pip install -r requirements.txt

# 3. Build the thesis
./scripts/build.sh
```

The compiled PDF will be available at `main.pdf`.

## Project Overview

The document is structured using the `subfiles` package, allowing for individual compilation of sections. The main document is `main.tex`, which integrates all sections located in the `sections/` directory.

### Key Features
- **Modular Structure**: Each section (Introduction, Theory, Methodology, etc.) is a separate file in `sections/`.
- **Automated Build System**: Custom shell scripts and GitHub Actions for continuous integration.
- **Bibliography Management**: Integrated with Zotero via `pyzotero` for automated bibliography updates.
- **Quality Assurance**: Automated checks for Table of Contents (TOC), List of Figures (LOF), and List of Tables (LOT) integrity.

## Tech Stack

- **Language**: LaTeX, Python 3
- **Build System**: `latexmk`, GitHub Actions
- **Bibliography**: BibTeX, Zotero API
- **Testing**: `unittest` (Python)

## Prerequisites

To build this project locally, you need the following tools installed:

### LaTeX Distribution
- **macOS**: [MacTeX](https://www.tug.org/mactex/) (recommended)
  ```bash
  brew install --cask mactex
  ```
- **Linux/Windows**: TeX Live or MiKTeX.

### Python Environment
Required for build scripts and tests.
- Python 3.x
- Dependencies: `bibtexparser`

```bash
pip install -r requirements.txt
```

### Fonts
- **Nerd Fonts**: Recommended for terminal icons (e.g., `MesloLGS NF`).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mrryf/bachelor-thesis.git
    cd bachelor-thesis
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Usage

### Building the Thesis
You can build the entire thesis or individual sections using the provided build script.

**Build everything (Main + Sections):**
```bash
./scripts/build.sh
```

**Build Main Document Only:**
```bash
latexmk -pdf main.tex
```

**Build a Specific Section:**
```bash
cd sections
latexmk -pdf 01_introduction.tex
```

### Bibliography Management
The bibliography is stored in `resources/bibliography.bib`. To sync the latest references from Zotero:

1.  Set your Zotero API credentials (optional, script will prompt if missing):
    ```bash
    export ZOTERO_API_KEY="your_api_key"
    export ZOTERO_USER_ID="your_user_id"
    ```
2.  Run the sync script:
    ```bash
    python scripts/sync_zotero.py
    ```

## Testing & Verification

This project uses automated tests to ensure document integrity.

**Run Structure Tests:**
Verifies that the LaTeX structure is valid and citations match the bibliography.
```bash
python tests/test_structure.py
```

**Run Formal Guidelines Tests:**
Verifies that all required sections and chapters are present.
```bash
python tests/test_formal_guidelines.py
```

**Verify Lists (TOC, LOF, LOT):**
Checks if the generated PDF contains populated lists.
```bash
python scripts/check_toc.py
```

## Continuous Integration (CI)

This repository uses GitHub Actions to automatically build and verify the thesis on every push to `main`.

- **Workflow**: `.github/workflows/latex-build.yml`
- **Jobs**:
    - `test_structure`: Runs unit tests and bibliography checks.
    - `build_latex`: Compiles the PDF and verifies document lists.
- **Artifacts**: The compiled `main.pdf` is uploaded as an artifact for each successful build.

## Project Structure

```
bachelor-thesis/
├── main.tex                # Main LaTeX entry point
├── sections/               # Individual thesis chapters
│   ├── 00_abstract.tex
│   ├── 01_introduction.tex
│   └── ...
├── resources/              # Assets and bibliography
│   ├── bibliography.bib
│   ├── images/
│   ├── docs/
│   └── design/
├── scripts/                # Build and utility scripts
│   ├── build.sh
│   ├── check_toc.py
│   └── sync_zotero.py
├── tests/                  # Automated tests
│   ├── test_structure.py
│   └── test_formal_guidelines.py
└── .github/                # CI/CD configuration
```

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## License

Copyright (c) 2025 mrryf. All Rights Reserved.
See [LICENSE](LICENSE) for details.

## Contact

Created by [mrryf](https://github.com/mrryf).

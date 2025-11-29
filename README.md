# Bachelor Thesis: Trust in Artificial Intelligence

This repository contains the LaTeX source code and associated resources for the Bachelor Thesis on "Trust in Artificial Intelligence" (Vertrauen in Künstliche Intelligenz). The thesis investigates the impact of accuracy framing on user trust in AI systems using the AI-TAM model.

## Project Overview

The document is structured using the `subfiles` package, allowing for individual compilation of sections. The main document is `main.tex`, which integrates all sections located in the `sections/` directory.

### Key Features
- **Modular Structure**: Each section (Introduction, Theory, Methodology, etc.) is a separate file in `sections/`.
- **Automated Build System**: Custom shell scripts and GitHub Actions for continuous integration.
- **Bibliography Management**: Integrated with Zotero via `pyzotero` for automated bibliography updates.
- **Quality Assurance**: Automated checks for Table of Contents (TOC), List of Figures (LOF), and List of Tables (LOT) integrity.

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
- Dependencies: `pytest`, `bibtexparser`, `pyzotero`

```bash
pip install pytest bibtexparser pyzotero
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
    pip install -r requirements.txt # If available, otherwise install manually as above
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

1.  Set your Zotero API credentials:
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
│   └── test_structure.py
└── .github/                # CI/CD configuration
```

## License

[Insert License Here, e.g., MIT, CC-BY, or All Rights Reserved]

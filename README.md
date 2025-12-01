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

# 3. Build the Prestudy
./scripts/build.sh content/prestudy
```

The compiled PDF will be available at `content/prestudy/main.pdf`.

## Project Overview

The repository is divided into two main components within the `content/` directory:
- **Prestudy (`content/prestudy/`)**: Contains the current work for the Vorstudie.
- **Thesis (`content/thesis/`)**: Reserved for the main bachelor thesis work.

The document is structured using the `subfiles` package. The main document for the prestudy is `content/prestudy/main.tex`.

### Key Features
- **Modular Structure**: Each section is a separate file in `content/prestudy/sections/`.
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

**Build everything (Prestudy):**
```bash
./scripts/build.sh content/prestudy
```

**Build Main Document Only (Manual):**
```bash
cd content/prestudy
latexmk -pdf main.tex
```

**Build a Specific Section:**
```bash
cd content/prestudy/sections
latexmk -pdf 01_introduction.tex
```

### Bibliography Management
The bibliography is stored in `content/prestudy/resources/bibliography.bib`. To sync the latest references from Zotero:

1.  Set your Zotero API credentials (optional, script will prompt if missing):
    ```bash
    export ZOTERO_API_KEY="your_api_key"
    export ZOTERO_USER_ID="your_user_id"
    ```
2.  Run the sync script:
    ```bash
    python scripts/sync_zotero.py
    ```

> **Note:** You must have read access to the specific Zotero libraries configured in the script. If you do not have access, the project includes a pre-generated `content/prestudy/resources/bibliography.bib` file that you can use.

## Testing & Verification

This project uses automated tests to ensure document integrity.

**Run Structure Tests:**
Verifies that the LaTeX structure is valid (e.g., APA7 class).
```bash
python tests/test_structure.py
```

**Run Citation Tests:**
Verifies that all citations in the text match the bibliography.
```bash
python tests/test_citations.py
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
    - `lint_python`: Checks Python code style using Ruff.
    - `test_structure`: Runs unit tests to verify LaTeX structure.
    - `test_citations`: Verifies that citations match the bibliography.
    - `test_formal_guidelines`: Checks for required sections and chapters.
    - `test_formatting`: Validates formatting rules.
    - `test_bibliography_counts`: Checks bibliography entry counts.
    - `build_latex`: Compiles the PDF and verifies document lists (TOC, LOF, LOT).
- **Artifacts**: The compiled `main.pdf` is uploaded as an artifact for each successful build.

## Project Structure

```
bachelor-thesis/
├── content/
│   ├── prestudy/           # Current Prestudy Work
│   │   ├── main.tex        # Main LaTeX entry point
│   │   ├── sections/       # Individual chapters
│   │   │   ├── 00_abstract.tex
│   │   │   ├── 01_introduction.tex
│   │   │   └── ...
│   │   └── resources/      # Assets and bibliography
│   │       ├── bibliography.bib
│   │       ├── images/
│   │       ├── docs/
│   │       └── design/
│   ├── thesis/             # Future Thesis Work
│   └── operationisation-constructs/
├── lib/                    # Shared libraries/modules
│   └── apa7/               # Custom APA7 class files
├── scripts/                # Build and utility scripts
│   ├── build.sh
│   ├── check_toc.py
│   └── sync_zotero.py
├── tests/                  # Automated tests
│   ├── test_structure.py
│   ├── test_formal_guidelines.py
│   └── ...
└── .github/                # CI/CD configuration
```

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## Security
This project takes security seriously. Please see our [Security Policy](SECURITY.md) for details on reporting vulnerabilities and supported versions.

## License

Copyright (c) 2025 mrryf. All Rights Reserved.
See [LICENSE](LICENSE) for details.

## Contact

Created by [mrryf](https://github.com/mrryf).

# Installation

Get the bachelor thesis project set up on your local machine.

## Prerequisites

### Required Software

- **Python 3.x** - For build scripts and automation
- **LaTeX Distribution** - For compiling documents
  - macOS: [MacTeX](https://www.tug.org/mactex/)
  - Linux: TeX Live
  - Windows: MiKTeX or TeX Live

### Optional Tools

- **Git** - For version control
- **Visual Studio Code** - Recommended editor
  - Install LaTeX Workshop extension

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/mrryf/bachelor-thesis.git
cd bachelor-thesis
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `bibtexparser` - Bibliography parsing
- `pyzotero` - Zotero API integration
- `ruff` - Python linter
- `mkdocs` + plugins - Documentation (optional)

### 3. Verify Installation

```bash
# Check LaTeX
pdflatex --version

# Check Python packages
pip list | grep -E "bibtexparser|pyzotero"

# Test build system
./scripts/build.sh --help
```

## Platform-Specific Setup

=== "macOS"

    ```bash
    # Install MacTeX via Homebrew
    brew install --cask mactex
    
    # Install Python dependencies
    pip3 install -r requirements.txt
    
    # Update PATH if needed
    export PATH="/Library/TeX/texbin:$PATH"
    ```

=== "Linux (Ubuntu/Debian)"

    ```bash
    # Install minimal TeX Live packages
    sudo apt-get update
    sudo apt-get install -y \
      texlive-latex-base \
      texlive-latex-extra \
      texlive-bibtex-extra \
      texlive-publishers \
      texlive-lang-german \
      biber \
      latexmk
    
    # Install Python dependencies
    pip install -r requirements.txt
    ```

=== "Windows"

    1. Download and install [MiKTeX](https://miktex.org/download)
    2. Install [Python](https://www.python.org/downloads/)
    3. Open Command Prompt and run:
    ```cmd
    pip install -r requirements.txt
    ```

## Next Steps

- [Building the Thesis](building.md) - Compile LaTeX documents
- [Running Tests](testing.md) - Verify setup and document integrity

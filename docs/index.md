# Bachelor Thesis - Code Documentation

Welcome to the automated code documentation for the Bachelor Thesis project on **Trust in Artificial Intelligence**.

## Overview

This documentation covers the build scripts, testing framework, and CI/CD workflows that support the LaTeX thesis compilation process.

## Quick Links

- 📦 **[Installation Guide](getting-started/installation.md)** - Get set up in minutes
- 🔨 **[Building the Thesis](getting-started/building.md)** - Compile LaTeX documents
- ✅ **[Running Tests](getting-started/testing.md)** - Verify document integrity
- 📚 **[API Reference](api/scripts.md)** - Detailed script documentation
- 🔄 **[CI/CD Pipeline](workflows/ci-cd.md)** - Automated workflows

## Project Structure

```
bachelor-thesis/
├── scripts/          # Build and utility scripts
│   ├── build.sh                 # Main build orchestrator
│   ├── generate_item_tables.py  # Survey table generation
│   ├── check_toc.py             # Document verification
│   └── ...
├── tests/            # Automated test suite
│   ├── test_structure.py
│   ├── test_citations.py
│   └── ...
├── content/          # LaTeX source files
│   ├── prestudy/     # Prestudy document
│   ├── thesis/       # Main thesis
│   └── resources/    # Shared resources
└── .github/          # CI/CD workflows
    └── workflows/
```

## Key Features

### 🤖 Automated Build System
- One-command builds with `./scripts/build.sh`
- Selective compilation (`--prestudy`, `--thesis`, `--all`)
- Automatic table generation from CSV data

### ✅ Quality Assurance
- Comprehensive test suite for document integrity
- Citation validation against bibliography
- TOC/LOF/LOT verification
- Formal guidelines compliance checks

### 🚀 Continuous Integration
- GitHub Actions for automated builds
- PDF artifact generation on every push
- Automated releases with versioning
- Fast builds (~7-10 minutes)

## Getting Started

=== "Quick Start"

    ```bash
    # Clone the repository
    git clone https://github.com/mrryf/bachelor-thesis.git
    cd bachelor-thesis

    # Install dependencies
    pip install -r requirements.txt

    # Build the prestudy
    ./scripts/build.sh --prestudy
    ```

=== "For Contributors"

    1. Read the [Contributing Guide](contributing.md)
    2. Check the [API Reference](api/scripts.md) for implementation details
    3. Run tests before committing: `python -m pytest tests/`

## Tech Stack

- **LaTeX**: TeX Live with APA7 class
- **Python 3.x**: Build scripts and automation
- **GitHub Actions**: CI/CD pipeline
- **MkDocs Material**: This documentation

## License

Copyright (c) 2025 mrryf. All Rights Reserved.

---

*Last updated: {{ git.short_commit }} ({{ git.commit_date }})*

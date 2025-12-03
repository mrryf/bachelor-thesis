# Scripts API Reference

Auto-generated API documentation for build, testing, and utility scripts.

## Table Generation

### generate_item_tables.py

::: scripts.generate_item_tables
    options:
      show_source: true
      members:
        - generate_latex_tables
        - create_latex_table
        - escape_latex

---

## Document Verification

### check_toc.py

::: scripts.check_toc
    options:
      show_source: true
      members: true

---

### check_unused_citations.py

::: scripts.check_unused_citations
    options:
      show_source: true
      members: true

---

## Build Tools

### build.sh

The main build orchestration script. Written in Bash, coordinates the LaTeX compilation process.

**Usage:**
```bash
./scripts/build.sh [--all|--prestudy|--thesis]
```

**Options:**
- `--all`: Build both prestudy and thesis documents
- `--prestudy`: Build only the prestudy document (default)
- `--thesis`: Build only the thesis document

**Process:**
1. Generates survey item tables from CSV
2. Cleans previous build artifacts
3. Compiles LaTeX with latexmk (handles bibliography)
4. Verifies output PDFs

---

!!! note "Documentation Extraction"
    API documentation is automatically extracted from Python docstrings using mkdocstrings.
    Update docstrings in the source files to update this documentation.

# Verification Tools

These scripts are used to verify the integrity and quality of the project before building or committing.

## check_unused_citations.py

Checks for citations in the LaTeX text that are missing from the bibliography, and vice-versa.

### Usage

```bash
python3 scripts/check_unused_citations.py
```

## check_toc.py

Verifies that the Table of Contents (TOC), List of Figures (LOF), and List of Tables (LOT) are correctly generated in the PDF.

### Usage

```bash
python3 scripts/check_toc.py <directory>
```

## sync_zotero.py

Synchronizes the local bibliography with Zotero collections. It also preserves manual citations found in `content/resources/local.bib`.

### Usage

```bash
python3 scripts/sync_zotero.py
```

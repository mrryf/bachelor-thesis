"""Shared utility functions for thesis tests.

Consolidates functions previously duplicated across test files.
"""
import re
from pathlib import Path

import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode


def extract_citations_from_tex(tex_content: str) -> set[str]:
    """Extract all citation keys from LaTeX content.

    Handles: \\parencite{key}, \\textcite{key}, \\cite{key}
    and multi-key variants: \\parencite{key1,key2}
    """
    # Matches \cite, \parencite, \textcite, \citeauthor, etc. with optional [] args
    pattern = r'\\([a-zA-Z]*cite[a-zA-Z]*)(?:\[[^\]]*\]){0,2}\{([^}]+)\}'
    keys = set()
    for match in re.finditer(pattern, tex_content):
        for key in match.group(2).split(','):
            stripped = key.strip()
            if stripped and stripped != '*':
                keys.add(stripped)
    return keys


def get_bibliography_keys(bib_path: Path) -> set[str]:
    """Get all entry keys from a .bib file."""
    parser = BibTexParser()
    parser.customization = convert_to_unicode

    with open(bib_path, 'r', encoding='utf-8') as f:
        bib_db = bibtexparser.load(f, parser=parser)
    return {entry['ID'] for entry in bib_db.entries}


def get_tex_files(base_dir: Path) -> list[Path]:
    """Get all .tex files in a document directory (main + sections + sections_required)."""
    files = []
    main = base_dir / "main.tex"
    if main.exists():
        files.append(main)
    sections_dir = base_dir / "sections"
    if sections_dir.exists():
        files.extend(sorted(sections_dir.glob("*.tex")))
    sections_required = base_dir / "sections_required"
    if sections_required.exists():
        files.extend(sorted(sections_required.glob("*.tex")))
    return files


def read_tex_content(base_dir: Path) -> str:
    """Read and concatenate all .tex content from a document directory."""
    content = []
    for tex_file in get_tex_files(base_dir):
        content.append(tex_file.read_text(encoding='utf-8'))
    return '\n'.join(content)


def get_subfile_refs(main_tex: Path) -> list[str]:
    """Extract \\subfile{} references from main.tex."""
    content = main_tex.read_text(encoding='utf-8')
    return re.findall(r'\\subfile\{([^}]+)\}', content)


def find_unused_citations(bib_path: Path, tex_dir: Path) -> set[str]:
    """Find bibliography keys not cited in any .tex file.

    Extracted from scripts/check_unused_citations.py.
    """
    bib_keys = get_bibliography_keys(bib_path)
    tex_content = read_tex_content(tex_dir)
    cited_keys = extract_citations_from_tex(tex_content)
    return bib_keys - cited_keys

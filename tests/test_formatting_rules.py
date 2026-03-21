"""Test LaTeX formatting conventions."""


def test_toc_starts_on_new_page(thesis_dir):
    """Table of contents must be preceded by \\newpage or \\clearpage."""
    content = (thesis_dir / "main.tex").read_text(encoding='utf-8')
    toc_pos = content.find(r'\tableofcontents')
    if toc_pos >= 0:
        preceding = content[max(0, toc_pos - 200):toc_pos]
        assert r'\newpage' in preceding or r'\clearpage' in preceding, \
            "Table of Contents does not appear to start on a new page"


def test_prestudy_toc_starts_on_new_page(prestudy_dir):
    """Prestudy table of contents must be preceded by \\newpage or \\clearpage."""
    content = (prestudy_dir / "main.tex").read_text(encoding='utf-8')
    toc_pos = content.find(r'\tableofcontents')
    if toc_pos >= 0:
        preceding = content[max(0, toc_pos - 200):toc_pos]
        assert r'\newpage' in preceding or r'\clearpage' in preceding, \
            "Table of Contents does not appear to start on a new page"


def test_bibliography_starts_on_new_page(prestudy_dir):
    """Prestudy bibliography must be preceded by \\newpage."""
    content = (prestudy_dir / "main.tex").read_text(encoding='utf-8')

    # Try different bibliography inclusion patterns
    bib_patterns = [
        r"\subfile{sections_required/10_quellenverzeichnis}",
        r"\printbibliography",
    ]
    bib_index = -1
    for pattern in bib_patterns:
        bib_index = content.find(pattern)
        if bib_index != -1:
            break

    if bib_index == -1:
        return  # No bibliography section found — skip

    search_window = content[max(0, bib_index - 200):bib_index]
    assert r'\newpage' in search_window, \
        "Bibliography does not appear to start on a new page"

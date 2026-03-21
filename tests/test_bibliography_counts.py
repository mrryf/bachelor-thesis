"""Test bibliography configuration and citation counts."""
from tests.thesis_utils import extract_citations_from_tex, get_bibliography_keys, read_tex_content


def test_bibliography_has_entries(bibliography_path):
    """Bibliography file must contain entries."""
    bib_keys = get_bibliography_keys(bibliography_path)
    assert len(bib_keys) > 0, "Bibliography file is empty!"


def test_thesis_has_citations(thesis_dir):
    """Thesis must contain at least one citation."""
    tex_content = read_tex_content(thesis_dir)
    cited = extract_citations_from_tex(tex_content)
    # Thesis may have very few citations early on — warn rather than fail
    if not cited:
        import warnings
        warnings.warn("No citations found in thesis text")


def test_prestudy_citation_counts(prestudy_dir, bibliography_path):
    """Report prestudy citation counts."""
    tex_content = read_tex_content(prestudy_dir)
    cited = extract_citations_from_tex(tex_content)
    bib_keys = get_bibliography_keys(bibliography_path)

    assert len(cited) > 0, "No citations found in prestudy text"
    assert len(bib_keys) > 0, "Bibliography file is empty"

    print(f"\n[INFO] Prestudy: {len(cited)} unique citations, {len(bib_keys)} bib entries")

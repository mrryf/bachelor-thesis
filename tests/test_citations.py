"""Test citation consistency between .tex files and bibliography."""
import warnings
from tests.thesis_utils import (
    extract_citations_from_tex, find_unused_citations, get_bibliography_keys, read_tex_content,
)


def test_references_consistency(thesis_dir, bibliography_path):
    """All citations in thesis must exist in bibliography."""
    tex_content = read_tex_content(thesis_dir)
    cited = extract_citations_from_tex(tex_content)
    bib_keys = get_bibliography_keys(bibliography_path)
    missing = cited - bib_keys
    assert not missing, f"Citations not in bibliography: {missing}"


def test_prestudy_references_consistency(prestudy_dir, bibliography_path):
    """All citations in prestudy must exist in bibliography."""
    tex_content = read_tex_content(prestudy_dir)
    cited = extract_citations_from_tex(tex_content)
    bib_keys = get_bibliography_keys(bibliography_path)
    missing = cited - bib_keys
    assert not missing, f"Citations not in bibliography: {missing}"


def test_no_unused_citations(thesis_dir, bibliography_path):
    """Warn about bibliography entries not cited in thesis."""
    unused = find_unused_citations(bibliography_path, thesis_dir)
    if unused:
        warnings.warn(f"{len(unused)} bibliography entries not cited in thesis")

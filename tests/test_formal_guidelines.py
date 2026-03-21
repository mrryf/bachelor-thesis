"""Test formal guideline compliance for thesis structure."""
from tests.thesis_utils import get_subfile_refs


def test_thesis_required_sections(thesis_dir):
    """All subfile references in thesis main.tex must have corresponding .tex files."""
    refs = get_subfile_refs(thesis_dir / "main.tex")
    for ref in refs:
        tex_file = thesis_dir / f"{ref}.tex"
        assert tex_file.exists(), f"Missing section: {ref}"


def test_prestudy_main_exists(prestudy_dir):
    """Prestudy main.tex must exist."""
    assert (prestudy_dir / "main.tex").exists(), "Prestudy main.tex missing"


def test_prestudy_required_sections(prestudy_dir):
    """Required prestudy sections in sections_required/ must exist."""
    sections_required = prestudy_dir / "sections_required"
    if not sections_required.exists():
        return
    refs = get_subfile_refs(prestudy_dir / "main.tex")
    for ref in refs:
        tex_file = prestudy_dir / f"{ref}.tex"
        assert tex_file.exists(), f"Missing prestudy section: {ref}"

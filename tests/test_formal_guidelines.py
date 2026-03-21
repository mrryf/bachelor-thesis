"""Test formal guideline compliance for thesis structure."""
from tests.thesis_utils import get_subfile_refs


def test_thesis_required_sections(thesis_dir):
    """All subfile references in thesis main.tex must have corresponding .tex files."""
    refs = get_subfile_refs(thesis_dir / "main.tex")
    assert len(refs) > 0, "Thesis main.tex has no \\subfile references"
    for ref in refs:
        tex_file = thesis_dir / f"{ref}.tex"
        assert tex_file.exists(), f"Missing section: {ref}"


def test_prestudy_main_exists(prestudy_dir):
    """Prestudy main.tex must exist."""
    assert (prestudy_dir / "main.tex").exists(), "Prestudy main.tex missing"


def test_prestudy_required_sections(prestudy_dir):
    """All subfile references in prestudy main.tex must have corresponding .tex files."""
    refs = get_subfile_refs(prestudy_dir / "main.tex")
    assert len(refs) > 0, "Prestudy main.tex has no \\subfile references"
    for ref in refs:
        tex_file = prestudy_dir / f"{ref}.tex"
        assert tex_file.exists(), f"Missing prestudy section: {ref}"


def test_prestudy_mandatory_sections(prestudy_dir):
    """Prestudy must include mandatory sections (formal requirement)."""
    mandatory = [
        "sections_required/01_einleitung",
        "sections/02_theory",
        "sections/03_methodology",
        "sections_required/10_quellenverzeichnis",
    ]
    refs = get_subfile_refs(prestudy_dir / "main.tex")
    for section in mandatory:
        assert section in refs, f"Mandatory prestudy section missing from main.tex: {section}"

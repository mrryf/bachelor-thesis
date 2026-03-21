"""Test document structure and class configuration."""


def test_apa7_style_applied(thesis_dir):
    """Thesis must use apa7 document class."""
    main_tex = thesis_dir / "main.tex"
    content = main_tex.read_text(encoding='utf-8')
    assert 'apa7' in content, "Thesis must use apa7 document class"


def test_prestudy_apa7_style(prestudy_dir):
    """Prestudy must use apa7 document class."""
    main_tex = prestudy_dir / "main.tex"
    content = main_tex.read_text(encoding='utf-8')
    assert 'apa7' in content, "Prestudy must use apa7 document class"

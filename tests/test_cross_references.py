"""Validate cross-references, labels, and heading hierarchy in LaTeX documents."""
import re
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent


def _strip_comments(text):
    """Remove LaTeX comments (% to end of line), preserving escaped \\%."""
    return re.sub(r'(?<!\\)%.*', '', text)


def _collect_tex_files():
    """Collect all .tex files from prestudy and thesis, excluding _archive."""
    tex_files = []
    for doc_dir in ['content/prestudy', 'content/thesis']:
        full_path = PROJECT_ROOT / doc_dir
        if full_path.is_dir():
            for root, dirs, files in os.walk(full_path):
                dirs[:] = [d for d in dirs if d != '_archive']  # Skip archive dirs
                for f in files:
                    if f.endswith('.tex'):
                        tex_files.append(Path(root) / f)
    return tex_files


def _extract_labels(tex_files):
    """Find all \\label{...} definitions with file and line number."""
    labels = {}
    for tex_file in tex_files:
        lines = tex_file.read_text(encoding='utf-8').splitlines(keepends=True)
        for i, line in enumerate(lines, 1):
            clean = _strip_comments(line)
            for match in re.finditer(r'\\label\{([^}]+)\}', clean):
                key = match.group(1).strip()
                labels[key] = (tex_file, i)
    return labels


def _extract_refs(tex_files):
    """Find all \\ref{}, \\autoref{}, \\cref{}, \\pageref{} references."""
    refs = []
    ref_pattern = re.compile(r'\\(?:auto)?(?:[Cc])?ref\{([^}]+)\}|\\pageref\{([^}]+)\}')
    for tex_file in tex_files:
        lines = tex_file.read_text(encoding='utf-8').splitlines(keepends=True)
        for i, line in enumerate(lines, 1):
            clean = _strip_comments(line)
            for match in ref_pattern.finditer(clean):
                key = (match.group(1) or match.group(2)).strip()
                refs.append((key, tex_file, i))
    return refs


def test_no_broken_references():
    """Every \\ref{X} must have a matching \\label{X}."""
    tex_files = _collect_tex_files()
    labels = _extract_labels(tex_files)
    refs = _extract_refs(tex_files)

    broken = []
    for key, filepath, line_num in refs:
        if key not in labels:
            rel_path = filepath.relative_to(PROJECT_ROOT)
            broken.append(f"{rel_path}:{line_num} -> \\ref{{{key}}}")

    assert not broken, "Broken references found (no matching \\label):\n" + "\n".join(broken)


def test_label_naming_convention():
    """Labels should use standard prefixes (sec:, fig:, tab:, eq:, lst:, ch:)."""
    tex_files = _collect_tex_files()
    labels = _extract_labels(tex_files)
    valid_prefixes = ('sec:', 'fig:', 'tab:', 'eq:', 'lst:', 'ch:', 'app:', 'itm:')

    violations = []
    for key, (filepath, line_num) in labels.items():
        if not key.startswith(valid_prefixes):
            rel_path = filepath.relative_to(PROJECT_ROOT)
            violations.append(f"{rel_path}:{line_num} -> \\label{{{key}}} (no standard prefix)")

    # Warning-level check — report but don't fail
    if violations:
        print(f"\nWARNING: {len(violations)} labels without standard prefixes:")
        for v in violations[:10]:
            print(f"  {v}")


def test_no_duplicate_labels():
    """No two \\label{} definitions should share the same key within a document.

    Checks per document directory (prestudy/thesis) since they are separate
    LaTeX compilation units — duplicate labels across documents are harmless.
    """
    duplicates = []
    for doc_dir in ['content/prestudy', 'content/thesis']:
        full_path = PROJECT_ROOT / doc_dir
        if not full_path.is_dir():
            continue
        doc_files = []
        for root, dirs, files in os.walk(full_path):
            dirs[:] = [d for d in dirs if d != '_archive']
            for f in files:
                if f.endswith('.tex'):
                    doc_files.append(Path(root) / f)

        seen = {}
        for tex_file in doc_files:
            lines = tex_file.read_text(encoding='utf-8').splitlines(keepends=True)
            for i, line in enumerate(lines, 1):
                clean = _strip_comments(line)
                for match in re.finditer(r'\\label\{([^}]+)\}', clean):
                    key = match.group(1).strip()
                    rel_path = tex_file.relative_to(PROJECT_ROOT)
                    if key in seen:
                        prev_file, prev_line = seen[key]
                        prev_rel = prev_file.relative_to(PROJECT_ROOT)
                        duplicates.append(
                            f"\\label{{{key}}} in {doc_dir}: {prev_rel}:{prev_line} AND {rel_path}:{i}"
                        )
                    else:
                        seen[key] = (tex_file, i)

    assert not duplicates, "Duplicate labels found:\n" + "\n".join(duplicates)


def test_heading_hierarchy():
    """No skipped heading levels (e.g., \\section followed directly by \\subsubsection)."""
    tex_files = _collect_tex_files()
    heading_levels = {
        'chapter': 0, 'section': 1, 'subsection': 2, 'subsubsection': 3,
    }
    heading_pattern = re.compile(
        r'\\(chapter|section|subsection|subsubsection)\*?\{([^}]*)\}'
    )

    violations = []
    for tex_file in tex_files:
        lines = tex_file.read_text(encoding='utf-8').splitlines(keepends=True)
        prev_level = None
        prev_heading = None
        for i, line in enumerate(lines, 1):
            clean = _strip_comments(line)
            match = heading_pattern.search(clean)
            if match:
                cmd = match.group(1)
                title = match.group(2)
                level = heading_levels[cmd]
                if prev_level is not None and level > prev_level + 1:
                    rel_path = tex_file.relative_to(PROJECT_ROOT)
                    violations.append(
                        f"{rel_path}:{i} -> \\{cmd}{{{title}}} skips from "
                        f"\\{prev_heading} (level {prev_level}) to level {level}"
                    )
                prev_level = level
                prev_heading = cmd

    assert not violations, "Heading hierarchy violations:\n" + "\n".join(violations)


def test_figures_have_captions_and_labels():
    """Every \\begin{figure} environment should contain \\caption and \\label."""
    tex_files = _collect_tex_files()
    figure_pattern = re.compile(r'\\begin\{figure\}(.*?)\\end\{figure\}', re.DOTALL)

    missing = []
    for tex_file in tex_files:
        content = tex_file.read_text(encoding='utf-8')
        content_clean = _strip_comments(content)
        for match in figure_pattern.finditer(content_clean):
            body = match.group(1)
            rel_path = tex_file.relative_to(PROJECT_ROOT)
            line_num = content_clean[:match.start()].count('\n') + 1
            if '\\caption' not in body:
                missing.append(f"{rel_path}:{line_num} -> figure missing \\caption")
            if '\\label' not in body:
                missing.append(f"{rel_path}:{line_num} -> figure missing \\label")

    assert not missing, "Figures with missing caption/label:\n" + "\n".join(missing)


def test_tables_have_captions_and_labels():
    """Every \\begin{table} environment should contain \\caption and \\label."""
    tex_files = _collect_tex_files()
    table_pattern = re.compile(r'\\begin\{table\}(.*?)\\end\{table\}', re.DOTALL)

    missing = []
    for tex_file in tex_files:
        content = tex_file.read_text(encoding='utf-8')
        content_clean = _strip_comments(content)
        for match in table_pattern.finditer(content_clean):
            body = match.group(1)
            rel_path = tex_file.relative_to(PROJECT_ROOT)
            line_num = content_clean[:match.start()].count('\n') + 1
            if '\\caption' not in body:
                missing.append(f"{rel_path}:{line_num} -> table missing \\caption")
            if '\\label' not in body:
                missing.append(f"{rel_path}:{line_num} -> table missing \\label")

    assert not missing, "Tables with missing caption/label:\n" + "\n".join(missing)

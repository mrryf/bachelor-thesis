"""Validate bibliography entry quality and completeness."""
import re
import datetime
from pathlib import Path


def _parse_bib_entries(bib_path: Path) -> list[dict]:
    """Parse .bib file into list of dicts with type, key, and fields."""
    if not bib_path.exists():
        return []

    content = bib_path.read_text(encoding='utf-8')
    entries = []
    entry_pattern = re.compile(r'@(\w+)\s*\{\s*([^,]+),\s*(.*?)\n\}', re.DOTALL)

    for match in entry_pattern.finditer(content):
        entry_type = match.group(1).lower()
        key = match.group(2).strip()
        body = match.group(3)

        if entry_type in ('string', 'preamble', 'comment'):
            continue

        fields = {}
        field_pattern = re.compile(
            r'(\w+)\s*=\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)"|(\d+))'
        )
        for fmatch in field_pattern.finditer(body):
            field_name = fmatch.group(1).lower()
            value = fmatch.group(2) or fmatch.group(3) or fmatch.group(4) or ''
            fields[field_name] = value.strip()

        entries.append({'type': entry_type, 'key': key, 'fields': fields})

    return entries


def test_bib_file_exists(bibliography_path):
    """Bibliography file must exist."""
    assert bibliography_path.exists(), f"Bibliography file not found: {bibliography_path}"


def test_required_fields_by_type(bibliography_path):
    """Each entry type must have its required fields."""
    entries = _parse_bib_entries(bibliography_path)
    required_fields = {
        'article': ['author', 'title', 'journaltitle', 'year'],
        'book': ['author', 'title', 'year'],
        'inproceedings': ['author', 'title', 'booktitle', 'year'],
        'incollection': ['author', 'title', 'booktitle', 'year'],
        'inbook': ['author', 'title', 'booktitle', 'year'],
        'phdthesis': ['author', 'title', 'institution', 'year'],
        'mastersthesis': ['author', 'title', 'institution', 'year'],
        'techreport': ['author', 'title', 'institution', 'year'],
        'misc': ['author', 'title', 'year'],
        'online': ['author', 'title', 'url', 'year'],
        'report': ['author', 'title', 'institution', 'year'],
    }

    missing = []
    for entry in entries:
        etype = entry['type']
        if etype not in required_fields:
            continue
        for field in required_fields[etype]:
            if field == 'year' and ('year' in entry['fields'] or 'date' in entry['fields']):
                continue
            if field == 'author' and etype in ('book', 'incollection') and 'editor' in entry['fields']:
                continue
            if field == 'journaltitle' and ('journaltitle' in entry['fields'] or 'journal' in entry['fields']):
                continue
            if field == 'institution' and ('institution' in entry['fields'] or 'school' in entry['fields']):
                continue
            if field not in entry['fields']:
                missing.append(f"@{etype}{{{entry['key']}}}: missing '{field}'")

    assert not missing, "Missing required fields:\n" + "\n".join(missing[:20])


def test_year_is_reasonable(bibliography_path):
    """Year/date field should be between 1900 and current year + 1."""
    entries = _parse_bib_entries(bibliography_path)
    max_year = datetime.datetime.now().year + 1

    bad_years = []
    for entry in entries:
        year_str = entry['fields'].get('year', '')
        if not year_str:
            date_str = entry['fields'].get('date', '')
            if date_str:
                year_match = re.match(r'(\d{4})', date_str)
                year_str = year_match.group(1) if year_match else ''
        if year_str:
            try:
                year = int(year_str)
                if year < 1900 or year > max_year:
                    bad_years.append(f"@{entry['type']}{{{entry['key']}}}: year={year}")
            except ValueError:
                bad_years.append(f"@{entry['type']}{{{entry['key']}}}: non-numeric year='{year_str}'")

    assert not bad_years, "Unreasonable years:\n" + "\n".join(bad_years)


def test_no_duplicate_keys(bibliography_path):
    """No two entries should share the same citation key."""
    entries = _parse_bib_entries(bibliography_path)
    seen = {}
    duplicates = []
    for entry in entries:
        key = entry['key']
        if key in seen:
            duplicates.append(f"Duplicate key '{key}': @{seen[key]} and @{entry['type']}")
        else:
            seen[key] = entry['type']

    assert not duplicates, "Duplicate bibliography keys:\n" + "\n".join(duplicates)


def test_doi_or_url_present(bibliography_path):
    """Entries should have a DOI or URL for traceability (warning-level)."""
    entries = _parse_bib_entries(bibliography_path)
    missing_identifiers = []
    for entry in entries:
        has_doi = bool(entry['fields'].get('doi'))
        has_url = bool(entry['fields'].get('url'))
        has_isbn = bool(entry['fields'].get('isbn'))
        if not (has_doi or has_url or has_isbn):
            missing_identifiers.append(f"@{entry['type']}{{{entry['key']}}}: no DOI, URL, or ISBN")

    if missing_identifiers:
        pct = len(missing_identifiers) / len(entries) * 100 if entries else 0
        print(f"\nWARNING: {len(missing_identifiers)}/{len(entries)} ({pct:.0f}%) lack DOI/URL/ISBN")


def test_author_field_not_empty(bibliography_path):
    """Author (or editor) field should not be empty when present."""
    entries = _parse_bib_entries(bibliography_path)
    empty_authors = []
    for entry in entries:
        author = entry['fields'].get('author', '')
        editor = entry['fields'].get('editor', '')
        if not author and not editor:
            empty_authors.append(f"@{entry['type']}{{{entry['key']}}}: no author or editor")
        elif author and len(author.strip()) < 2:
            empty_authors.append(f"@{entry['type']}{{{entry['key']}}}: author too short: '{author}'")

    assert not empty_authors, "Missing/empty authors:\n" + "\n".join(empty_authors)


def test_no_encoding_issues(bibliography_path):
    """Check for common encoding problems in .bib file."""
    if not bibliography_path.exists():
        return
    content = bibliography_path.read_text(encoding='utf-8')
    issues = []
    if '\ufffd' in content:
        issues.append(f"Found {content.count(chr(0xfffd))} Unicode replacement characters")
    if '\x00' in content:
        issues.append("Found null bytes")
    if content.startswith('\ufeff'):
        issues.append("File starts with BOM — may cause biber issues")

    assert not issues, "Encoding issues:\n" + "\n".join(issues)

"""Test survey items CSV structure and content."""
import csv
from pathlib import Path

ITEMS_CSV = Path("content/resources/data/items.csv")


def _load_rows():
    """Load CSV rows."""
    with open(ITEMS_CSV, 'r', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def test_csv_row_count():
    """CSV must have exactly 27 data rows."""
    rows = _load_rows()
    assert len(rows) == 27, f"Expected 27 rows, found {len(rows)}"


def test_csv_has_required_columns():
    """CSV must have required column headers."""
    rows = _load_rows()
    required = {'Construct', 'Item', 'Angepasstes_Item'}
    actual = set(rows[0].keys())
    assert actual == required, f"Expected {required}, found {actual}"


def test_no_empty_constructs():
    """All rows must have a construct value."""
    for i, row in enumerate(_load_rows(), start=2):
        assert row['Construct'].strip(), f"Row {i} has empty Construct"


def test_no_empty_items():
    """All rows must have an item value."""
    for i, row in enumerate(_load_rows(), start=2):
        assert row['Item'].strip(), f"Row {i} has empty Item"


def test_adapted_items_completeness():
    """Adapted items must be '-' or reasonable length (>= 20 chars)."""
    for i, row in enumerate(_load_rows(), start=2):
        adapted = row['Angepasstes_Item'].strip()
        if adapted != '-':
            assert len(adapted) >= 20, \
                f"Row {i} ({row['Construct']}): Adapted item too short: '{adapted}'"


def test_adapted_items_count():
    """Must have exactly 18 adapted items (non-dash entries)."""
    rows = _load_rows()
    count = sum(1 for row in rows if row['Angepasstes_Item'].strip() != '-')
    assert count == 18, f"Expected 18 adapted items, found {count}"


def test_no_truncated_text():
    """Items with commas must be properly preserved."""
    rows = _load_rows()
    assert 'wie ich es brauche' in rows[5]['Item']
    assert 'wie ich es brauche' in rows[5]['Angepasstes_Item']
    assert 'ChatGPT' in rows[21]['Angepasstes_Item']
    assert 'Copilot' in rows[21]['Angepasstes_Item']
    assert 'Gemini' in rows[21]['Angepasstes_Item']


def test_specific_constructs_present():
    """All expected constructs must be present."""
    rows = _load_rows()
    expected = {'Treatment Check', 'PUF', 'EOU', 'BI', 'XAIT', 'FAM-TEC', 'CI'}
    actual = set(row['Construct'] for row in rows)
    assert expected.issubset(actual), f"Missing constructs: {expected - actual}"

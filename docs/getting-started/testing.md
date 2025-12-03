# Running Tests

Verify document integrity and code quality with the automated test suite.

## Quick Test

Run all tests:

```bash
python -m pytest tests/ -v
```

Or run individual test files:

```bash
python tests/test_citations.py
```

## Test Categories

### Structure Tests

Verify LaTeX document structure.

```bash
python tests/test_structure.py
```

**Checks**:
- APA7 document class usage
- Proper document structure

### Citation Tests

Ensure citations match bibliography.

```bash
python tests/test_citations.py
```

**Checks**:
- All `\parencite` and `\textcite` references exist in `.bib`
- No missing citations
- Zotero sync status

### Bibliography Tests

Validate bibliography entries.

```bash
python tests/test_bibliography_counts.py
```

**Checks**:
- Minimum entry count met
- `.bib` file format validity

### Formatting Tests

Check formatting rules compliance.

```bash
python tests/test_formatting_rules.py
```

**Checks**:
- Heading structure
- Content guidelines
- APA formatting rules

### Formal Guidelines Tests

Verify required sections exist.

```bash
python tests/test_formal_guidelines.py
```

**Checks**:
- All required chapters present
- Section ordering correct

## Document Verification

After building, verify TOC/LOF/LOT/Bibliography:

```bash
python scripts/check_toc.py content/prestudy
```

**Output**:
```
Success: TOC verified.
Success: LOF verified.
Success: LOT verified.
Success: Bibliography verified.
All checks passed!
```

## CI/CD Testing

Tests run automatically on GitHub Actions:

- Triggered on every push
- Must pass before merge
- Results visible in PR checks

## Writing Tests

When adding new features, add corresponding tests:

1. Create test file in `tests/`
2. Follow naming convention: `test_*.py`
3. Use `unittest.TestCase` class
4. Document test purpose in docstring

See [Tests API Reference](../api/tests.md) for implementation details.

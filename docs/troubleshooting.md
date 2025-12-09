# Troubleshooting

Common issues and solutions for building your thesis.

## Build Errors

### U+200E Character Error

**Symptom**: LaTeX compilation fails with unicode character error in bibliography

```
! Package inputenc Error: Unicode character U+200E (inputenc) not set up for use with LaTeX.
```

**Cause**: Hidden Left-to-Right Mark (U+200E) characters in bibliography file

**Solution**: Run the sanitize script (automatically run during build):
```bash
python scripts/sanitize_bib.py
```

### Bibliography Not Showing

**Symptom**: Empty "Quellenverzeichnis" section or missing citations

**Solutions**:

1. Ensure complete compilation cycle:
   ```bash
   cd content/prestudy
   latexmk -C  # Clean all artifacts
   latexmk -pdf main.tex  # Full rebuild
   ```

2. Clear Biber cache:
   ```bash
   rm -rf $(biber --cache)
   ```

3. Verify bibliography file exists:
   ```bash
   ls -l content/resources/bibliography.bib
   ```

### Missing LaTeX Packages

**Symptom**: `LaTeX Error: File 'X.sty' not found`

**Solution**: Install missing package via tlmgr
```bash
sudo tlmgr install package-name
```

Common packages:
- `apa7` - APA 7th edition formatting
- `biblatex` - Bibliography management
- `babel` - Language support

### Build Script Fails

**Symptom**: `./scripts/build.sh: Permission denied`

**Solution**: Make script executable
```bash
chmod +x scripts/build.sh
```

## Test Failures

### Citation Tests Fail

**Issue**: `test_citations.py` reports missing citations

**Check**:
1. Bibliography is synced:
   ```bash
   ls -l content/resources/bibliography.bib
   python scripts/sync_zotero.py
   ```

2. All citations use correct keys:
   ```bash
   python scripts/check_unused_citations.py
   ```

### Bibliography Count Test Fails

**Issue**: `test_bibliography_counts.py` fails with insufficient citation count

**Solution**: Ensure minimum citation requirements are met. The test checks that enough sources are cited in the document.

### Structure Test Fails

**Issue**: `test_structure.py` reports APA7 class not found

**Check**: Ensure APA7 class is in place:
```bash
ls -l content/lib/apa7/apa7.cls
```

## Zotero Sync Issues

### SSL Certificate Error

**Symptom**: Certificate verification fails when syncing

**Solution**: The script already uses curl for better SSL handling. Ensure curl is installed:
```bash
which curl
```

### Collection Not Found

**Symptom**: Sync returns empty or missing collections

**Check**: Verify collection IDs in `scripts/sync_zotero.py` match your Zotero setup:
1. Go to your Zotero library in browser
2. Navigate to collection
3. Check URL: `https://www.zotero.org/groups/XXX/collections/COLLECTION_ID`

### API Key Issues

**Symptom**: Unauthorized or authentication errors

**Solution**:
1. Verify `.env` file exists with correct credentials
2. Check API key permissions at: https://www.zotero.org/settings/keys
3. Ensure key has read access to your library

## Python Dependency Issues

### ModuleNotFoundError: bibtexparser

**Symptom**: Import errors when running scripts or tests

**Solution**: Install dependencies:
```bash
pip install -r requirements-dev.txt
```

### Ruff Not Found

**Symptom**: Linting fails with "ruff: command not found"

**Solution**:
```bash
pip install ruff
# or
pip install -r requirements-dev.txt
```

## Performance Issues

### Build Takes Too Long

**Typical build time**: 2-3 minutes locally, 4-6 minutes in CI

**Optimization tips**:
1. Use latexmk without full clean:
   ```bash
   latexmk -pdf main.tex  # Skip the -C flag
   ```

2. Build only required document:
   ```bash
   ./scripts/build.sh --prestudy  # Instead of --all
   ```

3. Clear only problematic artifacts:
   ```bash
   rm -f *.aux *.bbl *.bcf
   ```

### Out of Memory Errors

**Symptom**: LaTeX compilation runs out of memory

**Solution**: Increase LaTeX memory limits in `~/.latexmkrc`:
```perl
$ENV{max_print_line} = 1000;
```

## Git Issues

### Large Repository Size

**Symptom**: Repository >100MB, slow clone/push

**Cause**: Build artifacts committed to history

**Solution**: Use BFG Repo-Cleaner or git filter-repo (advanced)
```bash
# WARNING: Rewrites history
git filter-repo --path content/prestudy/sections/*.pdf --invert-paths
```

### Merge Conflicts in PDFs

**Symptom**: Binary merge conflicts in generated PDFs

**Solution**: PDFs should be in `.gitignore`. Keep only final versions:
```bash
git checkout --ours content/prestudy/main.pdf
git add content/prestudy/main.pdf
```

## Getting Help

If you encounter issues not covered here:

1. Check recent commit messages for similar fixes
2. Review CI/CD logs in GitHub Actions
3. Consult LaTeX error logs in `content/prestudy/*.log`
4. Check MkDocs documentation at: https://[your-username].github.io/bachelor-thesis/

For project-specific issues, create a GitHub issue with:
- Error message
- Steps to reproduce
- System information (`uname -a`, `pdflatex --version`)

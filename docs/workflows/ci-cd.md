# CI/CD Pipeline

Overview of the automated workflows powering the thesis build system.

## Workflows

### LaTeX Build (`latex-build.yml`)

Automatically builds PDFs on every push to `main`.

**Triggers**:
- Push to `main` or `master` branch
- Pull requests

**Jobs**:

1. **lint_python** - Code quality checks with Ruff
2. **test_structure** - Verify LaTeX document structure
3. **test_citations** - Validate citations match bibliography
4. **test_formal_guidelines** - Check required sections
5. **test_formatting** - Formatting rules compliance
6. **test_bibliography_counts** - Bibliography validation
7. **build_latex** - Compile PDFs and deploy

**Build Process**:
```yaml
1. Install minimal TeX Live packages (~5-8 min)
   - texlive-latex-base, -extra, -bibtex-extra
   - texlive-publishers (apa7), -lang-german
   - biber, latexmk

2. Sync Zotero references (if secrets available)

3. Generate survey item tables

4. Build LaTeX documents (~2 min)
   - main.pdf (full version with abstract)
   - main_required.pdf (required sections only)

5. Verify outputs
   - Check PDFs exist
   - Validate TOC, LOF, LOT, Bibliography

6. Upload artifacts & create release
```

**Total Time**: ~7-10 minutes

### Documentation Deploy (`docs.yml`)

Auto-deploys this documentation to GitHub Pages.

**Triggers**:
- Changes to `scripts/`, `tests/`, `docs/`, or config files
- Manual workflow dispatch

**Process**:
```yaml
1. Install MkDocs and dependencies
2. Build documentation (mkdocs build)
3. Deploy to gh-pages branch
4. GitHub Pages serves at URL
```

**Total Time**: ~1-2 minutes

## Artifacts & Releases

### PDF Artifacts

On successful builds, PDFs are uploaded as workflow artifacts:

- `main.pdf` - Full prestudy with abstract (27 pages)
- `main_required.pdf` - Required sections only (25 pages)

Download from: Actions → Workflow run → Artifacts

### Automatic Releases

Builds on `main` branch create GitHub releases:

- **Tag**: `build-{run_number}`
- **Name**: Commit message
- **Assets**: Both PDF files

## Secrets & Environment Variables

The workflows use these secrets (configured in GitHub repo settings):

### Required for Bibliography Sync
- `ZOTERO_API_KEY` - Zotero API authentication
- `ZOTERO_USER_ID` - Zotero user/group ID

### Auto-Provided by GitHub
- `GITHUB_TOKEN` - Workflow permissions

!!! warning "Security"
    Zotero sync is optional. Builds work without these secrets using the committed `.bib` file.
    Never commit API keys to the repository.

## Monitoring Builds

### View Workflow Runs

1. Go to [Actions tab](https://github.com/mrryf/bachelor-thesis/actions)
2. Click on a workflow run
3. Expand jobs to see detailed logs

### Build Status Badge

Add to README.md:
```markdown
![Build Status](https://github.com/mrryf/bachelor-thesis/actions/workflows/latex-build.yml/badge.svg)
```

## Troubleshooting CI Failures

### Missing LaTeX Packages

**Symptom**: `LaTeX Error: File 'X.sty' not found`

**Fix**: Add package to `.github/workflows/latex-build.yml`:
```yaml
sudo apt-get install -y \
  texlive-<package-collection>
```

### Bibliography Empty

**Symptom**: Quellenverzeichnis section is blank

**Solution**: Ensure biber runs in compilation cycle (latexmk handles this automatically)

### Tests Failing

**Symptom**: Test job fails in CI but passes locally

**Possible causes**:
- Different Python/LaTeX versions
- Missing dependencies
- Path differences

Check the test logs in GitHub Actions for specific errors.

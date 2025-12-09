# Configuration

Configuration guide for the bachelor thesis project.

## Environment Variables

### Zotero Integration

For bibliography synchronization, create a `.env` file in the project root:

```bash
# .env (DO NOT COMMIT THIS FILE)
ZOTERO_API_KEY=your_api_key_here
ZOTERO_USER_ID=your_user_id_here
```

#### Getting Zotero Credentials

1. **API Key**: Visit https://www.zotero.org/settings/keys
   - Click "Create new private key"
   - Give it a descriptive name (e.g., "Bachelor Thesis Sync")
   - Enable "Allow library access" with read permission
   - Copy the generated key

2. **User ID**: Found in your Zotero profile URL
   - Visit your Zotero library: https://www.zotero.org/
   - Your User ID is in the URL: `https://www.zotero.org/users/YOUR_USER_ID`

#### Collection IDs

Currently configured collections (in `scripts/sync_zotero.py`):
- `5CCCD4LW`: Bachelor Thesis (Parent)
- `6ABWTZEP`: Bachelor Thesis / 02_Prestudy
- `X6YTQVV3`: Bachelor Thesis / 01_research

To change collections:
1. Navigate to your collection in Zotero web
2. Get collection ID from URL: `https://www.zotero.org/.../collections/COLLECTION_ID`
3. Update `ZOTERO_COLLECTION_IDS` in `scripts/sync_zotero.py`

### Security Notes

- `.env` is automatically git-ignored
- **Never commit API keys** to the repository
- Bibliography syncing is optional - pre-generated `.bib` file is committed
- Use GitHub Secrets for CI/CD (already configured)

## LaTeX Configuration

### Document Class

This project uses the **APA7 document class** for academic formatting.

Location: `content/lib/apa7/`

### Required LaTeX Packages

The following packages are required (automatically installed via texlive):

- **apa7** - APA 7th edition document formatting
- **babel** (ngerman) - German language support
- **biblatex** with biber backend - Bibliography management
- **subfiles** - Modular document structure
- **graphicx** - Image handling
- **hyperref** - PDF hyperlinks
- **booktabs**, **tabularx** - Table formatting

### Environment Variables (Build)

The build script automatically sets:

```bash
TEXINPUTS="$PROJECT_ROOT/content/lib//:$PROJECT_ROOT/content/resources//:..."
BIBINPUTS="$PROJECT_ROOT/content/resources//:"
```

These allow LaTeX to find:
- Custom class files in `content/lib/`
- Images in `content/resources/images/`
- Bibliography in `content/resources/`

### Custom LaTeX Configuration

To customize LaTeX behavior, edit the preamble in:
- `content/prestudy/main.tex` (lines 1-30)
- `content/thesis/main.tex` (lines 1-25)

## Build Configuration

### Build Script Options

Available options for `scripts/build.sh`:

```bash
./scripts/build.sh [OPTIONS]

Options:
  --prestudy    Build prestudy document only (default)
  --thesis      Build thesis document only
  --all         Build both prestudy and thesis
  --help        Show help message
```

### Makefile Targets

Quick reference for `make` commands:

```bash
make install      # Install dependencies
make test         # Run all tests
make lint         # Run code linting
make build        # Build prestudy
make build-all    # Build both documents
make clean        # Remove artifacts
make docs         # Serve documentation
make sync-zotero  # Sync bibliography
make ci           # Run full CI pipeline locally
```

## Data Configuration

### Survey Items CSV

Location: `content/resources/data/items.csv`

Required columns:
- `Construct` - Research construct (e.g., PUF, EOU, BI, XAIT)
- `Item_Original` - Original survey item text
- `Item_Adapted` - Adapted version (use `-` if unchanged)
- `Scaling` - Measurement scale (e.g., "1-5 Likert-Skala")
- `Source` - Citation source (e.g., "Ibrahim et al. (2025)")

Tables are automatically generated to: `content/resources/tables/`

## CI/CD Configuration

### GitHub Actions

Workflows are defined in `.github/workflows/`:

- **latex-build.yml** - Main build pipeline
  - Runs on: push to main, pull requests
  - Steps: lint → test → build → release
  - Artifacts: PDF files, 14-day retention

- **docs.yml** - Documentation deployment
  - Runs on: docs/, scripts/, tests/ changes
  - Deploys to: GitHub Pages

### Secrets Configuration

Required GitHub Secrets (already configured):
- `ZOTERO_API_KEY` - For bibliography sync in CI
- `ZOTERO_USER_ID` - For bibliography sync in CI
- `GITHUB_TOKEN` - Automatic, for releases

To update secrets:
1. Go to: Settings → Secrets and variables → Actions
2. Update/add secrets as needed

## Python Configuration

### Virtual Environment

Recommended setup:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
```

### Linting Configuration

Ruff is used for Python linting. Configuration in `pyproject.toml` (if added) or use defaults.

Run linting:
```bash
ruff check .
ruff check . --fix  # Auto-fix issues
```

## IDE Configuration

### VS Code

Recommended settings (`.vscode/settings.json.example`):

```json
{
  "latex-workshop.view.pdf.viewer": "tab",
  "latex-workshop.latex.autoBuild.run": "never",
  "[python]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  }
}
```

Recommended extensions (`.vscode/extensions.json`):
- James-Yu.latex-workshop
- ms-python.python
- ms-python.vscode-pylance

### Other IDEs

Configuration files for other IDEs are gitignored. Create your own:
- `.idea/` for JetBrains IDEs
- `.vscode/` for VS Code (add to .gitignore if needed)

## Troubleshooting Configuration Issues

See the [Troubleshooting Guide](troubleshooting.md) for common configuration problems and solutions.

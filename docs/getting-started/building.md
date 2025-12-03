# Building the Thesis

Learn how to compile the LaTeX documents into PDFs.

## Quick Build

The fastest way to build the prestudy document:

```bash
./scripts/build.sh --prestudy
```

Output: `content/prestudy/main.pdf` and `content/prestudy/main_required.pdf`

## Build Options

The build script supports selective compilation:

```bash
# Build only the prestudy (default)
./scripts/build.sh --prestudy

# Build only the main thesis
./scripts/build.sh --thesis

# Build everything
./scripts/build.sh --all
```

## Build Process

The build script performs these steps:

1. **Generate Survey Tables** - Creates LaTeX tables from CSV data
2. **Clean Artifacts** - Removes previous build files
3. **Compile LaTeX** - Runs `latexmk` with bibliography processing
4. **Verify Output** - Checks that PDFs were generated

## Manual Building

If you need more control, compile documents manually:

```bash
cd content/prestudy
latexmk -pdf main.tex
```

This runs the full LaTeX compilation cycle including:
- Multiple pdflatex passes
- Biber for bibliography
- Reference updates

## Troubleshooting

### Missing Packages

**Error**: `LaTeX Error: File 'apa7.cls' not found`

**Solution**: Install missing TeX Live package
```bash
# macOS/Linux with tlmgr
sudo tlmgr install apa7

# Ubuntu/Debian
sudo apt-get install texlive-publishers
```

### Bibliography Not Showing

**Error**: Empty "Quellenverzeichnis" (bibliography)

**Solution**: Ensure complete compilation cycle
```bash
cd content/prestudy
latexmk -C  # Clean
latexmk -pdf main.tex  # Full rebuild
```

### Build Takes Too Long

The first build may take longer as LaTeX downloads fonts and generates auxiliary files. Subsequent builds are faster.

## CI/CD Builds

GitHub Actions automatically builds on every push to `main`:

- Build time: ~7-10 minutes
- Artifacts: PDFs uploaded to workflow artifacts
- Releases: Auto-created with build number tag

See [CI/CD Pipeline](../workflows/ci-cd.md) for details.

## Next Steps

- [Running Tests](testing.md) - Verify the built documents
- [Contributing](../contributing.md) - Make changes to the thesis

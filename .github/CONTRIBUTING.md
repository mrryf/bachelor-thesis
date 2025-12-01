# Contributing to Bachelor Thesis Project

This document outlines the development workflow, branching strategy, and contribution guidelines for this project.

## Branching Strategy

We follow **GitHub Flow** - a simplified branching model suitable for academic projects with continuous integration.

### Branch Types

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features or enhancements | `feature/add-survey-analysis` |
| `fix/` | Bug fixes | `fix/citation-formatting` |
| `hotfix/` | Urgent production fixes | `hotfix/broken-build` |
| `refactor/` | Code refactoring | `refactor/shared-bibliography` |
| `docs/` | Documentation updates | `docs/update-readme` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `test/` | Test additions or fixes | `test/add-bibliography-validation` |

### Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with atomic commits

3. **Test locally**:
   ```bash
   ./scripts/build.sh content/prestudy
   python tests/test_bibliography_counts.py
   python tests/test_citations.py
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Merge to main** (after CI passes):
   ```bash
   git checkout main
   git merge feature/your-feature-name
   git push origin main
   ```

6. **Clean up**:
   ```bash
   git branch -d feature/your-feature-name
   ```

## Commit Message Convention

We use **Conventional Commits** for clear, structured commit history.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring without behavior change
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies, CI config
- `perf`: Performance improvements

### Examples

```bash
feat(prestudy): add methodology section
fix(tests): update bibliography path after refactor
docs(readme): add build instructions
refactor(bibliography): move to shared location
chore(ci): make bibliography test fail build
test(citations): add validation for missing references
```

### Scope Guidelines

- `prestudy` - Changes to prestudy content
- `thesis` - Changes to thesis content
- `tests` - Test-related changes
- `ci` - CI/CD workflow changes
- `scripts` - Build or utility scripts
- `docs` - Documentation

## Code Quality Standards

### Before Committing

1. **Run linting**:
   ```bash
   ruff check .
   ```

2. **Run tests**:
   ```bash
   python tests/test_structure.py
   python tests/test_citations.py
   python tests/test_bibliography_counts.py
   python tests/test_formatting_rules.py
   python tests/test_formal_guidelines.py
   ```

3. **Build locally**:
   ```bash
   ./scripts/build.sh content/prestudy
   ```

4. **Verify artifacts**:
   ```bash
   python scripts/check_toc.py content/prestudy
   ```

### LaTeX Guidelines

- Use `\parencite{}` for parenthetical citations
- Use `\textcite{}` for narrative citations
- Keep lines under 120 characters where possible
- Use semantic line breaks (one sentence per line)

### Python Guidelines

- Follow PEP 8 style guide
- Use type hints where applicable
- Keep functions focused and testable
- Add docstrings to public functions

## Project Structure

```
bachelor-thesis/
├── content/
│   ├── prestudy/          # Prestudy LaTeX files
│   ├── thesis/            # Thesis LaTeX files (future)
│   ├── resources/         # Shared resources
│   │   └── bibliography.bib
│   └── lib/               # Shared LaTeX packages
├── scripts/               # Build and utility scripts
├── tests/                 # Test suite
└── .github/
    └── workflows/         # CI/CD configuration
```

## CI/CD Pipeline

All pushes to `main` trigger:

1. **Linting** - Python code quality checks
2. **Structure Tests** - Verify project structure
3. **Citation Tests** - Validate bibliography consistency
4. **Formal Guidelines** - Check LaTeX formatting
5. **Bibliography Counts** - Verify citation completeness (BLOCKING)
6. **LaTeX Build** - Compile PDFs
7. **Artifact Upload** - Store generated PDFs
8. **Release Creation** - Tag and release on main

### Important Notes

- **Bibliography count test is blocking** - build will fail if citations are incomplete
- All other tests must pass before merging
- PDFs are automatically generated and released

## Getting Help

- Check existing issues and documentation
- Review test failures in CI logs
- Consult the README.md for build instructions

## Quick Reference

```bash
# Start new feature
git checkout -b feature/my-feature

# Build and test
./scripts/build.sh content/prestudy
python -m pytest tests/

# Commit with convention
git commit -m "feat(prestudy): add new analysis section"

# Push and merge
git push origin feature/my-feature
git checkout main && git merge feature/my-feature
git push origin main

# Cleanup
git branch -d feature/my-feature
```

# Contributing

Thank you for your interest in contributing to this project!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Create a feature branch: `git checkout -b feature/your-feature`

## Making Changes

### Documentation

- Edit files in `docs/` directory
- Use Markdown format
- Test locally: `mkdocs serve`
- View at http://127.0.0.1:8000

### Python Scripts

- Follow PEP 8 style guide
- Add docstrings (Google style)
- Run linter: `ruff check .`
- Add tests for new features

### LaTeX Content

- Use APA 7 formatting  
- Compile locally before pushing
- Run verification: `python scripts/check_toc.py content/prestudy`

## Testing

Before committing, ensure all tests pass:

```bash
# Run all tests
python -m pytest tests/ -v

# Run specific test
python tests/test_citations.py

# Lint Python code
ruff check .
```

## Committing

### Commit Message Format

```
<type>: <subject>

<body>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

**Example**:
```
feat: Add table generation for new survey construct

- Extract items from updated CSV
- Generate LaTeX table with proper formatting
- Update documentation
```

## Pull Requests

1. Push your branch to GitHub
2. Create pull request against `main`
3. Wait for CI checks to pass
4. Address any review comments

### PR Checklist

- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear
- [ ] No merge conflicts with `main`

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Questions?

Open an issue or reach out to the project maintainer.

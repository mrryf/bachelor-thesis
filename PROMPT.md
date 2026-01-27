# LaTeX Build Recovery

Build the prestudy document and fix any compilation errors.

## Build Command

```bash
./scripts/build.sh --prestudy
```

## Common Fixes

- **Missing package**: Add `\usepackage{package}` to preamble
- **Undefined reference**: Check `\label{}` exists for the reference
- **Missing citation**: Run `make sync-zotero` to update bibliography
- **Missing file**: Fix `\input{}` or `\include{}` path
- **Unicode errors**: Ensure UTF-8 encoding and proper escaping
- **Font issues**: Check fontspec configuration for custom fonts

## LaTeX Error Patterns

| Error | Likely Fix |
|-------|-----------|
| `Undefined control sequence` | Missing package or typo in command |
| `File not found` | Wrong path in \input or \includegraphics |
| `Citation undefined` | Run sync-zotero or check BibTeX key |
| `Missing $ inserted` | Math mode issue - wrap in $...$ |
| `Overfull hbox` | Reword or use \sloppy locally |

## Verification

After successful build:
1. PDF exists at `content/prestudy/main.pdf`
2. Run `make test` for structure tests

## Completion Signal

Output exactly "DONE" when:
1. Build completes without errors
2. PDF exists at `content/prestudy/main.pdf`
3. `make test` passes

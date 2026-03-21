# Bachelor Thesis — Trust in AI / LLM Framing

Quantitative study (N~200) on how framing affects trust in LLM-based applications.
German-language academic writing. APA7 format. Supervisor: Dr. Andreas Hüsser, HSLU.

## Project Structure

- content/thesis/ — LaTeX thesis (main.tex + sections/)
- ~/develop/notes/thesis/ — MD source of truth for prose (Obsidian, private repo)
- content/prestudy/ — Frozen prestudy (submitted Dec 2025)
- content/resources/ — Shared bibliography, images, data
- content/lib/apa7/ — Vendored APA7 package
- scripts/ — Build and sync scripts
- tests/ — pytest test suite
- webapp/ — SvelteKit survey app (separate concern)
- apps/research-config-manager/ — Electron app (separate concern)

## Environment

- Python 3.13 venv at .venv/ (activate: source .venv/bin/activate)
- TeX Live 2025 (local), texlive-full Docker (CI)
- pyenv for version management

## Build & Test

- Build thesis: ./scripts/build.sh --thesis
- Build prestudy: ./scripts/build.sh --prestudy
- Run tests: make test (or .venv/bin/pytest tests/)
- Lint: make lint
- Sync bibliography: make sync-zotero
- LaTeX lint: make chktex
- Bib validate: make bib-validate

## Content Authoring (Two-Repo Model)

- Write prose in ~/develop/notes/thesis/\*.md (Obsidian vault, private repo)
- Generate .tex: /content-sync [section-name]
- Visual elements use %% VISUAL-START/END markers in .tex
- MD is source of truth for prose; .tex is derivative
- NEVER edit prose in .tex directly — it will be overwritten on next sync
- LaTeX-native sections (no MD source) are managed directly in .tex

## Key Skills

- /latex-build — Compile and verify thesis
- /latex-review — Document quality review (mechanics + structure agents)
- /zotero-sync — Sync bibliography from Zotero
- /content-sync — MD→LaTeX generation

## Citation Convention

- Parenthetical: \parencite{key} (not \cite{})
- Narrative: \textcite{key}
- Always: non-breaking space ~ before \ref{}, \parencite{}, \textcite{}

.PHONY: help install test lint build build-all clean sync-zotero generate-tables chktex bib-validate electron-test electron-build electron-dev ci

.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Bachelor Thesis Build System"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all development dependencies
	python3 -m pip install --upgrade pip
	pip install -r requirements-dev.txt

test: ## Run all tests
	@echo "Running structure tests..."
	python3 tests/test_structure.py
	@echo "Running citation tests..."
	python3 tests/test_citations.py
	@echo "Running formal guidelines tests..."
	python3 tests/test_formal_guidelines.py
	@echo "Running formatting tests..."
	python3 tests/test_formatting_rules.py
	@echo "Running bibliography tests..."
	python3 tests/test_bibliography_counts.py
	@echo "Running cross-reference tests..."
	python3 tests/test_cross_references.py
	@echo "Running bibliography quality tests..."
	python3 tests/test_bibliography_quality.py
	@echo "✅ All tests passed!"

lint: ## Run code linting with ruff
	ruff check .

build: ## Build thesis LaTeX document
	./scripts/build.sh --thesis

build-all: ## Build both prestudy and thesis documents
	./scripts/build.sh --all

chktex: ## Run ChkTeX linter on LaTeX sources
	@echo "Running ChkTeX on prestudy..."
	-chktex -q content/prestudy/main.tex
	@if [ -d "content/thesis" ] && [ -f "content/thesis/main.tex" ]; then \
		echo "Running ChkTeX on thesis..."; \
		chktex -q content/thesis/main.tex; \
	fi
	@echo "ChkTeX complete."

bib-validate: ## Validate bibliography against biblatex data model
	@echo "Validating bibliography..."
	biber --tool --validate-datamodel content/resources/bibliography.bib
	@echo "Bibliography validation complete."

clean: ## Remove build artifacts and cache files
	@echo "Cleaning build artifacts..."
	find content/ -type f -name "*.aux" -delete
	find content/ -type f -name "*.log" -delete
	find content/ -type f -name "*.out" -delete
	find content/ -type f -name "*.toc" -delete
	find content/ -type f -name "*.lof" -delete
	find content/ -type f -name "*.lot" -delete
	find content/ -type f -name "*.bbl" -delete
	find content/ -type f -name "*.bcf" -delete
	find content/ -type f -name "*.blg" -delete
	find content/ -type f -name "*.fls" -delete
	find content/ -type f -name "*.fdb_latexmk" -delete
	find content/ -type f -name "*.synctex.gz" -delete
	find content/ -type f -name "*.run.xml" -delete
	find content/*/sections -type f -name "*.pdf" -delete 2>/dev/null || true
	rm -rf .pytest_cache .ruff_cache __pycache__
	@echo "✅ Cleanup complete!"

sync-zotero: ## Sync bibliography from Zotero
	python3 scripts/sync_zotero.py

generate-tables: ## Generate LaTeX tables from items.csv
	python3 scripts/generate_item_tables.py

electron-test: ## Run Electron app tests
	cd apps/research-config-manager && npm test

electron-build: ## Build Electron app
	cd apps/research-config-manager && npm run build

electron-dev: ## Run Electron app in dev mode
	cd apps/research-config-manager && npm run dev

ci: lint chktex bib-validate test electron-test ## Run full CI pipeline locally
	@echo "✅ All CI checks passed!"

.PHONY: help install test lint build build-all clean docs docs-build sync-zotero generate-tables ci

.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Bachelor Thesis Build System"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all development dependencies
	python -m pip install --upgrade pip
	pip install -r requirements-dev.txt

test: ## Run all tests
	@echo "Running structure tests..."
	python tests/test_structure.py
	@echo "Running citation tests..."
	python tests/test_citations.py
	@echo "Running formal guidelines tests..."
	python tests/test_formal_guidelines.py
	@echo "Running formatting tests..."
	python tests/test_formatting_rules.py
	@echo "Running bibliography tests..."
	python tests/test_bibliography_counts.py
	@echo "✅ All tests passed!"

lint: ## Run code linting with ruff
	ruff check .

build: ## Build prestudy LaTeX document
	./scripts/build.sh --prestudy

build-all: ## Build both prestudy and thesis documents
	./scripts/build.sh --all

clean: ## Remove build artifacts and cache files
	@echo "Cleaning build artifacts..."
	find . -type f -name "*.aux" -delete
	find . -type f -name "*.log" -delete
	find . -type f -name "*.out" -delete
	find . -type f -name "*.toc" -delete
	find . -type f -name "*.lof" -delete
	find . -type f -name "*.lot" -delete
	find . -type f -name "*.bbl" -delete
	find . -type f -name "*.bcf" -delete
	find . -type f -name "*.blg" -delete
	find . -type f -name "*.fls" -delete
	find . -type f -name "*.fdb_latexmk" -delete
	find . -type f -name "*.synctex.gz" -delete
	find . -type f -name "*.run.xml" -delete
	find content/*/sections -type f -name "*.pdf" -delete 2>/dev/null || true
	rm -rf .pytest_cache .ruff_cache __pycache__
	@echo "✅ Cleanup complete!"

docs: ## Build and serve documentation locally
	mkdocs serve

docs-build: ## Build documentation (for deployment)
	mkdocs build --strict

sync-zotero: ## Sync bibliography from Zotero
	python scripts/sync_zotero.py

generate-tables: ## Generate LaTeX tables from items.csv
	python scripts/generate_item_tables.py

ci: lint test ## Run full CI pipeline locally
	@echo "✅ All CI checks passed!"

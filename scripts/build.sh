#!/bin/bash

# Function to show usage
usage() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  --all       Build both Prestudy and Thesis"
    echo "  --prestudy  Build Prestudy (default)"
    echo "  --thesis    Build Thesis"
    echo "  --help      Show this help message"
    exit 1
}

# Parse arguments
BUILD_PRESTUDY=false
BUILD_THESIS=false

if [ $# -eq 0 ]; then
    BUILD_PRESTUDY=true
else
    for arg in "$@"; do
        case $arg in
            --all)
                BUILD_PRESTUDY=true
                BUILD_THESIS=true
                ;;
            --prestudy)
                BUILD_PRESTUDY=true
                ;;
            --thesis)
                BUILD_THESIS=true
                ;;
            --help)
                usage
                ;;
            *)
                echo "Unknown option: $arg"
                usage
                ;;
        esac
    done
fi

# Save current directory
START_DIR=$(pwd)

# Set TEXINPUTS to include the shared lib directory and resources
# Use absolute paths to be safe regardless of where latexmk is run
# We include content/resources/images recursively (//) so \includegraphics finds images
export TEXINPUTS="$START_DIR/content/lib//:$START_DIR/content/resources//:$START_DIR/content/resources/images//:"
export BIBINPUTS="$START_DIR/content/resources//:"

# Generate survey item tables (Global step)
if [ "$SKIP_GEN_TABLES" != "true" ]; then
    echo "Generating survey item tables..."
    python3 scripts/generate_item_tables.py
else
    echo "Skipping survey item table generation (SKIP_GEN_TABLES=true)"
fi

# Sanitize bibliography (remove hidden Unicode characters)
echo "Sanitizing bibliography..."
python3 scripts/sanitize_bib.py

# Function to build a target
build_target() {
    local target_dir=$1
    local target_name=$2

    echo "------------------------------------------------"
    echo "Building $target_name in $target_dir"
    echo "------------------------------------------------"

    if [ ! -d "$target_dir" ]; then
        echo "Error: Directory '$target_dir' does not exist. Skipping."
        return 1
    fi

    cd "$target_dir" || exit 1

    # Clean up previous build artifacts
    latexmk -c
    
    # Clean up section artifacts to ensure fresh builds
    if [ -d "sections" ]; then
        echo "Cleaning section artifacts..."
        rm -f sections/*.aux sections/*.bcf sections/*.bbl sections/*.blg sections/*.log sections/*.run.xml sections/*.toc sections/*.out sections/*.fdb_latexmk sections/*.fls
    fi
    
    # Clear Biber cache to avoid corruption issues
    echo "Clearing Biber cache..."
    rm -rf $(biber --cache)

    # Define files to build
    FILES_TO_BUILD=("main.tex")

    # Check if main_required.tex exists and add it to the list
    if [ -f "main_required.tex" ]; then
        FILES_TO_BUILD+=("main_required.tex")
    fi

    for file in "${FILES_TO_BUILD[@]}"; do
        echo "Building $file..."
        latexmk -pdf -interaction=nonstopmode -file-line-error -outdir=. "$file"
        
        if [ $? -ne 0 ]; then
            echo "Error building $file in $target_name"
            cd "$START_DIR"
            return 1
        fi
    done

    # Note: Individual section PDFs are NOT built separately.
    # Sections are included in main.pdf via subfiles package.
    # Building sections standalone causes citation issues because
    # biber can't find bibliography.bib from the sections/ subdirectory.

    echo "Build of $target_name successful! PDFs are located in $target_dir"
    cd "$START_DIR"
    return 0
}

# Execute builds
EXIT_CODE=0

if [ "$BUILD_PRESTUDY" = true ]; then
    build_target "content/prestudy" "Prestudy"
    if [ $? -ne 0 ]; then EXIT_CODE=1; fi
fi

if [ "$BUILD_THESIS" = true ]; then
    build_target "content/thesis" "Thesis"
    if [ $? -ne 0 ]; then EXIT_CODE=1; fi
fi

exit $EXIT_CODE

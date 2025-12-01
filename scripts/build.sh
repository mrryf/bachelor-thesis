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

# Set TEXINPUTS to include the shared lib directory
# We need absolute path or relative to where we run latexmk
# Since we change dir, let's use absolute path for safety or keep relative ../lib
# The original script used ../lib//: which works if we are in content/prestudy
export TEXINPUTS=../lib//:

# Generate survey item tables (Global step)
echo "Generating survey item tables..."
python3 scripts/generate_item_tables.py

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

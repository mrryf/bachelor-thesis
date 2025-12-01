#!/bin/bash

# Default target is "prestudy"
TARGET_DIR="${1:-prestudy}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Directory '$TARGET_DIR' does not exist."
  echo "Usage: ./scripts/build.sh [directory]"
  exit 1
fi

echo "Building project in: $TARGET_DIR"

# Save current directory
START_DIR=$(pwd)

# cd "$TARGET_DIR" || exit # Do not change directory, use paths relative to root

# Clean up previous build artifacts
latexmk -c

# Define files to build
FILES_TO_BUILD=("main.tex")

# Check if main_required.tex exists and add it to the list
if [ -f "main_required.tex" ]; then
    FILES_TO_BUILD+=("main_required.tex")
fi
# if [ -f "main_required.tex" ]; then
#     FILES_TO_BUILD+=("main_required.tex")
# fi # This block is no longer needed

# Build the main document
echo "Building $TARGET_DIR/main.tex..."
latexmk -pdf -interaction=nonstopmode -file-line-error -outdir="$TARGET_DIR" "$TARGET_DIR/main.tex"

if [ $? -ne 0 ]; then
    echo "Error building $TARGET_DIR/main.tex"
    # Return to start directory before exiting
    cd "$START_DIR"
    exit 1
fi

# Build the required document if it exists
if [ -f "$TARGET_DIR/main_required.tex" ]; then
    echo "Building $TARGET_DIR/main_required.tex..."
    latexmk -pdf -interaction=nonstopmode -file-line-error -outdir="$TARGET_DIR" "$TARGET_DIR/main_required.tex"
    
    if [ $? -ne 0 ]; then
        echo "Error building $TARGET_DIR/main_required.tex"
        # Return to start directory before exiting
        cd "$START_DIR"
        exit 1
    fi
fi

echo "Build successful! PDFs are located in $TARGET_DIR"
# Return to start directory
cd "$START_DIR"
exit 0

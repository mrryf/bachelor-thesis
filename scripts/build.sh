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

cd "$TARGET_DIR" || exit

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
    # Build the PDF
    # -pdf: generate PDF
    # -interaction=nonstopmode: don't stop on errors
    # -file-line-error: show file and line number for errors
    latexmk -pdf -interaction=nonstopmode -file-line-error "$file"
    
    if [ $? -ne 0 ]; then
        echo "Error building $file"
        # Return to start directory before exiting
        cd "$START_DIR"
        exit 1
    fi
done

echo "Build successful! PDFs are located in $TARGET_DIR"
# Return to start directory
cd "$START_DIR"
exit 0

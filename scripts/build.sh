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

# Build the PDF
# -pdf: generate PDF
# -interaction=nonstopmode: don't stop on errors
# -file-line-error: show file and line number for errors
latexmk -pdf -interaction=nonstopmode -file-line-error main.tex

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful! PDF is located at $TARGET_DIR/main.pdf"
    # Return to start directory
    cd "$START_DIR"
    exit 0
else
    echo "Build failed. Check log files for details."
    # Return to start directory
    cd "$START_DIR"
    exit 1
fi

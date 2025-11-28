#!/bin/bash
# Build script for local LaTeX installation

# Attempt to fix PATH using path_helper
eval "$(/usr/libexec/path_helper)"

# Check if pdflatex is installed
if ! command -v pdflatex &> /dev/null; then
    echo "Error: pdflatex could not be found."
    echo ""
    echo "It seems MacTeX was downloaded but not fully installed."
    echo "Please run the installer manually:"
    echo "open /opt/homebrew/Caskroom/mactex/2025.0308/mactex-20250308.pkg"
    echo ""
    echo "After installing, restart your terminal and try again."
    exit 1
fi

# Build the document
pdflatex -interaction=nonstopmode -file-line-error -synctex=1 main.tex

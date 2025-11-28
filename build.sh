#!/bin/bash
# Build script for local LaTeX installation

# Attempt to fix PATH using path_helper
eval "$(/usr/libexec/path_helper)"

# Explicitly add MacTeX path
export PATH="/usr/local/texlive/2025/bin/universal-darwin:$PATH"

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

# Build the main document
echo "Building main.tex..."
latexmk -pdf -interaction=nonstopmode -file-line-error -synctex=1 main.tex

# Build individual sections
echo "Building individual sections..."

# Copy bibliography to sections/ so subfiles can find it
cp bibliography.bib sections/

for file in sections/*.tex; do
    filename=$(basename "$file")
    echo "Building $filename..."
    # Compile the section file. latexmk will handle the dependencies.
    # We use -cd to change directory to the file's location, so ../main.tex is found.
    latexmk -pdf -cd -interaction=nonstopmode -file-line-error -synctex=1 "$file"
done

# Clean up copied bibliography
rm sections/bibliography.bib

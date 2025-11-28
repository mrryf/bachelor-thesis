import os
import sys
import re

def check_file_content(filepath, description):
    """Checks if a file exists and is not empty."""
    if not os.path.exists(filepath):
        print(f"Error: {description} file not found at {filepath}")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read().strip()
        if not content:
            print(f"Error: {description} file is empty.")
            return False
        
        # Check for specific LaTeX empty list indicators if necessary
        # For .toc, .lof, .lot, usually they contain \contentsline if populated.
        if description in ['TOC', 'LOF', 'LOT']:
            if '\\contentsline' not in content:
                 print(f"Warning: {description} file exists but seems to have no entries (no \\contentsline found).")
                 # This might be valid if there are truly no figures/tables, but we flag it.
                 # For now, we might want to return True but warn, or False if strict.
                 # Let's be strict for now as the user wants to check availability.
                 return False

    print(f"Success: {description} verified.")
    return True

def main():
    base_dir = os.getcwd()
    # Assuming build artifacts are in the same directory or sections/
    # The build script runs latexmk in root, so artifacts should be in root or sections/ depending on compilation.
    # We are checking the MAIN document's TOCs.
    
    toc_path = os.path.join(base_dir, 'main.toc')
    lof_path = os.path.join(base_dir, 'main.lof')
    lot_path = os.path.join(base_dir, 'main.lot')
    bbl_path = os.path.join(base_dir, 'main.bbl') # Bibliography

    success = True
    
    if not check_file_content(toc_path, 'TOC'):
        success = False
    
    if not check_file_content(lof_path, 'LOF'):
        success = False
        
    if not check_file_content(lot_path, 'LOT'):
        success = False

    # Check Bibliography
    # .bbl file contains the generated bibliography environment
    if not check_file_content(bbl_path, 'Bibliography'):
        success = False
    else:
        with open(bbl_path, 'r') as f:
            content = f.read()
            if '\\bibitem' not in content and '\\entry' not in content:
                print("Error: Bibliography seems empty (no \\bibitem or \\entry).")
                success = False

    if not success:
        print("Warnings encountered: Some lists (TOC, LOF, LOT, or Bibliography) are missing or empty.")
        # User requested to not fail the build, so we exit with 0.
        sys.exit(0)
    
    print("All checks passed: TOC, LOF, LOT, and Bibliography are present and populated.")

if __name__ == "__main__":
    main()

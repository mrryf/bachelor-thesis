import re
import os
import pytest
import bibtexparser

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS_DIR = os.path.join(PROJECT_ROOT, 'sections')
MAIN_TEX = os.path.join(PROJECT_ROOT, 'main.tex')
BIB_FILE = os.path.join(PROJECT_ROOT, 'resources', 'bibliography.bib')

def get_tex_files():
    tex_files = [MAIN_TEX]
    if os.path.exists(SECTIONS_DIR):
        for f in os.listdir(SECTIONS_DIR):
            if f.endswith('.tex'):
                tex_files.append(os.path.join(SECTIONS_DIR, f))
    return tex_files

def test_apa7_style_applied():
    """Test 1: Check if relevant documents use apa7 style."""
    # We check main.tex as it's the entry point
    with open(MAIN_TEX, 'r') as f:
        content = f.read()
    
    # Check for documentclass apa7
    assert r'\documentclass' in content
    assert '{apa7}' in content or '[apa7]' in content, "main.tex does not appear to use the apa7 document class"

def extract_citations_from_tex(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Regex for \cite{key}, \parencite{key}, \textcite{key}, etc.
    # Matches \command{key} or \command[...]{key} or \command[...][...]{key}
    # Simplified regex to catch content inside {} after a cite command
    
    # This is a basic parser and might need refinement for complex cases
    # It looks for commands containing 'cite' and extracts the argument
    
    citations = set()
    
    # Pattern to find \cite{key}, \parencite{key}, etc.
    # We look for backslash, then some letters ending in cite, then optional brackets, then curly braces
    pattern = re.compile(r'\\([a-zA-Z]*cite[a-zA-Z]*)(?:\[[^\]]*\]){0,2}\{([^}]+)\}')
    
    matches = pattern.findall(content)
    for cmd, keys in matches:
        # keys can be comma separated
        for key in keys.split(','):
            citations.add(key.strip())
            
    return citations

def get_bibliography_keys():
    if not os.path.exists(BIB_FILE):
        return set()
    
    try:
        with open(BIB_FILE, 'r', encoding='utf-8') as bibtex_file:
            bib_database = bibtexparser.load(bibtex_file)
        keys = set(entry['ID'] for entry in bib_database.entries)
    except Exception as e:
        print(f"Warning: bibtexparser failed: {e}. Falling back to regex.")
        keys = set()

    if not keys:
        # Fallback: simple regex to find @article{key, etc.
        with open(BIB_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        # Match @type{key,
        regex_keys = re.findall(r'@\w+\s*\{\s*([^,]+),', content)
        keys = set(k.strip() for k in regex_keys)
        
    return keys

def test_references_consistency():
    """Test 2 & 3: Check consistency between citations and bibliography."""
    
    # 1. Collect all citations from all tex files
    all_citations = set()
    for tex_file in get_tex_files():
        all_citations.update(extract_citations_from_tex(tex_file))
        
    # 2. Collect all keys from bibliography
    bib_keys = get_bibliography_keys()
    
    # Test 2: All citations in text must exist in bibliography
    missing_in_bib = all_citations - bib_keys
    assert not missing_in_bib, f"Citations found in text but missing in bibliography: {missing_in_bib}"
    
    # Test 3: Check removed as per user request (we allow unused entries in bib)
    # unused_in_bib = bib_keys - all_citations
    # assert not unused_in_bib, f"Entries in bibliography but not cited in text: {unused_in_bib}"

if __name__ == "__main__":
    # Manually run tests if executed as script
    try:
        test_apa7_style_applied()
        print("✅ Test 1 Passed: APA7 style applied.")
        test_references_consistency()
        print("✅ Test 2 & 3 Passed: References are consistent.")
    except AssertionError as e:
        print(f"❌ Test Failed: {e}")
        exit(1)
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        exit(1)

import os
import re
try:
    import bibtexparser
    HAS_BIBTEXPARSER = True
except ImportError:
    HAS_BIBTEXPARSER = False

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS_DIR = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'sections')
MAIN_TEX = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'main.tex')
BIB_FILE = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'resources', 'bibliography.bib')

def get_tex_files():
    tex_files = [MAIN_TEX]
    if os.path.exists(SECTIONS_DIR):
        for f in os.listdir(SECTIONS_DIR):
            if f.endswith('.tex'):
                tex_files.append(os.path.join(SECTIONS_DIR, f))
    return tex_files

def extract_citations_from_tex(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    citations = set()
    # Pattern to find \cite{key}, \parencite{key}, \textcite{key} etc.
    pattern = re.compile(r'\\([a-zA-Z]*cite[a-zA-Z]*)(?:\[[^\]]*\]){0,2}\{([^}]+)\}')
    
    matches = pattern.findall(content)
    for cmd, keys in matches:
        for key in keys.split(','):
            citations.add(key.strip())
    return citations

def get_bibliography_keys():
    if not os.path.exists(BIB_FILE):
        return set()
    
    keys = set()
    if HAS_BIBTEXPARSER:
        try:
            with open(BIB_FILE, 'r', encoding='utf-8') as bibtex_file:
                bib_database = bibtexparser.load(bibtex_file)
            keys = set(entry['ID'] for entry in bib_database.entries)
        except Exception as e:
            print(f"Warning: bibtexparser failed: {e}. Falling back to regex.")
    
    if not keys:
        # Fallback: simple regex to find @article{key, etc.
        with open(BIB_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        regex_keys = re.findall(r'@\w+\s*\{\s*([^,]+),', content)
        keys = set(k.strip() for k in regex_keys)
        
    return keys

def main():
    print("Analyzing citation usage...")
    
    # 1. Get all citations used in .tex files
    used_citations = set()
    for tex_file in get_tex_files():
        used_citations.update(extract_citations_from_tex(tex_file))
    
    print(f"Found {len(used_citations)} unique citations in the text.")
    
    # 2. Get all keys in bibliography.bib
    bib_keys = get_bibliography_keys()
    print(f"Found {len(bib_keys)} entries in the bibliography.")
    
    # 3. Find unused keys
    unused_keys = bib_keys - used_citations
    
    if unused_keys:
        print(f"\nFound {len(unused_keys)} unused bibliography entries:")
        for key in sorted(unused_keys):
            print(f"- {key}")
    else:
        print("\nGreat news! All bibliography entries are cited in the text.")

if __name__ == "__main__":
    main()
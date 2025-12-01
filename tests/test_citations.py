import re
import os
import unittest
# Try to import bibtexparser, but handle if missing (fallback to regex)
try:
    import bibtexparser
    HAS_BIBTEXPARSER = True
except ImportError:
    HAS_BIBTEXPARSER = False

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS_DIR = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'sections')
# MAIN_TEX = os.path.join(PROJECT_ROOT, 'main.tex')
BIB_FILE = os.path.join(PROJECT_ROOT, 'content', 'resources', 'bibliography.bib')

class TestCitations(unittest.TestCase):

    def setUp(self):
        self.tex_files = []
        for root, dirs, files in os.walk(os.path.join("content", "prestudy")):
            for file in files:
                if file.endswith(".tex"):
                    self.tex_files.append(os.path.join(root, file))
        self.bib_file = os.path.join("content", "resources", "bibliography.bib")

    # def get_tex_files(self):
    #     tex_files = [MAIN_TEX]
    #     if os.path.exists(SECTIONS_DIR):
    #         for f in os.listdir(SECTIONS_DIR):
    #             if f.endswith('.tex') and 'quellenverzeichnis' not in f:
    #                 tex_files.append(os.path.join(SECTIONS_DIR, f))
    #     return tex_files

    def extract_citations_from_tex(self, file_path):
        with open(file_path, 'r') as f:
            content = f.read()
        
        citations = set()
        # Pattern to find \cite{key}, \parencite{key}, etc.
        pattern = re.compile(r'\\([a-zA-Z]*cite[a-zA-Z]*)(?:\[[^\]]*\]){0,2}\{([^}]+)\}')
        
        matches = pattern.findall(content)
        for cmd, keys in matches:
            for key in keys.split(','):
                key = key.strip()
                if key != '*':
                    citations.add(key)
        return citations

    def get_bibliography_keys(self):
        if not os.path.exists(self.bib_file):
            return set()
        
        keys = set()
        if HAS_BIBTEXPARSER:
            try:
                with open(self.bib_file, 'r', encoding='utf-8') as bibtex_file:
                    bib_database = bibtexparser.load(bibtex_file)
                keys = set(entry['ID'] for entry in bib_database.entries)
            except Exception as e:
                print(f"Warning: bibtexparser failed: {e}. Falling back to regex.")
        
        if not keys:
            # Fallback: simple regex to find @article{key, etc.
            with open(self.bib_file, 'r', encoding='utf-8') as f:
                content = f.read()
            regex_keys = re.findall(r'@\w+\s*\{\s*([^,]+),', content)
            keys = set(k.strip() for k in regex_keys)
            
        return keys

    def test_references_consistency(self):
        """Check consistency between citations and bibliography."""
        all_citations = set()
        for tex_file in self.tex_files:
            all_citations.update(self.extract_citations_from_tex(tex_file))
            
        bib_keys = self.get_bibliography_keys()
        
        missing_in_bib = all_citations - bib_keys
        self.assertFalse(missing_in_bib, f"Citations found in text but missing in bibliography: {missing_in_bib}")

if __name__ == "__main__":
    unittest.main()

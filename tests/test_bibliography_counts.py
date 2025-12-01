import os
import re
import unittest
try:
    import bibtexparser
    HAS_BIBTEXPARSER = True
except ImportError:
    HAS_BIBTEXPARSER = False

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS_DIR = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'sections')
MAIN_TEX = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'main.tex')
BIB_FILE = os.path.join(PROJECT_ROOT, 'content', 'resources', 'bibliography.bib')
SHORT_BIB_TEX = os.path.join(SECTIONS_DIR, '10a_quellenverzeichnis_short.tex')
FULL_BIB_TEX = os.path.join(SECTIONS_DIR, '10b_quellenverzeichnis_full.tex')

class TestBibliographyCounts(unittest.TestCase):

    def get_tex_files(self):
        tex_files = [MAIN_TEX]
        if os.path.exists(SECTIONS_DIR):
            for f in os.listdir(SECTIONS_DIR):
                if f.endswith('.tex') and 'quellenverzeichnis' not in f and 'abbildungen' not in f and 'tabellenverzeichnis' not in f:
                    tex_files.append(os.path.join(SECTIONS_DIR, f))
        return tex_files

    def extract_citations_from_tex(self, file_path):
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

    def get_bibliography_keys(self):
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

    def test_bibliography_configuration(self):
        """Verify that short bib is cited-only and full bib is all-inclusive."""
        # Check Short Bibliography (should NOT have \nocite{*})
        if os.path.exists(SHORT_BIB_TEX):
            with open(SHORT_BIB_TEX, 'r') as f:
                content = f.read()
            self.assertNotIn(r'\nocite{*}', content, "Short bibliography should NOT contain \\nocite{*}")
        else:
            self.fail(f"{SHORT_BIB_TEX} not found")

        # Check Full Bibliography (SHOULD have \nocite{*})
        if os.path.exists(FULL_BIB_TEX):
            with open(FULL_BIB_TEX, 'r') as f:
                content = f.read()
            self.assertIn(r'\nocite{*}', content, "Full bibliography MUST contain \\nocite{*}")
        else:
            self.fail(f"{FULL_BIB_TEX} not found")

    def test_citation_counts(self):
        """Calculate and report expected citation counts."""
        # 1. Count citations in text
        used_citations = set()
        for tex_file in self.get_tex_files():
            used_citations.update(self.extract_citations_from_tex(tex_file))
        
        n_cited = len(used_citations)
        print(f"\n[INFO] Unique citations found in text: {n_cited}")
        
        # 2. Count entries in bibliography
        bib_keys = self.get_bibliography_keys()
        n_total = len(bib_keys)
        print(f"[INFO] Total entries in bibliography file: {n_total}")
        
        # 3. Assertions
        self.assertGreater(n_cited, 0, "No citations found in text! Short bibliography will be empty.")
        self.assertGreater(n_total, 0, "Bibliography file is empty!")
        
        print(f"[SUCCESS] Short bibliography will contain {n_cited} entries.")
        print(f"[SUCCESS] Full bibliography will contain {n_total} entries.")

if __name__ == "__main__":
    unittest.main()

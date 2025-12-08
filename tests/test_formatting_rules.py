import unittest
import os

class TestFormattingRules(unittest.TestCase):
    def setUp(self):
        self.main_tex_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'content', 'prestudy', 'main.tex')
        with open(self.main_tex_path, "r", encoding="utf-8") as f:
            self.content = f.read()

    def test_toc_starts_on_new_page(self):
        """
        Test that \tableofcontents is preceded by \newpage.
        """
        # Normalize whitespace to handle potential newlines/spaces

        
        # Check for the pattern. Note: This is a simple check; regex could be more robust but this suffices for "security".
        # We look for \newpage followed closely by \tableofcontents
        # In the file it looks like:
        # \newpage
        # \setcounter{tocdepth}{3}
        # \tableofcontents
        
        # So we check if \newpage appears before \tableofcontents in the relevant block
        toc_index = self.content.find(r"\tableofcontents")
        self.assertNotEqual(toc_index, -1, "Table of Contents not found in main.tex")
        
        # Search backwards from TOC for \newpage
        search_window = self.content[max(0, toc_index - 200):toc_index]
        self.assertIn(r"\newpage", search_window, "Table of Contents does not appear to start on a new page (missing \\newpage before it).")

    def test_bibliography_starts_on_new_page(self):
        """
        Test that the bibliography section is preceded by \newpage.
        """
        # The bibliography is included via \subfile{sections/10a_quellenverzeichnis_short}
        # We look for \newpage before this specific subfile inclusion
        
        bib_include = r"\subfile{sections/10a_quellenverzeichnis_short}"
        bib_index = self.content.find(bib_include)
        
        # If not found, try the full version just in case
        if bib_index == -1:
             bib_include = r"\subfile{sections/10b_quellenverzeichnis_full}"
             bib_index = self.content.find(bib_include)
             
        if bib_index == -1:
             bib_include = r"\subfile{sections_required/10_quellenverzeichnis}"
             bib_index = self.content.find(bib_include)
             
        self.assertNotEqual(bib_index, -1, "Bibliography inclusion not found in main.tex")
        
        # Search backwards from Bib inclusion for \newpage
        search_window = self.content[max(0, bib_index - 200):bib_index]
        self.assertIn(r"\newpage", search_window, "Bibliography does not appear to start on a new page (missing \\newpage before it).")

if __name__ == "__main__":
    unittest.main()

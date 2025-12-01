import os
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_TEX = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'main.tex')

class TestStructure(unittest.TestCase):

    def test_apa7_style_applied(self):
        """Test 1: Check if relevant documents use apa7 style."""
        with open(MAIN_TEX, 'r') as f:
            content = f.read()
        
        self.assertIn(r'\documentclass', content)
        self.assertTrue('{apa7}' in content or '[apa7]' in content, 
                        "main.tex does not appear to use the apa7 document class")

if __name__ == "__main__":
    unittest.main()

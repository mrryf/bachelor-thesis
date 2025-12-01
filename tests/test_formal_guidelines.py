import os
import unittest

class TestFormalGuidelines(unittest.TestCase):
    """
    Checks if the required chapters/sections exist in the 'sections/' directory.
    
    Requirements:
    - 04_ausgangslage.tex OR 01_introduction.tex
    - 02_theory.tex
    - 03_methodology.tex
    - 06_zielsetzung.tex
    - 09_reflection_work.tex
    - 07_working_plan.tex
    """
    
    def test_required_chapters_exist(self):
        sections_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'content', 'prestudy', 'sections')
        
        # List of mandatory files (must exist)
        mandatory_files = [
            '02_theory.tex',
            '03_methodology.tex',
            '06_zielsetzung.tex',
            '09_reflection_work.tex',
            '07_working_plan.tex'
        ]
        
        # Check mandatory files
        for filename in mandatory_files:
            file_path = os.path.join(sections_dir, filename)
            self.assertTrue(os.path.exists(file_path), f"Required file '{filename}' is missing in sections/")

        # Check conditional requirement (OR)
        PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        ausgangslageMAIN_TEX = os.path.join(PROJECT_ROOT, 'content', 'prestudy', 'main.tex')
        introduction = os.path.join(sections_dir, '01_introduction.tex')
        
        self.assertTrue(os.path.exists(ausgangslageMAIN_TEX) or os.path.exists(introduction), 
            "Either 'content/prestudy/main.tex' OR '01_introduction.tex' must exist.")

if __name__ == "__main__":
    unittest.main()

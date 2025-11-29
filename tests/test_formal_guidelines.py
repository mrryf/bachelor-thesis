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
        sections_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sections')
        
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
        ausgangslage = os.path.join(sections_dir, '04_ausgangslage.tex')
        introduction = os.path.join(sections_dir, '01_introduction.tex')
        
        self.assertTrue(os.path.exists(ausgangslage) or os.path.exists(introduction), 
            "Either '04_ausgangslage.tex' OR '01_introduction.tex' must exist.")

if __name__ == "__main__":
    unittest.main()

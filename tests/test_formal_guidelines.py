import os
import pytest

def test_required_chapters_exist():
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
    
    sections_dir = os.path.join(os.path.dirname(__file__), '..', 'sections')
    
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
        assert os.path.exists(file_path), f"Required file '{filename}' is missing in sections/"

    # Check conditional requirement (OR)
    ausgangslage = os.path.join(sections_dir, '04_ausgangslage.tex')
    introduction = os.path.join(sections_dir, '01_introduction.tex')
    
    assert os.path.exists(ausgangslage) or os.path.exists(introduction), \
        "Either '04_ausgangslage.tex' OR '01_introduction.tex' must exist."

if __name__ == "__main__":
    pytest.main([__file__])

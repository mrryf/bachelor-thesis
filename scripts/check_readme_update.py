import os
import sys
import subprocess

def get_changed_files():
    """Get list of changed files in the current commit/PR."""
    try:
        # For pull requests, we want to check against the base branch
        # For pushes, we check the latest commit
        # This simple version checks the last commit
        result = subprocess.run(['git', 'diff', '--name-only', 'HEAD~1', 'HEAD'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.splitlines()
    except subprocess.CalledProcessError:
        print("Warning: Could not determine changed files via git.")
        return []

def check_readme_update():
    changed_files = get_changed_files()
    
    # Define source file extensions that should trigger a README update
    source_extensions = ('.py', '.tex', '.sh', '.yml', '.yaml')
    
    has_source_changes = False
    has_readme_change = False
    
    for f in changed_files:
        if f.endswith(source_extensions):
            has_source_changes = True
        if os.path.basename(f) == 'README.md':
            has_readme_change = True
            
    if has_source_changes and not has_readme_change:
        print("Error: Source files were modified but README.md was not updated.")
        print("Please update the README to reflect your changes.")
        sys.exit(1)
    
    print("Documentation check passed.")
    sys.exit(0)

if __name__ == "__main__":
    check_readme_update()

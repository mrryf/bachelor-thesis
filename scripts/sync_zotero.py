import os
import sys
import subprocess
import getpass
import re

def deduplicate_bibtex(bibtex_content):
    """Remove duplicate entries from bibtex content, keeping the first occurrence."""
    # Pattern to match bibtex entries
    entry_pattern = re.compile(r'(@\w+\{([^,]+),.*?\n\})', re.DOTALL)
    
    seen_keys = set()
    deduplicated_entries = []
    
    for match in entry_pattern.finditer(bibtex_content):
        full_entry = match.group(1)
        entry_key = match.group(2).strip()
        
        if entry_key not in seen_keys:
            seen_keys.add(entry_key)
            deduplicated_entries.append(full_entry)
        else:
            print(f"  Skipping duplicate entry: {entry_key}")
    
    return '\n\n'.join(deduplicated_entries)

def sync_zotero():
    # Load .env if present
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value.strip()

    api_key = os.environ.get('ZOTERO_API_KEY', '').strip()
    user_id = os.environ.get('ZOTERO_USER_ID', '').strip()
    
    # Prompt if missing
    if not api_key:
        api_key = getpass.getpass("Enter your Zotero API Key: ").strip()
    if not user_id:
        user_id = input("Enter your Zotero User ID: ").strip()
        
    if not api_key or not user_id:
        print("Error: ZOTERO_API_KEY or ZOTERO_USER_ID not set.")
        sys.exit(1)

    # List of collection IDs to sync
    # 5CCCD4LW: Bachelor Thesis (Parent)
    # 6ABWTZEP: Bachelor Thesis / 02_Prestudy
    # X6YTQVV3: Bachelor Thesis / 01_ research
    collection_ids = ['5CCCD4LW', '6ABWTZEP', 'X6YTQVV3']
    
    all_items = []

    for col_id in collection_ids:
        print(f"Syncing Zotero collection {col_id}...")
        url = f"https://api.zotero.org/users/{user_id}/collections/{col_id}/items?format=bibtex&limit=100"
        
        try:
            # Use curl instead of urllib/requests to avoid python SSL issues
            result = subprocess.run(
                ['curl', '-s', '-H', f'Zotero-API-Key: {api_key}', url],
                capture_output=True,
                text=True,
                check=True
            )
            data = result.stdout
            if data:
                all_items.append(data)
            else:
                print(f"Warning: No data received for collection {col_id}")
                
        except subprocess.CalledProcessError as e:
            print(f"Error fetching items from collection {col_id}: {e}")
            print(f"Stderr: {e.stderr}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    if not all_items:
        print("No items found in any collection.")
        return

    # Combine all items and deduplicate
    combined_bibtex = '\n'.join(all_items)
    print("Deduplicating bibliography entries...")
    deduplicated_bibtex = deduplicate_bibtex(combined_bibtex)

    # Write to bibliography.bib
    # Define the output file path
    bib_path = os.path.join('content', 'resources', 'bibliography.bib')
    local_bib_path = os.path.join('content', 'resources', 'local.bib')
    
    with open(bib_path, 'w', encoding='utf-8') as f:
        f.write(deduplicated_bibtex)
        f.write("\n")
            
        # Append local bibliography if it exists
        if os.path.exists(local_bib_path):
            print(f"Appending local citations from {local_bib_path}...")
            with open(local_bib_path, 'r', encoding='utf-8') as local_f:
                f.write("\n% Local Citations\n")
                f.write(local_f.read())
                f.write("\n")
            
    print(f"Successfully wrote bibliography to {bib_path}")

if __name__ == "__main__":
    sync_zotero()


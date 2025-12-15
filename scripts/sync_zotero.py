import os
import sys
import subprocess
import getpass
import json
import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode

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
    
    all_bibtex_data = ""

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
                all_bibtex_data += data + "\n"
            else:
                print(f"Warning: No data received for collection {col_id}")
                
        except subprocess.CalledProcessError as e:
            print(f"Error fetching items from collection {col_id}: {e}")
            print(f"Stderr: {e.stderr}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    if not all_bibtex_data:
        print("No items found in any collection.")
        return

    # Parse combined BibTeX data
    print("Parsing and deduplicating bibliography entries...")
    parser = BibTexParser()
    parser.customization = convert_to_unicode
    bib_database = bibtexparser.loads(all_bibtex_data, parser=parser)
    
    # Deduplicate by ID
    unique_entries = {}
    for entry in bib_database.entries:
        if entry['ID'] not in unique_entries:
            unique_entries[entry['ID']] = entry
        else:
             print(f"  Skipping duplicate entry: {entry['ID']}")
    
    deduplicated_entries = list(unique_entries.values())
    bib_database.entries = deduplicated_entries

    # Convert to JSON for webapp FIRST (using Unicode data)
    json_path = os.path.join('webapp', 'src', 'lib', 'data', 'references.json')
    print(f"Converting to JSON at {json_path}...")
    
    references_json = []

    for entry in deduplicated_entries:
        # Prepare entry for JSON
        json_entry = entry.copy()
        
        # Rename 'ID' to 'id'
        json_entry['id'] = json_entry.pop('ID')
        
        # Lowercase type
        if 'ENTRYTYPE' in json_entry:
            json_entry['type'] = json_entry.pop('ENTRYTYPE').lower()
            
        # Handle authors
        authors_list = []
        if 'author' in json_entry:
            authors_str = json_entry.pop('author')
            authors_list = [a.strip() for a in authors_str.split(' and ')]
        elif 'editor' in json_entry:
             # Fallback to editor if no author
            authors_str = json_entry.pop('editor')
            authors_list = [a.strip() for a in authors_str.split(' and ')]
        
        if not authors_list:
            authors_list = ["Unknown"]
            
        json_entry['authors'] = authors_list
            
        # Handle year
        if 'year' in json_entry:
            try:
                json_entry['year'] = int(json_entry['year'])
            except ValueError:
                json_entry['year'] = 0
        elif 'date' in json_entry:
             # Try to extract year from date
             import re
             match = re.search(r'\d{4}', json_entry['date'])
             if match:
                 json_entry['year'] = int(match.group(0))
             else:
                 json_entry['year'] = 0
        else:
            json_entry['year'] = 0

        references_json.append(json_entry)

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(references_json, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated {json_path} with {len(references_json)} items")

    # Now escape for BibTeX and write .bib
    print("Escaping special characters for BibTeX...")
    
    def escape_latex(text):
        if not text:
            return text
        # Escape % and & which are common and break things
        # Also maybe #, _, $
        return text.replace('&', '\\&').replace('%', '\\%').replace('_', '\\_').replace('#', '\\#')

    # Fields to skip escaping (urls, ids, etc)
    skip_fields = ['ID', 'ENTRYTYPE', 'url', 'doi', 'file', 'urldate', 'year', 'month', 'issn', 'isbn']

    for entry in deduplicated_entries:
        for key, value in entry.items():
            if key not in skip_fields and isinstance(value, str):
                entry[key] = escape_latex(value)

    # Write to bibliography.bib
    bib_path = os.path.join('content', 'resources', 'bibliography.bib')
    local_bib_path = os.path.join('content', 'resources', 'local.bib')
    
    with open(bib_path, 'w', encoding='utf-8') as f:
        bibtexparser.dump(bib_database, f)
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

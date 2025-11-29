import os
import sys
import subprocess
import getpass

def sync_zotero():
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

    # Write to bibliography.bib
    bib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'resources', 'bibliography.bib')
    
    with open(bib_path, 'w', encoding='utf-8') as f:
        for item in all_items:
            f.write(item)
            f.write("\n")
            
    print(f"Successfully wrote bibliography to {bib_path}")

if __name__ == "__main__":
    sync_zotero()

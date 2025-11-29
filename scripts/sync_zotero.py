import os
import sys
from pyzotero import zotero

def sync_zotero():
    api_key = os.environ.get('ZOTERO_API_KEY', '').strip()
    user_id = os.environ.get('ZOTERO_USER_ID', '').strip()
    collection_id = '6ABWTZEP' # Bachelor Thesis / 02_Prestudy
    
    if not api_key or not user_id:
        print("Error: ZOTERO_API_KEY or ZOTERO_USER_ID not set.")
        sys.exit(1)
        
    print(f"Syncing Zotero collection {collection_id} for user {user_id}...")
    
    zot = zotero.Zotero(user_id, 'user', api_key)
    
    # Fetch items from collection
    # format='bibtex' returns a list of strings
    try:
        items = zot.collection_items(collection_id, format='bibtex', limit=100)
    except Exception as e:
        print(f"Error fetching items from Zotero: {e}")
        sys.exit(1)
        
    if not items:
        print("No items found in collection.")
        return

    # Write to bibliography.bib
    bib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'resources', 'bibliography.bib')
    
    with open(bib_path, 'w', encoding='utf-8') as f:
        # Check if items is a list (old behavior) or BibDatabase (new behavior)
        if isinstance(items, list):
            for item in items:
                f.write(item)
            print(f"Successfully wrote {len(items)} items to {bib_path}")
        elif hasattr(items, 'entries'):
             # It's a BibDatabase object
            from bibtexparser.bwriter import BibTexWriter
            writer = BibTexWriter()
            f.write(writer.write(items))
            print(f"Successfully wrote {len(items.entries)} items to {bib_path}")
        else:
            print(f"Unexpected type for items: {type(items)}")
            sys.exit(1)

if __name__ == "__main__":
    sync_zotero()

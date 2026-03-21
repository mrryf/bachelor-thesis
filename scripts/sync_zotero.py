import os
import sys
import subprocess
import getpass
import json
import re
import argparse
import urllib.request
import urllib.error
from datetime import datetime
from pathlib import Path
import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode

# Constants
ZOTERO_STORAGE = Path.home() / "Zotero" / "storage"
STATE_FILE = Path(".claude") / "pageindex-state.json"
COLLECTION_IDS = ['5CCCD4LW', '6ABWTZEP', 'X6YTQVV3']


def load_env():
    """Load environment variables from .env file."""
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value.strip()


def get_credentials():
    """Get Zotero API credentials from environment or prompt."""
    api_key = os.environ.get('ZOTERO_API_KEY', '').strip()
    user_id = os.environ.get('ZOTERO_USER_ID', '').strip()

    if not api_key:
        api_key = getpass.getpass("Enter your Zotero API Key: ").strip()
    if not user_id:
        user_id = input("Enter your Zotero User ID: ").strip()

    if not api_key or not user_id:
        print("Error: ZOTERO_API_KEY or ZOTERO_USER_ID not set.")
        sys.exit(1)

    return api_key, user_id


def _fetch_url(url: str, api_key: str) -> str:
    """Fetch URL with Zotero API key. Keeps secret in-process (no subprocess/tempfile)."""
    req = urllib.request.Request(url, headers={'Zotero-API-Key': api_key})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        print(f"HTTP error {e.code} fetching {url}: {e.reason}")
        return ''
    except urllib.error.URLError as e:
        print(f"URL error fetching {url}: {e.reason}")
        return ''


def load_index_state() -> dict:
    """Load PageIndex state from file or return empty state."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"Warning: Could not load state file: {e}")
            print("Starting with empty state.")

    return {
        "version": "1.0",
        "last_sync": None,
        "indexed_papers": {},
        "failed_papers": {}
    }


def save_index_state(state: dict):
    """Save PageIndex state to file."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    state["last_sync"] = datetime.now().isoformat()

    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2, ensure_ascii=False)


def fetch_items_json(user_id: str, api_key: str, collection_id: str) -> list[dict]:
    """Fetch items in JSON format to get Zotero keys and attachment info."""
    url = f"https://api.zotero.org/users/{user_id}/collections/{collection_id}/items?format=json&limit=100"

    try:
        result = subprocess.run(
            ['curl', '-s', '-H', f'Zotero-API-Key: {api_key}', url],
            capture_output=True,
            text=True,
            check=True
        )
        if result.stdout:
            return json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"Warning: Could not fetch JSON for collection {collection_id}: {e}")

    return []


def get_item_children(user_id: str, api_key: str, item_key: str) -> list[dict]:
    """Fetch child items (attachments) for a Zotero item."""
    url = f"https://api.zotero.org/users/{user_id}/items/{item_key}/children?format=json"

    try:
        result = subprocess.run(
            ['curl', '-s', '-H', f'Zotero-API-Key: {api_key}', url],
            capture_output=True,
            text=True,
            check=True
        )
        if result.stdout:
            return json.loads(result.stdout)
    except (subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f"Warning: Could not fetch children for item {item_key}: {e}")

    return []


def find_local_pdf(attachment_key: str) -> Path | None:
    """Locate PDF in local Zotero storage."""
    folder = ZOTERO_STORAGE / attachment_key
    if folder.exists():
        pdfs = list(folder.glob("*.pdf"))
        return pdfs[0] if pdfs else None
    return None


def generate_bibtex_id(item: dict) -> str:
    """Generate a bibtex-style ID from Zotero item data."""
    data = item.get('data', {})
    creators = data.get('creators', [])

    # Get first author's last name
    author = "unknown"
    if creators:
        first_creator = creators[0]
        author = first_creator.get('lastName', first_creator.get('name', 'unknown'))

    # Get year
    year = ""
    date = data.get('date', '')
    if date:
        import re
        match = re.search(r'\d{4}', date)
        if match:
            year = match.group(0)

    # Get first word of title
    title = data.get('title', 'untitled')
    first_word = title.split()[0].lower() if title else 'untitled'
    # Remove non-alphanumeric characters
    first_word = ''.join(c for c in first_word if c.isalnum())

    return f"{author.lower()}_{first_word}_{year}".replace(' ', '_')


def generate_pageindex_name(bibtex_id: str, original_filename: str) -> str:
    """Generate unique PageIndex name with author_year suffix."""
    stem = Path(original_filename).stem
    suffix = Path(original_filename).suffix
    return f"{stem}_{bibtex_id}{suffix}"


def find_new_papers(state: dict, zotero_items: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    Identify papers not yet indexed.
    Returns (new_papers, already_indexed).
    """
    indexed_ids = set(state.get('indexed_papers', {}).keys())

    new_papers = []
    already_indexed = []

    for item in zotero_items:
        data = item.get('data', {})
        item_type = data.get('itemType', '')

        # Skip attachments, notes, etc.
        if item_type in ['attachment', 'note', 'annotation']:
            continue

        bibtex_id = generate_bibtex_id(item)

        if bibtex_id in indexed_ids:
            already_indexed.append(item)
        else:
            new_papers.append(item)

    return new_papers, already_indexed


def check_pageindex_sync(user_id: str, api_key: str, output_commands: bool = True):
    """Main PageIndex sync workflow."""
    state = load_index_state()

    print("\nFetching Zotero library (JSON format)...")
    all_items = []
    for col_id in COLLECTION_IDS:
        items = fetch_items_json(user_id, api_key, col_id)
        all_items.extend(items)

    # Deduplicate by Zotero key
    seen_keys = set()
    unique_items = []
    for item in all_items:
        key = item.get('key')
        if key and key not in seen_keys:
            seen_keys.add(key)
            unique_items.append(item)

    new_papers, already_indexed = find_new_papers(state, unique_items)

    # Find PDFs for new papers
    papers_to_index = []
    missing_pdfs = []

    for item in new_papers:
        item_key = item.get('key')
        data = item.get('data', {})
        bibtex_id = generate_bibtex_id(item)
        title = data.get('title', 'Unknown Title')

        # Fetch attachments
        children = get_item_children(user_id, api_key, item_key)
        pdf_attachments = [
            c for c in children
            if c.get('data', {}).get('contentType') == 'application/pdf'
        ]

        if not pdf_attachments:
            missing_pdfs.append({
                'bibtex_id': bibtex_id,
                'title': title,
                'reason': 'No PDF attachment in Zotero'
            })
            state['failed_papers'][bibtex_id] = {
                'reason': 'No PDF attachment in Zotero',
                'last_attempt': datetime.now().isoformat()
            }
            continue

        # Try to find local PDF
        attachment = pdf_attachments[0]
        attachment_key = attachment.get('key')
        filename = attachment.get('data', {}).get('filename', 'document.pdf')

        local_path = find_local_pdf(attachment_key)

        if local_path:
            papers_to_index.append({
                'bibtex_id': bibtex_id,
                'title': title,
                'zotero_key': item_key,
                'attachment_key': attachment_key,
                'filename': filename,
                'path': local_path,
                'pageindex_name': generate_pageindex_name(bibtex_id, filename)
            })
        else:
            missing_pdfs.append({
                'bibtex_id': bibtex_id,
                'title': title,
                'reason': f'PDF not found locally (attachment key: {attachment_key})'
            })
            state['failed_papers'][bibtex_id] = {
                'reason': 'PDF not found in local Zotero storage',
                'last_attempt': datetime.now().isoformat()
            }

    # Output summary
    total_papers = len([i for i in unique_items if i.get('data', {}).get('itemType') not in ['attachment', 'note', 'annotation']])

    print(f"\n{'='*60}")
    print("Zotero Library Status")
    print(f"{'='*60}")
    print(f"   Total papers:      {total_papers}")
    print(f"   Already indexed:   {len(already_indexed)}")
    print(f"   New papers:        {len(new_papers)}")
    print(f"   Ready to index:    {len(papers_to_index)}")
    print(f"   Missing PDFs:      {len(missing_pdfs)}")

    if output_commands and papers_to_index:
        print(f"\n{'='*60}")
        print("New Papers to Index")
        print(f"{'='*60}\n")

        for i, paper in enumerate(papers_to_index, 1):
            print(f"{i}. {paper['bibtex_id']}")
            print(f"   Title: {paper['title'][:60]}{'...' if len(paper['title']) > 60 else ''}")
            print(f"   File:  {paper['filename']}")
            print(f"   Path:  {paper['path']}")
            print()

        print(f"{'='*60}")
        print("Commands for Claude Code")
        print(f"{'='*60}\n")

        for paper in papers_to_index:
            print(f'process_document("{paper["path"]}")')

        print(f"\n{'='*60}")
        print("After indexing, run:")
        print(f"{'='*60}\n")

        ids = ' '.join(p['bibtex_id'] for p in papers_to_index)
        print(f"python scripts/sync_zotero.py --mark-indexed {ids}")

    if missing_pdfs:
        print(f"\n{'='*60}")
        print("Papers Missing PDFs")
        print(f"{'='*60}\n")

        for paper in missing_pdfs:
            print(f"- {paper['bibtex_id']}: {paper['reason']}")

    save_index_state(state)

    return papers_to_index


def mark_papers_indexed(paper_ids: list[str]):
    """Mark papers as indexed in the state file."""
    state = load_index_state()

    for paper_id in paper_ids:
        if paper_id in state.get('failed_papers', {}):
            del state['failed_papers'][paper_id]

        state['indexed_papers'][paper_id] = {
            'indexed_at': datetime.now().isoformat(),
            'marked_manually': True
        }
        print(f"Marked as indexed: {paper_id}")

    save_index_state(state)
    print(f"\nUpdated state file: {STATE_FILE}")


def show_status():
    """Display indexed/pending/failed paper counts."""
    state = load_index_state()

    indexed = state.get('indexed_papers', {})
    failed = state.get('failed_papers', {})
    last_sync = state.get('last_sync', 'Never')

    print(f"\n{'='*60}")
    print("PageIndex Sync Status")
    print(f"{'='*60}")
    print(f"   Last sync:       {last_sync}")
    print(f"   Indexed papers:  {len(indexed)}")
    print(f"   Failed papers:   {len(failed)}")

    if indexed:
        print(f"\n{'='*60}")
        print("Indexed Papers")
        print(f"{'='*60}")
        for paper_id, info in sorted(indexed.items()):
            indexed_at = info.get('indexed_at', 'Unknown')[:10]
            print(f"   {paper_id} (indexed: {indexed_at})")

    if failed:
        print(f"\n{'='*60}")
        print("Failed Papers")
        print(f"{'='*60}")
        for paper_id, info in sorted(failed.items()):
            reason = info.get('reason', 'Unknown')
            print(f"   {paper_id}: {reason}")

def sync_zotero():
    """Main Zotero sync function - fetches BibTeX and exports to JSON/bib."""
    load_env()
    api_key, user_id = get_credentials()

    all_bibtex_data = ""

    for col_id in COLLECTION_IDS:
        print(f"Syncing Zotero collection {col_id}...")
        url = f"https://api.zotero.org/users/{user_id}/collections/{col_id}/items?format=bibtex&limit=100"
        
        data = _fetch_url(url, api_key)
        if data:
            all_bibtex_data += data + "\n"
        else:
            print(f"Warning: No data received for collection {col_id}")

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
        """Escape LaTeX special characters. Idempotent: already-escaped chars are left alone."""
        if not text:
            return text
        # Normalization rules (separate from escaping per Codex review)
        text = text.replace(r'\textitnot', r'\textit{not}')
        text = text.replace('\u200e', '')  # Remove Left-to-Right Mark
        # Escape only characters NOT already preceded by backslash
        text = re.sub(r'(?<!\\)&', r'\\&', text)
        text = re.sub(r'(?<!\\)%', r'\\%', text)
        text = re.sub(r'(?<!\\)_', r'\\_', text)
        text = re.sub(r'(?<!\\)#', r'\\#', text)
        return text

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

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Sync Zotero library to local files and PageIndex",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/sync_zotero.py                    # Default: sync BibTeX to JSON/bib
  python scripts/sync_zotero.py --pageindex        # Check for new papers to index
  python scripts/sync_zotero.py --status           # Show indexed/pending status
  python scripts/sync_zotero.py --mark-indexed id1 id2  # Mark papers as indexed
        """
    )

    parser.add_argument(
        '--pageindex',
        action='store_true',
        help='Check for new papers and output PageIndex commands'
    )

    parser.add_argument(
        '--check-pageindex',
        action='store_true',
        help='Quick check for new papers (no command output)'
    )

    parser.add_argument(
        '--mark-indexed',
        nargs='+',
        metavar='PAPER_ID',
        help='Mark paper(s) as indexed in PageIndex'
    )

    parser.add_argument(
        '--status',
        action='store_true',
        help='Show PageIndex sync status'
    )

    parser.add_argument(
        '--skip-bibtex',
        action='store_true',
        help='Skip the default BibTeX sync (only run PageIndex operations)'
    )

    return parser.parse_args()


def main():
    """Main entry point with CLI argument handling."""
    args = parse_args()
    load_env()

    # Handle PageIndex-specific commands first
    if args.status:
        show_status()
        return

    if args.mark_indexed:
        mark_papers_indexed(args.mark_indexed)
        return

    # Run default BibTeX sync unless skipped
    if not args.skip_bibtex:
        sync_zotero()

    # Run PageIndex check if requested
    if args.pageindex or args.check_pageindex:
        api_key, user_id = get_credentials()
        output_commands = args.pageindex  # Only output commands with --pageindex
        check_pageindex_sync(user_id, api_key, output_commands=output_commands)


if __name__ == "__main__":
    main()

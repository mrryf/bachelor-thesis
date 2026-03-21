import os
import sys
import getpass
import json
import re
import argparse
import urllib.request
import urllib.error
import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode

# Constants
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
    """Get Zotero API credentials from environment or prompt.

    In non-interactive environments (CI), exits immediately if credentials
    are missing instead of hanging on interactive prompts.
    """
    api_key = os.environ.get('ZOTERO_API_KEY', '').strip()
    user_id = os.environ.get('ZOTERO_USER_ID', '').strip()

    if not api_key or not user_id:
        if not sys.stdin.isatty():
            print("Error: ZOTERO_API_KEY and ZOTERO_USER_ID must be set in environment (non-interactive mode).")
            sys.exit(1)
        if not api_key:
            api_key = getpass.getpass("Enter your Zotero API Key: ").strip()
        if not user_id:
            user_id = input("Enter your Zotero User ID: ").strip()

    if not api_key or not user_id:
        print("Error: ZOTERO_API_KEY or ZOTERO_USER_ID not set.")
        sys.exit(1)

    if not re.match(r'^\d+$', user_id):
        print(f"Error: ZOTERO_USER_ID must be numeric, got: '{user_id[:20]}'")
        sys.exit(1)

    return api_key, user_id


def _fetch_url(url: str, api_key: str) -> str:
    """Fetch URL with Zotero API key. Keeps secret in-process (no subprocess/tempfile)."""
    req = urllib.request.Request(url, headers={'Zotero-API-Key': api_key})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        print(f"HTTP error {e.code}: {e.reason}")
        return ''
    except urllib.error.URLError as e:
        print(f"URL error: {e.reason}")
        return ''


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
        description="Sync Zotero library to local bibliography and webapp references",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/sync_zotero.py    # Sync BibTeX to .bib and references.json
        """
    )
    return parser.parse_args()


def main():
    """Main entry point."""
    parse_args()  # Keep for --help support
    load_env()
    sync_zotero()


if __name__ == "__main__":
    main()

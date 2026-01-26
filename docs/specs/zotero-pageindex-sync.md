# Zotero-PageIndex Sync Extension

**Status**: Specification
**Created**: 2026-01-26
**Author**: Claude Code

---

## Overview

Extend `scripts/sync_zotero.py` to automatically detect and index new research papers from Zotero into PageIndex. This enables incremental indexing - only new papers are uploaded, avoiding redundant re-indexing of the entire library.

## Current State

### Existing `sync_zotero.py` Functionality
1. Fetches BibTeX metadata from Zotero API (3 collections)
2. Deduplicates entries by ID
3. Exports to `webapp/src/lib/data/references.json` (for webapp)
4. Exports to `content/resources/bibliography.bib` (for LaTeX)

### What's Missing
- PDF attachment download
- PageIndex integration
- Tracking of already-indexed papers

## Proposed Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Zotero API    │────▶│  sync_zotero.py  │────▶│  PageIndex  │
│  (metadata+PDF) │     │   (extended)     │     │    MCP      │
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Index State  │
                        │   (.json)    │
                        └──────────────┘
```

## Implementation Plan

### Phase 1: Index State Tracking

**File**: `.claude/pageindex-state.json`

```json
{
  "last_sync": "2026-01-26T10:30:00Z",
  "indexed_papers": {
    "baroni_ai-tam_2022": {
      "zotero_key": "ABC123",
      "pageindex_name": "Baroni et al. - 2022 - AI-TAM a model to investigate user acceptance.pdf",
      "indexed_at": "2026-01-26T09:29:37Z",
      "pages": 21
    }
  },
  "failed_papers": {
    "cao_understanding_2021": {
      "reason": "PDF not found in Zotero storage",
      "last_attempt": "2026-01-26T10:02:00Z"
    }
  }
}
```

### Phase 2: PDF Attachment Discovery

**Approach**: Use Zotero API to fetch attachment metadata, then locate PDFs in local Zotero storage.

```python
def get_pdf_attachments(user_id: str, api_key: str, item_key: str) -> list[dict]:
    """
    Fetch PDF attachments for a Zotero item.

    Returns:
        [{"key": "XYZ789", "filename": "Author - Year - Title.pdf", "path": "..."}]
    """
    url = f"https://api.zotero.org/users/{user_id}/items/{item_key}/children"
    # Filter for PDF attachments (contentType: application/pdf)
```

**Local Storage Mapping**:
```python
ZOTERO_STORAGE = Path.home() / "Zotero" / "storage"

def find_local_pdf(attachment_key: str) -> Path | None:
    """
    Locate PDF in local Zotero storage.
    Storage structure: ~/Zotero/storage/{KEY}/{filename}.pdf
    """
    folder = ZOTERO_STORAGE / attachment_key
    if folder.exists():
        pdfs = list(folder.glob("*.pdf"))
        return pdfs[0] if pdfs else None
    return None
```

### Phase 3: PageIndex Integration

**Option A: Direct MCP Call (Recommended)**

Since PageIndex MCP is configured in Claude Code, the sync script can output commands for Claude to execute:

```python
def generate_pageindex_commands(new_papers: list[dict]) -> str:
    """
    Generate PageIndex upload commands for Claude Code to execute.

    Output format (for Claude):
    ---
    NEW PAPERS TO INDEX:
    1. /Users/.../Zotero/storage/ABC123/Author - 2024 - Title.pdf
    2. /Users/.../Zotero/storage/DEF456/Author - 2023 - Title.pdf

    Run: process_document() for each path above
    ---
    """
```

**Option B: HTTP API (If Available)**

If PageIndex exposes an HTTP API, call directly from Python:

```python
def upload_to_pageindex(pdf_path: Path) -> dict:
    """Upload PDF to PageIndex via API."""
    # Implementation depends on PageIndex API availability
```

### Phase 4: Incremental Sync Logic

```python
def sync_papers_to_pageindex():
    """
    Main sync function with incremental logic.
    """
    # 1. Load current index state
    state = load_index_state()

    # 2. Fetch all papers from Zotero collections
    zotero_papers = fetch_zotero_papers()

    # 3. Identify new papers (not in state.indexed_papers)
    new_papers = []
    for paper in zotero_papers:
        if paper['ID'] not in state['indexed_papers']:
            new_papers.append(paper)

    # 4. For each new paper, find PDF attachment
    papers_to_index = []
    for paper in new_papers:
        pdf_path = find_pdf_for_paper(paper)
        if pdf_path:
            papers_to_index.append({
                'id': paper['ID'],
                'path': pdf_path,
                'metadata': paper
            })
        else:
            # Record as failed (no PDF)
            state['failed_papers'][paper['ID']] = {
                'reason': 'PDF not found',
                'last_attempt': datetime.now().isoformat()
            }

    # 5. Output for PageIndex upload
    if papers_to_index:
        print(f"\n{'='*50}")
        print(f"NEW PAPERS TO INDEX ({len(papers_to_index)}):")
        print(f"{'='*50}\n")
        for i, paper in enumerate(papers_to_index, 1):
            print(f"{i}. {paper['path']}")
        print(f"\n→ Use PageIndex process_document() for each path")
    else:
        print("No new papers to index.")

    # 6. Save updated state
    save_index_state(state)

    return papers_to_index
```

## CLI Interface

### Extended Commands

```bash
# Current behavior (unchanged)
python scripts/sync_zotero.py

# New: Check for new papers to index
python scripts/sync_zotero.py --check-pageindex

# New: Full sync with PageIndex commands
python scripts/sync_zotero.py --pageindex

# New: Mark papers as indexed (after manual upload)
python scripts/sync_zotero.py --mark-indexed <paper_id>

# New: List indexed vs pending papers
python scripts/sync_zotero.py --status
```

### Example Output

```
$ python scripts/sync_zotero.py --pageindex

Syncing Zotero collection 5CCCD4LW...
Syncing Zotero collection 6ABWTZEP...
Syncing Zotero collection X6YTQVV3...
Parsing and deduplicating bibliography entries...

📚 Zotero Library Status:
   Total papers: 72
   Already indexed: 63
   New papers: 7
   Missing PDFs: 2

📄 New Papers to Index:
   1. Smith et al. - 2025 - New AI Trust Framework.pdf
      Path: /Users/mrryf/Zotero/storage/NEW123/Smith et al. - 2025 - New AI Trust Framework.pdf

   2. Johnson - 2025 - TAM Extensions Review.pdf
      Path: /Users/mrryf/Zotero/storage/NEW456/Johnson - 2025 - TAM Extensions Review.pdf

⚠️  Papers Missing PDFs:
   - doe_unpublished_2025 (no attachment in Zotero)
   - anonymous_preprint_2025 (attachment not synced locally)

→ To index new papers, run in Claude Code:
  process_document("/Users/mrryf/Zotero/storage/NEW123/Smith et al. - 2025 - New AI Trust Framework.pdf")
  process_document("/Users/mrryf/Zotero/storage/NEW456/Johnson - 2025 - TAM Extensions Review.pdf")

→ After indexing, run: python scripts/sync_zotero.py --mark-indexed smith_new_2025 johnson_tam_2025
```

## State File Management

### Location
`.claude/pageindex-state.json` - tracked in git (contains no sensitive data)

### Schema

```typescript
interface PageIndexState {
  version: string;           // Schema version for migrations
  last_sync: string;         // ISO timestamp
  indexed_papers: {
    [bibtex_id: string]: {
      zotero_key: string;    // Zotero item key
      pageindex_name: string; // Name in PageIndex
      indexed_at: string;    // ISO timestamp
      pages: number;         // Page count
      pdf_path: string;      // Original PDF path
    }
  };
  failed_papers: {
    [bibtex_id: string]: {
      reason: string;
      last_attempt: string;
    }
  };
}
```

### Initial State Generation

For the 63 papers already indexed, generate initial state from PageIndex:

```python
def generate_initial_state():
    """
    One-time: Create initial state from already-indexed papers.
    Run via Claude Code to query PageIndex.
    """
    # Query PageIndex for all documents
    # Match with Zotero library by filename
    # Generate .claude/pageindex-state.json
```

## Integration with Existing Workflow

### Modified sync_zotero.py Flow

```
sync_zotero()
├── fetch_zotero_collections()      # Existing
├── deduplicate_entries()           # Existing
├── export_json()                   # Existing
├── export_bibtex()                 # Existing
└── check_pageindex_sync()          # NEW (if --pageindex flag)
    ├── load_index_state()
    ├── find_new_papers()
    ├── locate_pdfs()
    └── output_index_commands()
```

### Backward Compatibility

- Default behavior unchanged (no --pageindex flag)
- All existing functionality preserved
- PageIndex features are opt-in

## Error Handling

| Error | Handling |
|-------|----------|
| PDF not in local Zotero storage | Log to failed_papers, suggest Zotero sync |
| Zotero API rate limit | Implement exponential backoff |
| PageIndex upload fails | Keep in pending state, retry on next sync |
| Duplicate filename in PageIndex | Append year/author disambiguation |

## Future Enhancements

### Phase 5 (Future): Automatic Upload

If PageIndex provides a Python SDK or HTTP API:

```python
# Direct upload without Claude Code intermediary
from pageindex import Client

client = Client(api_key=os.environ['PAGEINDEX_API_KEY'])

for paper in new_papers:
    result = client.upload(paper['path'])
    state['indexed_papers'][paper['id']] = {
        'pageindex_name': result['name'],
        'indexed_at': datetime.now().isoformat(),
        'pages': result['pages']
    }
```

### Phase 6 (Future): GitHub Action

```yaml
# .github/workflows/sync-papers.yml
name: Sync Zotero Papers
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync Zotero
        run: python scripts/sync_zotero.py --check-pageindex
        env:
          ZOTERO_API_KEY: ${{ secrets.ZOTERO_API_KEY }}
          ZOTERO_USER_ID: ${{ secrets.ZOTERO_USER_ID }}
```

## Dependencies

### New Python Dependencies

```
# requirements.txt additions
# None required - uses stdlib + existing bibtexparser
```

### Environment Variables

```bash
# Existing (unchanged)
ZOTERO_API_KEY=xxx
ZOTERO_USER_ID=xxx

# New (optional, for future direct API)
PAGEINDEX_API_KEY=xxx  # If PageIndex exposes API
```

## Testing

### Unit Tests

```python
def test_find_new_papers():
    """Papers in Zotero but not in state should be detected."""

def test_pdf_discovery():
    """PDFs should be found in Zotero storage structure."""

def test_state_persistence():
    """Index state should persist across runs."""
```

### Integration Test

```bash
# Add a test paper to Zotero
# Run sync with --pageindex
# Verify paper appears in "new papers" list
# Mark as indexed
# Run sync again - verify paper not in list
```

## Summary

This extension adds incremental PageIndex sync to the existing Zotero workflow:

1. **Tracks what's indexed** via `.claude/pageindex-state.json`
2. **Detects new papers** by comparing Zotero library with state
3. **Locates PDFs** in local Zotero storage
4. **Outputs commands** for Claude Code to execute PageIndex uploads
5. **Updates state** after successful indexing

The implementation is non-breaking and opt-in via CLI flags.

# PageIndex Integration Documentation

**Last Updated**: 2026-01-26
**Status**: Production Ready

---

## Overview

This document describes the PageIndex MCP integration for the bachelor thesis project. PageIndex enables semantic search and retrieval across thesis documents and research papers directly from Claude Code.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code CLI                          │
├─────────────────────────────────────────────────────────────────┤
│  MCP Transport (stdio)                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   PageIndex MCP                          │    │
│  │  - process_document()     - get_page_content()          │    │
│  │  - find_relevant_documents() - get_document_structure() │    │
│  │  - remove_document()      - get_document()              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PageIndex Cloud                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Prestudy   │  │   Research   │  │    Thesis    │          │
│  │   main.pdf   │  │   Papers     │  │   (future)   │          │
│  │   31 pages   │  │   63 docs    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Installation

PageIndex MCP is installed via stdio transport:

```bash
claude mcp add --transport stdio pageindex -- npx -y @pageindex/mcp
```

Verify connection:
```bash
claude mcp list
```

## Indexed Documents

### Own Documents

| Document | PageIndex Name | Pages | Location |
|----------|---------------|-------|----------|
| Prestudy | `main.pdf` | 31 | `content/prestudy/main.pdf` |
| Thesis | TBD | TBD | `content/thesis/main.pdf` |

**Note**: Both compile to `main.pdf`. Differentiate by description content:
- Prestudy: "framing of AI confidence scores", "Alva chatbot"
- Thesis: Will contain "results", "SEM analysis"

### Research Papers (63 documents, ~2,800 pages)

Categories indexed:

| Category | Key Papers | Topics |
|----------|-----------|--------|
| TAM/AI-TAM | Davis 1989, Baroni 2022, Ibrahim 2025, Topsakal 2025 | Technology acceptance models |
| Framing | Tversky 1986, Levin 1998, Freling 2014, Druckman 2001 | Attribute framing, prospect theory |
| Trust in AI | Kahr 2024, Li 2024, Kaplan 2023, Lee & See 2004 | Trust definitions, development |
| Methodology | Anderson & Gerbing 1988, Baron & Kenny 1986, Bentler 1990/1995 | SEM, mediation analysis |
| German Sources | Kopp 2022, Schork 2024, Karg 2024 | Trust, framing (German language) |

## Usage

### Basic Queries

```
# Find papers by topic
find_relevant_documents(limit: 10)

# Get specific pages (most efficient)
get_page_content("main.pdf", pages: "13-14")

# Get document structure (expensive - use sparingly)
get_document_structure("main.pdf")
```

### Token Cost Awareness

| Operation | Cost | When to Use |
|-----------|------|-------------|
| `find_relevant_documents` | ~1k tokens | Always start here |
| `get_document` | ~500 tokens | Status checks |
| `get_page_content` (2-3 pages) | ~2-4k tokens | Primary method |
| `get_document_structure` | ~5-15k tokens | Only when necessary |

### Tiered Query Strategy

1. **Tier 1**: Use `find_relevant_documents` - descriptions often sufficient
2. **Tier 2**: Use `get_page_content` with known page numbers
3. **Tier 3**: Use `get_document_structure` only if location unknown

## Syncing Documents

### Prestudy/Thesis (Manual)

Only sync after **significant** content changes (not minor edits):

```bash
# 1. Compile
./scripts/build.sh --prestudy

# 2. In Claude Code, remove old version
remove_document(["main.pdf"])

# 3. Upload new version
process_document("/path/to/content/prestudy/main.pdf")

# 4. Verify
get_document("main.pdf", wait_for_completion: true)
```

### Research Papers (One-time)

Papers are static - index once. For new papers:

```bash
# Find PDF in Zotero storage
find ~/Zotero/storage -name "*.pdf" | grep "AuthorName"

# Upload to PageIndex
process_document("/Users/mrryf/Zotero/storage/XXXXX/Author - Year - Title.pdf")
```

Future: See `docs/specs/zotero-pageindex-sync.md` for automated sync extension.

## Skills and Agents

### PageIndex Query Skill

**Purpose**: Best practices for efficient queries

**Key Points**:
- Always start with Tier 1 (find_relevant_documents)
- Use structure cache for known locations
- Avoid redundant structure calls
- Request 2-3 pages maximum per content call

### PageIndex Sync Skill

**Purpose**: Automate document re-indexing workflow

**Usage**: `/pageindex-sync [prestudy|thesis|both]`

**When to Sync**:
- After significant content changes
- Before new Claude Code session needing current content
- After adding new sections/chapters

**When NOT to Sync**:
- Minor typo fixes
- Formatting-only changes
- Adding graphs/figures (unless content around them changed)

### Context Manager Agent

**Purpose**: Optimize token usage across conversations

**Responsibilities**:
- Check structure cache before PageIndex calls
- Choose minimal retrieval tier
- Warn when context budget is low
- Maintain structure cache

## Structure Cache

Location: `.claude/thesis-structure.md`

Contains:
- Prestudy section-to-page mappings
- Research paper key section locations
- Quick reference for common queries

**Example**:
```markdown
| Query | Go to Page |
|-------|------------|
| Research question | 15 |
| Hypotheses (all) | 13-14 |
| TAM definition | 9 |
```

## File Locations

### Committed to Git (docs/)

| File | Purpose |
|------|---------|
| `docs/pageindex-integration.md` | This documentation |
| `docs/specs/pageindex-evaluation-score.md` | Evaluation results (37/40) |
| `docs/specs/zotero-pageindex-sync.md` | Future sync extension spec |

### Local Only (.claude/)

| File | Purpose | Recreate From |
|------|---------|---------------|
| `.claude/skills/pageindex-query.md` | Query best practices | This doc, "Skills" section |
| `.claude/skills/pageindex-sync.md` | Sync workflow | This doc, "Syncing" section |
| `.claude/agents/pageindex-context-manager.md` | Context optimization | This doc, "Agents" section |
| `.claude/thesis-structure.md` | Structure cache | PageIndex `get_document_structure` |

## Troubleshooting

### "Document not found"

Document may have version suffix (e.g., `main_1.pdf`). Check with:
```
find_relevant_documents(limit: 20)
```

### High token usage

- Check if using Tier 3 (structure) unnecessarily
- Use structure cache for repeated queries
- Limit page ranges in content requests

### Sync fails

1. Verify PDF exists: `ls content/prestudy/main.pdf`
2. Check PageIndex connection: `claude mcp list`
3. Try manual delete + upload

### Wrong document indexed

Both prestudy and thesis are named `main.pdf`. Check description to identify:
```
get_document("main.pdf")
```

## Evaluation Summary

**Score**: 37/40 (ADOPT)

| Criterion | Score |
|-----------|-------|
| Retrieval Accuracy | 5/5 |
| Citation Precision | 5/5 |
| Cross-Document Synthesis | 5/5 |
| Workflow Integration | 4/5 |
| Update Experience | 4/5 |
| Response Latency | 5/5 |
| Setup Complexity | 5/5 |
| Overall Value | 4/5 |

See `docs/specs/pageindex-evaluation-score.md` for full details.

---

## Appendix: Skill/Agent Definitions

These are stored in `.claude/` (not committed). If lost, recreate from below:

### A. PageIndex Query Skill

```markdown
# PageIndex Query Best Practices

## Tiered Query Strategy

### Tier 1: Document Discovery (~1k tokens)
Use: find_relevant_documents(limit: 10)
When: Starting a new query, don't know which paper

### Tier 2: Targeted Page Extraction (~2-4k tokens)
Use: get_page_content(doc_name, pages: "3-5")
When: Know approximate location

### Tier 3: Full Structure (~5-15k tokens)
Use: get_document_structure(doc_name)
When: Need complete document outline (avoid if possible)

## Anti-Patterns
- Don't call structure for every query
- Don't fetch entire documents at once
- Don't query multiple structures in one conversation
```

### B. PageIndex Sync Skill

```markdown
# PageIndex Sync Skill

## Usage
/pageindex-sync [prestudy|thesis|both]

## Workflow
1. Compile: ./scripts/build.sh --prestudy
2. Check existing: find_relevant_documents()
3. Remove old: remove_document(["main.pdf"])
4. Upload new: process_document("/path/to/main.pdf")
5. Verify: get_document("main.pdf", wait_for_completion: true)
6. Update cache if structure changed
```

### C. Context Manager Agent

```markdown
# PageIndex Context Manager

## Before Any Query
1. Check structure cache first
2. Assess if description alone sufficient
3. Choose minimal retrieval tier

## Token Budget
- Fresh conversation: Can afford 1-2 structure calls
- Mid conversation (~50k): Prefer page content only
- Late conversation (~80k): Descriptions only
```

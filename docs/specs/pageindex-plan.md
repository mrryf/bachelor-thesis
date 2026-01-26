# Plan: PageIndex Evaluation for Bachelor Thesis

## Context Summary

Based on gathered requirements:

| Factor | Value |
|--------|-------|
| Reference storage | Zotero (with existing API integration) |
| Number of papers | 50+ papers |
| Workflow | Terminal + Claude Code CLI |
| Privacy concerns | None (cloud services acceptable) |
| Edit frequency | Few times per week |
| Priority use cases | Query own thesis + Research retrieval (equal) |

---

## Test Plan Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PageIndex Evaluation                          │
├─────────────────────────────────────────────────────────────────┤
│  Phase 1: Setup & Thesis Query Test                              │
│  ├── Install PageIndex MCP                                       │
│  ├── Index prestudy PDF                                          │
│  └── Run query tests                                             │
├─────────────────────────────────────────────────────────────────┤
│  Phase 2: Research Retrieval Test                                │
│  ├── Export PDFs from Zotero                                     │
│  ├── Index subset of papers (5-10)                               │
│  └── Run cross-document queries                                  │
├─────────────────────────────────────────────────────────────────┤
│  Phase 3: Integration Assessment                                 │
│  ├── Claude Code workflow test                                   │
│  ├── Evaluate update workflow                                    │
│  └── Document findings                                           │
├─────────────────────────────────────────────────────────────────┤
│  Phase 4: Decision & Next Steps                                  │
│  └── Go/No-Go decision based on evaluation criteria              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Setup & Thesis Query Test

### Objective
Validate that PageIndex can accurately retrieve information from your prestudy document.

### Prerequisites
- [ ] Claude Desktop installed (for MCP extension)
- [ ] Prestudy PDF compiled and available

### Tasks

#### 1.1 Install PageIndex MCP Extension

**Steps:**
1. Go to https://pageindex.ai/mcp
2. Click "Download Extension" for Claude Desktop
3. Restart Claude Desktop
4. Verify extension appears in Claude Desktop settings

**Verification:** PageIndex tools available in Claude Desktop

#### 1.2 Compile and Upload Prestudy

**Steps:**
1. Compile prestudy PDF:
   ```bash
   ./scripts/build.sh --prestudy
   ```
2. Locate output: `content/prestudy/main.pdf`
3. Upload PDF to PageIndex via Claude Desktop

**Verification:** PageIndex confirms document indexed successfully

#### 1.3 Run Thesis Query Tests

Execute these test queries and document results:

| ID | Query | Expected Answer Location | Pass/Fail |
|----|-------|--------------------------|-----------|
| T1 | "What are the hypotheses in this document?" | Section 2 (Theory), Hypothesenübersicht | |
| T2 | "What is the TAM model?" | Section 2, TAM subsection | |
| T3 | "What is the research question?" | Section 3, Forschungsfrage | |
| T4 | "Describe the experimental design" | Section 4, Methodology | |
| T5 | "What is Attribute Framing?" | Section 2, Framing-Effekt subsection | |
| T6 | "List the milestones for this project" | Section 1, Arbeitsplan | |
| T7 | "What is XAIT?" | Glossary or Section 2 | |
| T8 | "Who is the practical partner for this thesis?" | Selbstreflexion or Introduction | |

**Evaluation Criteria:**
- [ ] Answers are factually correct
- [ ] Page/section references are accurate
- [ ] Response includes relevant context (not just keywords)
- [ ] No hallucinated information

**Document Results:**
```
Test ID: T1
Query: "What are the hypotheses in this document?"
Response: [paste response]
Page references returned: [list pages]
Correct: Yes/No
Notes:
```

---

## Phase 2: Research Retrieval Test

### Objective
Validate that PageIndex can retrieve information across multiple academic papers from your Zotero library.

### Prerequisites
- [ ] Phase 1 completed successfully
- [ ] Zotero API credentials configured (`.env` file)

### Tasks

#### 2.1 Select Test Papers

Select 5-10 papers that are central to your thesis. Suggested criteria:
- Papers you frequently reference
- Papers covering different aspects (TAM, Framing, Trust in AI)
- Mix of foundational and recent papers

**Selected Papers:**
| # | Citation Key | Title | Topic |
|---|--------------|-------|-------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

#### 2.2 Export PDFs from Zotero

**Option A: Manual Export**
1. Open Zotero
2. Select papers from test list
3. Right-click → Export Item → "Export Files"
4. Save to `content/resources/test-papers/`

**Option B: Extend Zotero Sync Script (Future)**

The existing `scripts/sync_zotero.py` could be extended to also fetch PDF attachments. This is out of scope for initial testing but could be a future enhancement.

Zotero API endpoint for attachments:
```
GET /users/{userID}/items/{itemKey}/children
```

#### 2.3 Upload Papers to PageIndex

Upload selected papers via Claude Desktop:
1. Use PageIndex to index each paper
2. Note document IDs for each paper

**Indexed Papers:**
| Paper | PageIndex Doc ID | Index Status |
|-------|------------------|--------------|
| Paper 1 | | |
| Paper 2 | | |
| ... | | |

#### 2.4 Run Cross-Document Query Tests

| ID | Query | Expected Sources | Pass/Fail |
|----|-------|------------------|-----------|
| R1 | "How is trust in AI defined across these papers?" | Multiple papers | |
| R2 | "What extensions to TAM exist for AI systems?" | TAM/AI-TAM papers | |
| R3 | "What framing effects have been studied in technology contexts?" | Framing papers | |
| R4 | "What measurement scales are used for perceived usefulness?" | Methodology papers | |
| R5 | "Compare the sample sizes used in these studies" | All empirical papers | |

**Evaluation Criteria:**
- [ ] Cross-document synthesis is coherent
- [ ] Citations to specific papers are accurate
- [ ] Page references within papers are correct
- [ ] Retrieval covers relevant papers (not just first uploaded)

---

## Phase 3: Integration Assessment

### Objective
Evaluate how PageIndex fits into your actual thesis writing workflow with Claude Code.

### Tasks

#### 3.1 Claude Code Workflow Test

Test the workflow: Terminal → Claude Code → PageIndex queries

**Scenario:** You're writing a new section and need to reference existing content.

**Steps:**
1. Open Claude Code in terminal
2. Ask a question that requires PageIndex retrieval
3. Document the experience

**Questions to answer:**
- Can Claude Code access PageIndex tools? (May require MCP configuration)
- What is the response latency?
- Is the workflow smooth or disruptive?

**MCP Configuration for Claude Code** (if needed):
```json
// ~/.claude/claude_desktop_config.json or similar
{
  "mcpServers": {
    "pageindex": {
      "command": "npx",
      "args": ["-y", "@anthropic/pageindex-mcp"]
    }
  }
}
```

#### 3.2 Update Workflow Test

Simulate your few-times-per-week editing pattern:

**Steps:**
1. Make a change to a section in your prestudy `.tex` file
2. Recompile PDF: `./scripts/build.sh --prestudy`
3. Re-upload to PageIndex
4. Query the changed content

**Questions to answer:**
- How long does re-indexing take?
- Does PageIndex detect changes correctly?
- Is this workflow acceptable for few-times-per-week updates?

**Document findings:**
```
Change made: [describe change]
Recompile time: [duration]
Re-index time: [duration]
Query tested: [query]
Change reflected correctly: Yes/No
```

#### 3.3 Zotero Integration Assessment

Evaluate potential for deeper Zotero integration:

**Current State:**
- `scripts/sync_zotero.py` fetches BibTeX metadata
- Could be extended to also fetch PDF attachments

**Questions to evaluate:**
- Would automatic PDF export from Zotero be valuable?
- How often do you add new papers to Zotero?
- Would batch re-indexing of papers be needed?

---

## Phase 4: Decision & Next Steps

### Evaluation Scorecard

Rate each criterion (1-5, where 5 = excellent):

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Retrieval Accuracy** | /5 | Do queries return correct information? |
| **Citation Precision** | /5 | Are page/section references accurate? |
| **Cross-Document Synthesis** | /5 | Can it combine info from multiple sources? |
| **Workflow Integration** | /5 | Does it fit your terminal-based workflow? |
| **Update Experience** | /5 | Is re-indexing after edits acceptable? |
| **Response Latency** | /5 | Are queries answered quickly enough? |
| **Setup Complexity** | /5 | Was setup straightforward? |
| **Overall Value** | /5 | Is it worth using vs. alternatives? |

**Total Score:** /40

### Decision Thresholds

| Score | Decision |
|-------|----------|
| 32-40 | **Adopt**: Integrate PageIndex into workflow |
| 24-31 | **Conditional**: Use for specific cases (e.g., research retrieval only) |
| 16-23 | **Defer**: Revisit when product matures |
| <16 | **Reject**: Use alternative approaches |

### Alternative Approaches (if needed)

If PageIndex doesn't meet requirements, consider:

1. **llms.txt for thesis** - Create a manual structure file for Claude Code navigation
2. **Native Claude Code** - Use Read/Grep tools directly on `.tex` files
3. **Vector DB solution** - More complex but may handle 50+ papers better
4. **Hybrid approach** - PageIndex for papers, native Claude Code for thesis

---

## Execution Checklist

### Phase 1: Setup & Thesis Query
- [ ] Install PageIndex MCP extension
- [ ] Compile prestudy PDF
- [ ] Upload and index prestudy
- [ ] Run 8 thesis query tests (T1-T8)
- [ ] Document results

### Phase 2: Research Retrieval
- [ ] Select 5-10 test papers
- [ ] Export PDFs from Zotero
- [ ] Upload and index papers
- [ ] Run 5 cross-document tests (R1-R5)
- [ ] Document results

### Phase 3: Integration
- [ ] Test Claude Code → PageIndex workflow
- [ ] Test update/re-index workflow
- [ ] Assess Zotero integration potential
- [ ] Document findings

### Phase 4: Decision
- [ ] Complete evaluation scorecard
- [ ] Make Go/No-Go decision
- [ ] Document next steps

---

## Appendix A: Existing Zotero Integration

Your project already has Zotero API integration in `scripts/sync_zotero.py`:

**Collections configured:**
- `5CCCD4LW`: Bachelor Thesis (Parent)
- `6ABWTZEP`: Bachelor Thesis / 02_Prestudy
- `X6YTQVV3`: Bachelor Thesis / 01_research

**Current capabilities:**
- Fetch BibTeX metadata from collections
- Deduplicate entries
- Export to `content/resources/bibliography.bib`
- Export to `webapp/src/lib/data/references.json`

**Potential extension for PageIndex:**
```python
# Pseudocode for fetching PDF attachments
def fetch_attachments(user_id, api_key, item_key):
    url = f"https://api.zotero.org/users/{user_id}/items/{item_key}/children"
    # Filter for PDF attachments
    # Download to local folder
    # Return list of PDF paths for PageIndex indexing
```

---

## Appendix B: Test Query Templates

### Thesis Queries (Phase 1)

```
Query: "What hypotheses are defined in this thesis?"
Expected: List of H1a, H1b, H2-H8 with descriptions

Query: "Explain the relationship between framing and trust in AI"
Expected: Discussion from Theory section about how positive/negative framing affects trust

Query: "What is the sample size planned for the experiment?"
Expected: N value from Methodology section
```

### Research Queries (Phase 2)

```
Query: "Across these papers, what factors influence trust in AI systems?"
Expected: Synthesis of trust factors from multiple sources with citations

Query: "What limitations do these studies acknowledge regarding TAM?"
Expected: Limitations from discussion sections with paper references
```

---

## Notes

- This plan focuses on evaluation, not production deployment
- All tests should be documented for future reference
- If Phase 1 fails significantly, consider stopping before Phase 2
- The goal is informed decision-making, not perfect scores

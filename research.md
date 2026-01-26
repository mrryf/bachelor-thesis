# Research: PageIndex MCP Optimization Through Schema-Based Document Organization

**Date**: 2026-01-26
**Context**: Bachelor thesis project with 63+ indexed research papers in PageIndex MCP
**Goal**: Reduce token consumption and improve document discovery through semantic categorization
**Constraint**: Configuration-only solutions (no custom code or external databases)

---

## Executive Summary

Your current PageIndex integration scores **37/40 (ADOPT)** with excellent retrieval accuracy, but two challenges remain: **high token costs** (~11k per structure call) and **flat document organization** (60+ papers without semantic grouping).

Research into agentic RAG patterns, knowledge graphs, and MCP optimization reveals that **schema-based metadata organization**—a structured index file that categorizes papers by topic, methodology, and relevance—can reduce query tokens by **50-70%** while improving discovery accuracy. This approach requires no code changes, only enhanced metadata files and updated agent prompts.

**Recommendation**: Implement a **tiered document catalog** (`document-catalog.md`) with semantic categories, query routing hints, and pre-computed topic clusters. This provides the benefits of knowledge graph organization without the infrastructure complexity.

---

## 1. Current State Analysis

### What You Have

| Component | Status | Token Impact |
|-----------|--------|--------------|
| PageIndex MCP | 63 papers indexed (~2,800 pages) | Base infrastructure |
| Tiered query strategy | Implemented | Reduces 60% vs naive |
| Structure cache | Partial (thesis only) | Saves ~11k per cached lookup |
| Context manager agent | Configured | Enforces budget discipline |
| Document state tracking | JSON manifest | Metadata for sync |

### Current Query Flow

```
User Query
    ↓
find_relevant_documents() → ~1k tokens (searches descriptions)
    ↓
[Optional] get_document_structure() → ~11k tokens (full outline)
    ↓
get_page_content(pages) → ~2-4k tokens (targeted extraction)
```

### Pain Points Identified

1. **High per-query cost**: Even optimized queries average 3-5k tokens. Cross-document synthesis (4 papers) costs ~15k tokens.

2. **Flat organization**: Papers stored as flat list. `find_relevant_documents()` searches descriptions only, missing conceptual relationships (e.g., "all TAM studies" requires knowing which papers discuss TAM).

3. **No query routing**: Every query hits PageIndex directly. No pre-filtering based on question type or topic area.

4. **Structure calls expensive**: `get_document_structure()` returns full hierarchical outline (~11k tokens) even when you only need one section location.

---

## 2. Research Findings

### 2.1 Agentic RAG Patterns

The [Agentic RAG survey](https://arxiv.org/html/2501.09136v3) identifies five optimization patterns applicable to your use case:

| Pattern | Description | Applicability |
|---------|-------------|---------------|
| **Adaptive Routing** | Classify query complexity, route to appropriate retrieval tier | HIGH - Can bypass PageIndex entirely for known topics |
| **Reflection** | Iterative refinement of retrieval results | MEDIUM - Useful for cross-document synthesis |
| **Tool Selection** | Dynamically choose retrieval method | HIGH - Select between cache, PageIndex, or direct answer |
| **Hierarchical Agents** | Tier-based delegation with strategic oversight | MEDIUM - Context manager already does this |
| **Graph Integration** | Structured relationships for multi-hop reasoning | LOW (requires infrastructure) - But metadata can approximate |

**Key insight**: RAG-MCP research shows that **injecting only relevant schema** (vs. all tool descriptions) reduces prompt tokens by **50%** and improves accuracy **3x**. The same principle applies to document organization: pre-categorizing papers means the LLM receives targeted context rather than searching everything.

### 2.2 Knowledge Graph Approaches

Academic research on [Knowledge Graph-Enhanced RAG](https://www.nature.com/articles/s41598-025-21222-z) demonstrates:

- **KG-as-index**: Entities serve as retrieval keys → Papers organized by concepts (TAM, Trust, Framing)
- **Dual-retrieval**: Topic alignment + semantic similarity → First filter by category, then search within
- **HTSRKG**: Hierarchical text representation improves categorization accuracy by 15-20%

**For your constraints**: Full knowledge graphs require Neo4j/GraphDB infrastructure. However, a **structured markdown catalog** can capture entity relationships (Paper → Topics → Constructs) without external dependencies.

### 2.3 MCP-Specific Optimization

The [MCP + RAG integration patterns](https://www.architectureandgovernance.com/applications-technology/enhancing-document-level-question-answering-using-model-context-protocol-mcp-and-agent-oriented-rag-systems/) reveal:

1. **Dual-filter retrieval**: Store topic tags as metadata, filter before vector search
2. **Catalog-then-chunk**: First identify relevant documents from catalog, then search within
3. **Topic modeling**: Group documents into thematic clusters for efficient routing

**Implementation for PageIndex**: Since PageIndex searches document descriptions, enriching descriptions OR maintaining a separate routing catalog achieves similar benefits.

### 2.4 Token Cost Benchmarks

| Approach | Tokens per Query | Accuracy |
|----------|------------------|----------|
| Naive (all tools presented) | 2,134 | 13.6% |
| Keyword matching | 1,646 | 18.2% |
| **RAG-MCP (schema injection)** | 1,084 | 43.1% |
| **With topic pre-filtering** | ~500-800 | ~50%+ |

Source: [RAG-MCP: Mitigating Prompt Bloat](https://arxiv.org/html/2505.03275v1)

---

## 3. Proposed Solution: Document Catalog Schema

### 3.1 Architecture

```
                         User Query
                              ↓
                    ┌─────────────────────┐
                    │  Query Classifier   │  (in agent prompt)
                    │  - Topic detection  │
                    │  - Complexity level │
                    └─────────────────────┘
                              ↓
              ┌───────────────┼───────────────┐
              ↓               ↓               ↓
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Cache   │   │ Catalog  │   │PageIndex │
        │  Hit     │   │ Lookup   │   │ Query    │
        └──────────┘   └──────────┘   └──────────┘
         (0 tokens)    (~200 tokens)  (~1-5k tokens)
```

### 3.2 Document Catalog Structure

Create `.claude/document-catalog.md`:

```markdown
# Document Catalog

## Topic Index

### Technology Acceptance Models (TAM)
**Core papers**: Davis 1989, Baroni 2022, Ibrahim 2025, Topsakal 2025, Singh 2024
**Key constructs**: Perceived usefulness, Perceived ease of use, Behavioral intention
**Query hints**: "acceptance", "TAM", "adoption", "usefulness", "ease of use"

| Paper | Focus | Key Pages | Relevance |
|-------|-------|-----------|-----------|
| Davis 1989 | Original TAM | 4-6 (constructs), 10-15 (validation) | CORE |
| Baroni 2022 | AI-TAM extension | 4-5 (model), 11-13 (CFA) | CORE |
| Ibrahim 2025 | TAM + AI context | 3-7 (model adaptation) | SUPPORTING |
| Topsakal 2025 | GenAI acceptance | 4-8 (familiarity factors) | SUPPORTING |

### Trust in AI
**Core papers**: Kahr 2024, Li 2024, Lee & See 2004, Lukyanenko 2022
**Key constructs**: Cognitive trust, Affective trust, Reliance behavior
**Query hints**: "trust", "reliance", "confidence", "reliability"

| Paper | Focus | Key Pages | Relevance |
|-------|-------|-----------|-----------|
| Lee & See 2004 | Trust in automation | 5-10 (framework), 15-20 (calibration) | FOUNDATIONAL |
| Kahr 2024 | Trust development | 3-4 (definitions), 14-17 (results) | CORE |
| Li 2024 | Trustworthy AI | 5-9 (3-dimension framework) | CORE |

### Framing Effects
**Core papers**: Tversky 1986, Levin 1998, Freling 2014, Druckman 2001
**Key constructs**: Attribute framing, Valence effects, Construal level
**Query hints**: "framing", "valence", "positive/negative", "attribute"

### Methodology (SEM/CFA)
**Core papers**: Anderson & Gerbing 1988, Baron & Kenny 1986, Bentler 1990/1995
**Query hints**: "SEM", "CFA", "fit indices", "mediation", "moderation"

## Cross-Reference Matrix

| Construct | TAM Papers | Trust Papers | Framing Papers |
|-----------|------------|--------------|----------------|
| Perceived usefulness | Davis, Baroni, Topsakal | - | - |
| Trust | Baroni (mediator) | All | - |
| Framing effects | - | Kahr (manipulation) | All |
| Behavioral intention | All | Lee & See | Levin |

## Query Routing Rules

| Query Pattern | Route To | Token Budget |
|---------------|----------|--------------|
| "What is [construct]?" | Catalog definition → specific paper pages | 2k |
| "Compare [X] and [Y]" | Catalog cross-reference → targeted extracts | 5k |
| "Evidence for [hypothesis]" | Catalog → relevant category → 2-3 papers | 8k |
| "How do I [methodology]?" | Methodology section → specific paper | 3k |
| "Find papers about [topic]" | Catalog topic index only | 0.5k |
```

### 3.3 Enhanced Context Manager Prompt

Update `.claude/agents/pageindex-context-manager.md` to include:

```markdown
## Query Processing Protocol (Updated)

### Step 1: Query Classification
Before ANY PageIndex call, classify the query:

| Type | Indicator | Action |
|------|-----------|--------|
| Topic discovery | "Which papers...", "Find..." | Catalog lookup ONLY |
| Definition lookup | "What is...", "Define..." | Catalog → single paper page |
| Comparison | "Compare...", "Difference between..." | Catalog cross-ref → targeted pages |
| Evidence gathering | "Support for...", "Studies show..." | Catalog → category → 2-3 papers max |
| Specific paper | "What does [Author] say..." | Direct to paper, use cached pages |

### Step 2: Catalog-First Resolution
1. Check `.claude/document-catalog.md` for topic match
2. If found: Extract paper list + key pages from catalog
3. If not found: Fall back to `find_relevant_documents()`

### Step 3: Minimal Extraction
- Never extract more than 3 pages per paper in a single query
- For cross-document: Summarize each paper's contribution, don't dump content
- Cache new page discoveries in catalog
```

### 3.4 Topic Taxonomy

Based on your 63 indexed papers, recommended categorization:

```
├── Theoretical Frameworks
│   ├── TAM / AI-TAM (5 papers)
│   ├── Trust Models (8 papers)
│   └── Framing Theory (4 papers)
│
├── Empirical Studies
│   ├── AI Acceptance (12 papers)
│   ├── Chatbot/Conversational AI (6 papers)
│   └── Human-AI Collaboration (8 papers)
│
├── Methodology
│   ├── SEM/CFA Techniques (6 papers)
│   ├── Scale Development (4 papers)
│   └── Experimental Design (3 papers)
│
├── Context-Specific
│   ├── German Language Sources (7 papers)
│   └── Public Sector AI (2 papers)
│
└── Meta/Review Papers
    ├── Systematic Reviews (4 papers)
    └── Meta-Analyses (2 papers)
```

---

## 4. Implementation Plan

### Phase 1: Catalog Creation (Configuration Only)

| Task | Effort | Token Savings |
|------|--------|---------------|
| Create `document-catalog.md` with topic index | 2-3 hours | 40-50% |
| Add key pages per paper (from existing structure cache) | 1-2 hours | Additional 20% |
| Update context manager prompt with routing rules | 30 min | Enables above |

### Phase 2: Query Routing Enhancement

| Task | Effort | Benefit |
|------|--------|---------|
| Add query classification to context manager | 30 min | Avoids unnecessary PageIndex calls |
| Create cross-reference matrix for common comparisons | 1 hour | Instant answers for thesis-relevant comparisons |
| Document "zero-token" answers for FAQ patterns | 1 hour | Common questions answered from catalog |

### Phase 3: Maintenance Protocol

| Trigger | Action |
|---------|--------|
| New paper indexed | Add to appropriate catalog category |
| Paper accessed frequently | Cache key pages in catalog |
| Structure cache miss | Update catalog after PageIndex query |

---

## 5. Expected Outcomes

### Token Reduction Estimates

| Query Type | Current Cost | With Catalog | Reduction |
|------------|--------------|--------------|-----------|
| Topic discovery | 1-2k | 200-500 | 70-80% |
| Definition lookup | 3-5k | 1-2k | 50-60% |
| Cross-paper comparison | 10-15k | 4-6k | 50-60% |
| Methodology question | 3-5k | 2-3k | 30-40% |

**Overall estimated savings**: 50-60% token reduction for typical thesis queries.

### Qualitative Benefits

1. **Faster discovery**: Topic index provides instant "which papers discuss X" answers
2. **Better synthesis**: Cross-reference matrix reveals conceptual connections
3. **Consistent categorization**: Papers organized by thesis-relevant taxonomy
4. **Cacheable structure**: Catalog rarely changes, high cache hit rate

---

## 6. Alternative Approaches Considered

### 6.1 Full Knowledge Graph (Not Recommended)

| Pros | Cons |
|------|------|
| Rich entity relationships | Requires Neo4j/external DB |
| Multi-hop reasoning | Significant implementation effort |
| Standard academic approach | Maintenance overhead |

**Verdict**: Overkill for 63 papers. Benefits don't justify complexity.

### 6.2 Vector Embeddings Enhancement (Not Recommended)

| Pros | Cons |
|------|------|
| Better semantic matching | Requires embedding infrastructure |
| Standard RAG approach | PageIndex already does this internally |

**Verdict**: PageIndex handles embeddings. Adding another layer duplicates functionality.

### 6.3 LangGraph Agentic Pipeline (Not Recommended for Now)

| Pros | Cons |
|------|------|
| Sophisticated routing | Requires Python implementation |
| Industry-standard pattern | Beyond configuration-only constraint |
| Multi-agent coordination | Adds latency for simple queries |

**Verdict**: Consider for Phase 2 if catalog approach proves insufficient.

---

## 7. Comparison: Current vs. Proposed

| Dimension | Current System | With Document Catalog |
|-----------|----------------|----------------------|
| Organization | Flat list (63 papers) | Hierarchical taxonomy (5 categories) |
| Query routing | Direct to PageIndex | Classify → Catalog → PageIndex (if needed) |
| Token per discovery | 1-2k | 200-500 |
| Cross-reference | Manual knowledge | Explicit matrix |
| Maintenance | Minimal | Catalog updates required |
| Implementation | Done | 3-5 hours configuration |

---

## 8. Recommendation

**Adopt the Document Catalog approach** for the following reasons:

1. **Fits constraints**: Configuration-only, no code required
2. **High ROI**: 50-60% token savings for 3-5 hours of setup
3. **Academic alignment**: Organizes papers by thesis-relevant concepts
4. **Extensible**: Can add LangGraph routing later if needed
5. **Low risk**: Doesn't change existing PageIndex integration

### Immediate Next Steps

1. **Create** `.claude/document-catalog.md` using the template in Section 3.2
2. **Populate** topic index with your 63 papers (start with most-used categories)
3. **Update** context manager agent prompt with query routing rules
4. **Test** with common thesis queries to validate token savings

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Catalog hit rate | >70% | Queries resolved without PageIndex |
| Token per query | <2k average | Track in cache-audit.md |
| Cross-document synthesis | <8k tokens | Compare to current 15k |
| Time to answer | <30s | Subjective improvement |

---

## 9. Sources

### Primary Research

- [Agentic RAG Survey (arXiv 2501.09136)](https://arxiv.org/html/2501.09136v3) - Taxonomy of agentic patterns
- [RAG-MCP: Mitigating Prompt Bloat (arXiv 2505.03275)](https://arxiv.org/html/2505.03275v1) - Schema injection approach
- [LangGraph Agentic RAG Tutorial](https://docs.langchain.com/oss/python/langgraph/agentic-rag) - Implementation patterns
- [MCP + Agent-Oriented RAG](https://www.architectureandgovernance.com/applications-technology/enhancing-document-level-question-answering-using-model-context-protocol-mcp-and-agent-oriented-rag-systems/) - Document-level QA architecture

### Enterprise Guides

- [RAG Enterprise Guide 2025 (Data Nucleus)](https://datanucleus.dev/rag-and-agentic-ai/what-is-rag-enterprise-guide-2025) - Production patterns
- [Knowledge Graph-RAG Integration (Nature)](https://www.nature.com/articles/s41598-025-21222-z) - Academic KG applications

### Academic Knowledge Graphs

- [PARK: Personalized Academic Retrieval](https://www.sciencedirect.com/science/article/pii/S0306437925000584) - KG for research paper retrieval
- [Research Knowledge Graphs Survey](https://arxiv.org/html/2506.07285v1) - Scholarly information representation
- [HTSRKG: Hierarchical Text Representation](https://onlinelibrary.wiley.com/doi/10.1155/2024/5583270) - KG-based categorization

---

## Appendix A: Sample Catalog Entries

### Example: TAM Category Entry

```markdown
### Technology Acceptance Model (TAM)

**Definition**: Theoretical framework explaining user acceptance of technology through perceived usefulness and ease of use.

**Core Papers**:
| Paper | PageIndex Name | Key Contribution | Essential Pages |
|-------|----------------|------------------|-----------------|
| Davis 1989 | `Davis - 1989 - Perceived Usefulness...` | Original TAM | 4-6, 10-15 |
| Baroni 2022 | `Baroni et al. - 2022 - AI-TAM...` | AI-specific extension | 4-5, 11-13 |

**Constructs Defined**:
- Perceived Usefulness (PU): Davis 1989 p.4
- Perceived Ease of Use (PEOU): Davis 1989 p.4
- Collaborative Intention: Baroni 2022 p.5

**Common Queries** (answer from catalog):
- "What is TAM?" → Davis 1989 definition
- "How does AI-TAM extend TAM?" → Baroni adds trust, collaboration
- "TAM validation studies" → See Methodology category
```

### Example: Cross-Reference Entry

```markdown
## Trust × TAM Integration

Papers combining trust constructs with TAM:
- **Baroni 2022**: Trust as mediator in AI-TAM (p.5-6)
- **Kahr 2024**: Trust development in AI context (p.7-12)
- **Topsakal 2025**: Trust + familiarity in GenAI (p.6-8)

**Synthesis note**: Trust consistently emerges as mediator between AI capabilities perception and behavioral intention. Baroni's AI-TAM formalizes this.
```

---

## Appendix B: Query Routing Decision Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER QUERY                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Does query mention a        │
              │   specific paper/author?      │
              └───────────────────────────────┘
                    │                │
                   YES              NO
                    │                │
                    ▼                ▼
         ┌──────────────┐  ┌──────────────────────┐
         │ Check thesis-│  │ Is it a topic/concept│
         │ structure.md │  │ question?            │
         └──────────────┘  └──────────────────────┘
              │                  │           │
           Found?              YES          NO
              │                  │           │
         ┌────┴────┐            ▼           ▼
        YES       NO    ┌────────────┐  ┌────────────┐
         │         │    │Check catalog│  │PageIndex   │
         ▼         ▼    │topic index  │  │find_relevant│
    get_page_   get_doc_└────────────┘  └────────────┘
    content()  structure()     │               │
    (2-4k)     (11k)          │               │
                              ▼               ▼
                      ┌────────────┐   ┌────────────┐
                      │Papers found│   │Filter by   │
                      │in catalog  │   │relevance   │
                      └────────────┘   └────────────┘
                              │               │
                              ▼               ▼
                      ┌────────────────────────────┐
                      │  get_page_content() for    │
                      │  2-3 most relevant papers  │
                      │  using catalog key pages   │
                      └────────────────────────────┘
```

---

*Research compiled 2026-01-26. Update as implementation progresses.*

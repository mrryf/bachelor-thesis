# Specs: PageIndex Evaluation for Bachelor Thesis Document Generation

## Overview

This document evaluates **PageIndex**, a vectorless, reasoning-based retrieval framework, for use in the bachelor thesis project. The focus is on the **document generation workflow** (LaTeX thesis), not the web application.

### What is PageIndex?

PageIndex transforms documents into a **hierarchical tree-structured index** (like an enriched table of contents with summaries) that LLMs can navigate through reasoning rather than vector similarity search. Key characteristics:

- **Vectorless**: No embeddings, no vector database required
- **Reasoning-based retrieval**: LLM decides what to read based on document structure
- **Traceable**: Every retrieval path is transparent and auditable
- **Hierarchical**: Documents represented as navigable tree structures

### Analogy

| Approach | For Code | For Documents |
|----------|----------|---------------|
| Traditional | Vector DB RAG | Vector DB RAG |
| Agentic | `llms.txt` + grep | **PageIndex** |

Just as Claude Code uses `llms.txt` and simple tools (grep, glob) to navigate codebases without vector search, PageIndex provides a similar "reasoning over structure" approach for long-form documents.

---

## Use Cases for Bachelor Thesis

Based on user requirements, three use cases are identified:

### 1. Writing Assistance (Drafting Thesis Sections)

**Scenario**: AI helps draft new sections of the thesis document.

**How PageIndex Could Help**:
- Index the **existing thesis content** so the LLM understands the current state
- Index **reference papers/sources** for grounded writing
- LLM can navigate to relevant sections before drafting new content
- Ensures consistency with existing content (terminology, style, arguments)

**Current Thesis Structure** (candidate for indexing):
```
content/
├── prestudy/
│   ├── main.tex
│   ├── sections/           # 13+ section files
│   └── sections_required/  # University requirements
├── thesis/
│   ├── main.tex
│   └── sections/
└── resources/
    └── tables/             # Hypotheses, glossary, etc.
```

### 2. Querying Existing Thesis Content

**Scenario**: Ask questions about your own thesis to find information.

**Examples**:
- "Where do I discuss the TAM model?"
- "What hypotheses relate to trust in AI?"
- "What did I write about the Framing-Effekt?"

**How PageIndex Could Help**:
- Create a tree index of the entire thesis
- Query returns specific section/page references
- Useful during writing to avoid contradictions or find where to add content

### 3. Research Retrieval (Source Documents)

**Scenario**: Retrieve information from academic papers, references, and research materials.

**How PageIndex Could Help**:
- Index PDF papers you're citing
- Ask questions across multiple papers
- Get precise page-level citations
- Compare findings across sources

---

## Technical Implementation Options

### Option A: PageIndex MCP Server (Recommended for Evaluation)

**What it is**: Model Context Protocol server that exposes PageIndex tools to Claude.

**Setup**:
1. Install via Claude Desktop extension or Cursor
2. No additional infrastructure required
3. Upload documents to PageIndex service

**Pros**:
- Zero infrastructure to manage
- Direct integration with Claude Code / Claude Desktop
- Free tier available (no Claude Pro required for Desktop)

**Cons**:
- Documents uploaded to external service (privacy consideration)
- Dependency on external service availability
- Limited customization

**Configuration** (for manual MCP setup):
```json
{
  "mcpServers": {
    "pageindex": {
      "command": "npx",
      "args": ["-y", "@anthropic/pageindex-mcp"]
    }
  }
}
```

### Option B: PageIndex API

**What it is**: REST API for programmatic document indexing and querying.

**Setup**:
```python
pip install pageindex

from pageindex import PageIndexClient
client = PageIndexClient(api_key="YOUR_API_KEY")

# Index a document
result = client.submit_document("./thesis.pdf")
doc_id = result["doc_id"]

# Query
tree = client.get_tree(doc_id)
```

**Pros**:
- Programmatic control
- Can integrate into build scripts
- Batch processing possible

**Cons**:
- Requires API key management
- Additional scripting needed
- Same privacy considerations as MCP

### Option C: Self-Hosted PageIndex (Open Source)

**What it is**: Run PageIndex locally using the open-source implementation.

**Setup**:
```bash
git clone https://github.com/VectifyAI/PageIndex
pip install -r requirements.txt

# Create .env with OpenAI API key
echo "CHATGPT_API_KEY=your_key" > .env

# Index a document
python run_pageindex.py --pdf_path ./thesis.pdf
```

**Pros**:
- Full control over data
- No external service dependency
- Customizable (model selection, parameters)

**Cons**:
- Requires OpenAI API key (cost)
- More setup complexity
- Manual integration needed

---

## Feasibility Assessment

### Technical Feasibility

| Factor | Assessment | Notes |
|--------|------------|-------|
| LaTeX support | **Partial** | PageIndex works with PDF/Markdown. Would need to compile LaTeX to PDF first, or convert to Markdown. |
| Multi-file documents | **Yes** | Can index compiled thesis PDF as single document |
| German language | **Likely** | Uses GPT-4o which handles German well |
| Citation tracking | **Unknown** | Need to test if page references work with academic citations |
| Local operation | **Yes** | Self-hosted option available |

### Workflow Integration

**Current Build Pipeline**:
```
LaTeX sources → build.sh → PDF output
```

**Potential PageIndex Integration**:
```
LaTeX sources → build.sh → PDF → PageIndex index → Claude queries
```

### Comparison with Alternatives

| Approach | Setup | Maintenance | Retrieval Quality | Cost |
|----------|-------|-------------|-------------------|------|
| **PageIndex MCP** | Low | None | High (reasoning-based) | Free tier |
| **PageIndex API** | Medium | Low | High | API costs |
| **PageIndex Self-hosted** | High | Medium | High | OpenAI API |
| **Vector DB (e.g., Chroma)** | High | High | Medium | Embedding costs |
| **Simple grep/search** | None | None | Low | Free |

---

## Challenges and Open Questions

### Challenge 1: LaTeX vs PDF

PageIndex primarily works with PDFs. Options:
1. **Compile to PDF first** → Index the PDF (loses source file granularity)
2. **Convert to Markdown** → Index Markdown (some LaTeX features lost)
3. **Index individual .tex files** → Unclear if this works well

### Challenge 2: Incremental Updates

When you edit a section:
- Does the entire index need regeneration?
- How to handle frequent small changes during writing?

### Challenge 3: Reference Papers

For research retrieval:
- Where are your reference papers stored?
- How many papers would need indexing?
- Some papers may be copyrighted (service upload considerations)

### Challenge 4: Integration Workflow

How would this fit into your daily workflow?
- Query via Claude Code CLI?
- Query via Claude Desktop?
- Automated queries during build?

---

## Recommended Evaluation Steps

### Phase 1: Quick Validation (Low Effort)

1. **Install PageIndex MCP** in Claude Desktop
   - Download extension from https://pageindex.ai/mcp
   - No coding required

2. **Upload thesis PDF**
   - Compile current thesis: `./scripts/build.sh --prestudy`
   - Upload PDF to PageIndex

3. **Test queries**:
   - "What are the hypotheses in this thesis?"
   - "Summarize the methodology section"
   - "Where is TAM discussed?"

**Success criteria**: Queries return accurate, page-referenced answers.

### Phase 2: Research Retrieval Test

1. Upload 2-3 key reference papers
2. Test cross-document queries:
   - "How do these papers define trust in AI?"
   - "Compare the TAM extensions in paper A vs B"

### Phase 3: Writing Assistance Test

1. Ask Claude to draft a new paragraph based on indexed context
2. Verify it maintains consistency with existing content
3. Check citation accuracy

---

## Decision Framework

### Use PageIndex If:

- You want **traceable retrieval** (know exactly where info came from)
- You're working with **structured long documents** (thesis chapters, academic papers)
- You prefer **minimal infrastructure** (MCP is zero-setup)
- You value **reasoning over similarity** (better for precise academic questions)

### Don't Use PageIndex If:

- You need to search across **hundreds of loosely related documents**
- Your queries are **fuzzy/exploratory** rather than specific
- You need **real-time indexing** of frequently changing files
- **Privacy is critical** and self-hosting is too complex

---

## Alternative Approaches to Consider

### 1. Claude Code Native (Current State)

Claude Code already has file reading capabilities. For your thesis:
- Read .tex files directly with the Read tool
- Use Grep for keyword search
- Use Task agents for exploration

**Limitation**: No persistent "memory" of document structure between sessions.

### 2. llms.txt for Thesis

Create a curated `llms.txt` describing your thesis structure:

```
# Bachelor Thesis: Trust in AI

## Prestudy (content/prestudy/)
- main.tex: Entry point, includes all sections
- sections/01_introduction.tex: Introduction and motivation
- sections/02_theory.tex: TAM, AI-TAM, Framing-Effekt theory
- sections/03_methodology.tex: Research design and experiment
...
```

This gives Claude a "map" to navigate your thesis without external services.

### 3. Custom MCP Server

Build a simple MCP server that:
- Parses your LaTeX files
- Exposes search/navigation tools
- Maintains structure awareness

---

## Summary

| Aspect | Assessment |
|--------|------------|
| **Concept fit** | High - thesis is exactly the kind of structured long document PageIndex targets |
| **Technical feasibility** | Medium - LaTeX → PDF conversion adds a step |
| **Effort to evaluate** | Low - MCP extension requires no coding |
| **Potential benefit** | High for querying and research retrieval |
| **Risk** | Low - can evaluate without commitment |

**Recommendation**: Start with Phase 1 (MCP quick validation) to determine if the retrieval quality meets your needs before investing in deeper integration.

---

## Next Steps

- [ ] Install PageIndex MCP extension in Claude Desktop
- [ ] Compile thesis PDF and upload for indexing
- [ ] Run test queries to validate retrieval quality
- [ ] Document findings and decide on further integration

---

## References

- [PageIndex Website](https://pageindex.ai)
- [PageIndex GitHub](https://github.com/VectifyAI/PageIndex)
- [PageIndex MCP Setup](https://pageindex.ai/mcp)
- [PageIndex Documentation](https://docs.pageindex.ai)
- [Agentic Retrieval Blog Post](https://vectifyai.notion.site/agentic-retrieval)

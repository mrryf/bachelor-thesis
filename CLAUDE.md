# Bachelor Thesis Project Instructions

This file contains Claude Code instructions specific to this bachelor thesis project.

## Document Scope Configuration

The Research Config Manager app manages which PageIndex documents are available for querying. The configuration is stored in `.claude/document-scope.json`.

### Configuration File Format

```json
{
  "version": "1.0",
  "lastModified": "2026-01-26T12:00:00.000Z",
  "enabled": ["Davis - 1989 - Perceived Usefulness.pdf", "..."],
  "disabled": ["Bentler - 1995 - EQS 6.pdf", "..."],
  "metadata": {
    "totalDocuments": 63,
    "enabledCount": 60,
    "disabledCount": 3
  }
}
```

### Enforcement Rules

**Before any PageIndex query, Claude MUST:**

1. Read `.claude/document-scope.json`
2. Check if the target document is in the `disabled` array
3. If disabled, inform the user instead of querying:
   > "That document is currently disabled in your research scope. Enable it in the Config Manager if you need to query it."
4. If the document is in `enabled` or neither array, proceed normally

### Scope Modes

| Document State | Behavior |
|----------------|----------|
| In `enabled` array | Always queryable |
| In `disabled` array | Never queryable - inform user |
| In neither array | Queryable (backwards compatible) |
| Both arrays empty | All documents queryable |
| Config file missing | All documents queryable (fallback) |

### Example Workflow

**Scenario: User queries a disabled document**
```
User: "What does Bentler 1995 say about fit indices?"

Claude:
1. Read .claude/document-scope.json
2. Find "Bentler - 1995 - EQS 6..." in disabled array
3. Response: "The Bentler 1995 document is currently disabled in your
   research scope. Enable it in the Config Manager if you need to query it."
```

**Scenario: User queries an enabled document**
```
User: "Summarize Davis 1989"

Claude:
1. Read .claude/document-scope.json
2. Find "Davis - 1989 - Perceived Usefulness..." in enabled array
3. Proceed with PageIndex query
```

### Error Handling

- If `document-scope.json` is malformed: log warning, proceed with all docs
- If file read fails: log warning, proceed with all docs
- Never completely block the user due to scope config issues

### Integration with pageindex-context-manager Agent

The `pageindex-context-manager` agent enforces these rules automatically. When spawning this agent for PageIndex queries, it will:
1. Check scope before any `find_relevant_documents()` or `get_page_content()` call
2. Filter out disabled documents from search results
3. Return appropriate messages for disabled document requests

## Electron Debugging Protocols

### Path Mismatch Protocol

When seeing "Unable to load [preload/main] script: /path/to/file":

1. **FIRST**: Grep for where that path is referenced in source
   ```bash
   grep -r "preload" src/main/  # for preload errors
   grep -r "index.mjs\|index.js" src/main/  # for specific file
   ```
2. **SECOND**: Check actual build output exists at that path
   ```bash
   ls out/preload/  # or out/main/
   ```
3. **THEN**: Fix either the reference OR the build output

Do NOT assume build config changes will automatically update hardcoded paths.

### General Electron Error Protocol

When debugging Electron errors, follow the error path literally:

| Error Type | First Action |
|------------|--------------|
| "Unable to load script: X" | Grep for where X is referenced |
| "Cannot find module X" | Check if X exists at expected path |
| "contextBridge not defined" | Verify preload loaded successfully first |
| IPC errors | Check channel names match between main/preload/renderer |

**Principle**: Follow the error message literally before theorizing about causes.

### Responsive UI Debugging Protocol

When debugging UI issues in components with multiple responsive variants (mobile/tablet/desktop):

1. **Identify the variant**: Map visual markers in screenshot to breakpoint
   - X close button, full-width panel → tablet/mobile slide panel
   - Small dropdown near trigger button → desktop popover
   - Bottom sheet → mobile

2. **Find the code path**: Locate the exact `{#if}` branch that renders the visible UI
   ```
   Screenshot shows [visual marker] → this is [variant] → rendered at [file:lines]
   ```

3. **Check ALL variants**: Same architectural issue often exists in multiple variants
   | Variant | Condition | Lines | Has Same Issue? |
   |---------|-----------|-------|-----------------|
   | Desktop | `isDesktop` | X-Y | ? |
   | Tablet | `!isDesktop && !isMobile` | X-Y | ? |
   | Mobile | `isMobile` | X-Y | ? |

4. **State your mapping before fixing**: "Screenshot shows tablet view (X button visible) → lines 125-207"

**Common gotcha**: Fixing desktop popover while user sees tablet panel.

### CSS Stacking Context Protocol

When `position: fixed` elements appear behind other content:

1. **Check parent elements** for properties that create containing blocks:
   - `backdrop-blur` / `filter`
   - `transform`
   - `perspective`
   - `contain: paint`

2. **Solution**: Use Portal to render outside the parent DOM tree
   ```svelte
   <Portal>
     <div class="fixed ...">...</div>
   </Portal>
   ```

3. **Check ALL fixed-position elements** in the component, not just one

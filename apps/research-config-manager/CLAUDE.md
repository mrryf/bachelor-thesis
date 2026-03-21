# Research Config Manager — Electron App

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

| Error Type                  | First Action                                            |
| --------------------------- | ------------------------------------------------------- |
| "Unable to load script: X"  | Grep for where X is referenced                          |
| "Cannot find module X"      | Check if X exists at expected path                      |
| "contextBridge not defined" | Verify preload loaded successfully first                |
| IPC errors                  | Check channel names match between main/preload/renderer |

**Principle**: Follow the error message literally before theorizing about causes.

### Responsive UI Debugging Protocol

When debugging UI issues in components with multiple responsive variants (mobile/tablet/desktop):

1. **Identify the variant**: Map visual markers in screenshot to breakpoint
   - X close button, full-width panel → tablet/mobile slide panel
   - Small dropdown near trigger button → desktop popover
   - Bottom sheet → mobile

2. **Find the code path**: Locate the exact `{#if}` branch that renders the visible UI

3. **Check ALL variants**: Same architectural issue often exists in multiple variants

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

3. **Check ALL fixed-position elements** in the component, not just one

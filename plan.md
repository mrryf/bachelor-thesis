# Research Config Manager Redesign - Implementation Plan

**Created**: 2026-01-26
**Status**: Planning → Implementation
**Target Branch**: refactor-design-config-manager
**Estimated Total Effort**: 18-26 hours

---

## Executive Summary

This plan outlines the complete redesign of the research-config-manager Electron app, transforming it from a space-inefficient, desktop-only interface into a compact, elegant, mobile-responsive application.

**Core Goals:**
1. Reduce vertical chrome from 300px to <120px (save ~190px)
2. Compact document cards from 120px to 60px (2x more items visible)
3. Add full mobile support (minimum 320px width)
4. Apply professional interactive polish (spotlight, glow, ripple effects)
5. Eliminate redundant UI elements (duplicate search bars)
6. Improve information hierarchy (content over technical metadata)

**Key Metrics:**
- **Space Efficiency**: 2x more documents visible on screen
- **Mobile Support**: 100% feature parity down to 320px width
- **Performance**: Maintain 60fps for all animations
- **Code Quality**: 25% code reduction through consolidation

---

## Design Decisions

Based on research analysis and user confirmation:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Layout Mode** | Always compact list | Simple, proven, space-efficient. Matches original MCP Config Manager. |
| **Animation Level** | Medium (spotlight + border glow + ripple) | Professional polish without being playful. No particles/tilt. |
| **Mobile Action Bar** | Sticky bottom bar | Always accessible, common mobile pattern (iOS/Android). |
| **Document Display** | Short citation + focus/purpose | Emphasizes content over technical metadata (addresses user complaint). |
| **Category Display** | Top N + "More" dropdown | Common categories visible, uncommon ones in dropdown. |
| **Search Behavior** | Live search (current behavior) | Works well for small lists (<100 docs). |
| **Hover on Mobile** | Disabled | Hover doesn't translate to touch. Optimize for tap interactions. |

---

## Implementation Phases

### Phase 1: Research ✅ COMPLETE
**Status**: Done
**Output**: research-config-manager.md (comprehensive design analysis)

### Phase 2: Core Refactor 🔴 CRITICAL
**Priority**: CRITICAL (blocks all other work)
**Estimated Effort**: 8-12 hours
**Goal**: Consolidate layout, reduce vertical space, eliminate redundancy

### Phase 3: Responsive System 🟡 HIGH
**Priority**: HIGH (required for mobile support)
**Estimated Effort**: 6-8 hours
**Goal**: Mobile-first responsive design, touch optimizations
**Dependencies**: Phase 2 must be complete

### Phase 4: Interactive Polish 🟢 MEDIUM
**Priority**: MEDIUM (nice-to-have)
**Estimated Effort**: 4-6 hours
**Goal**: Professional animations and visual feedback
**Dependencies**: Phase 2 must be complete

---

## Phase 2: Core Refactor - Detailed Tasks

### Milestone Goal
Transform layout from 5 separate components (300px chrome) into 3 consolidated components (<120px chrome) while maintaining all functionality.

---

#### Task 2.1: Install Dependencies
**Priority**: CRITICAL
**Effort**: 10 minutes
**Dependencies**: None

**Actions:**
```bash
cd apps/research-config-manager
npm install gsap@^3.12.5
```

**Success Criteria:**
- [ ] GSAP installed in package.json
- [ ] No installation errors
- [ ] Dev server restarts successfully

---

#### Task 2.2: Create CompactHeader Component
**Priority**: CRITICAL
**Effort**: 2 hours
**Dependencies**: Task 2.1
**Files Created**: `src/renderer/src/lib/components/layout/CompactHeader.svelte`

**Requirements:**
- Merge functionality from Header.svelte + StatsBar.svelte
- Single search input (remove duplicate from DocumentFilters)
- Inline stats display (desktop) or stacked (mobile)
- Bulk action buttons (Enable All, Disable All, Refresh)
- Sticky header (top-0 z-10)
- Target height: ~60px (desktop), ~80px (mobile)

**Component Structure:**
```svelte
<header class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
  <div class="flex items-center justify-between gap-4 px-4 py-3">
    <!-- Left: Search (flex-1 max-w-md) -->
    <!-- Center: Stats (hidden on mobile, inline on desktop) -->
    <!-- Right: Action buttons -->
  </div>
  <!-- Mobile stats row (md:hidden) -->
</header>
```

**Success Criteria:**
- [ ] Height ≤60px on desktop
- [ ] Height ≤80px on mobile
- [ ] Search connects to documentStore.state.searchQuery
- [ ] Stats update reactively ($derived)
- [ ] Buttons trigger bulk enable/disable/refresh actions
- [ ] Sticky positioning works during scroll
- [ ] No visual regressions

**Testing:**
- [ ] Search filters documents correctly
- [ ] Stats reflect accurate counts
- [ ] Buttons work for all actions
- [ ] Responsive at 320px, 768px, 1920px widths

---

#### Task 2.3: Create QuickFilters Component
**Priority**: CRITICAL
**Effort**: 1.5 hours
**Dependencies**: Task 2.1
**Files Created**: `src/renderer/src/lib/components/documents/QuickFilters.svelte`

**Requirements:**
- Horizontal scrolling category chips
- "All" button (shows total count)
- Top N categories visible inline (suggest N=5)
- "+X more" dropdown for remaining categories
- Clear filter button (when category selected)
- Target height: ~50px

**Component Structure:**
```svelte
<div class="border-b bg-card/50 px-4 py-3">
  <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide">
    <Button variant={selected === null ? 'default' : 'outline'}>All (52)</Button>
    {#each topCategories as cat}
      <Button variant={selected === cat ? 'default' : 'outline'}>
        {cat.name} ({cat.count})
      </Button>
    {/each}
    <Select.Root><!-- +X more --></Select.Root>
    {#if selected}<Button variant="ghost"><X /></Button>{/if}
  </div>
</div>
```

**Success Criteria:**
- [ ] Height ≤50px
- [ ] Categories sorted by count (descending)
- [ ] Horizontal scroll works smoothly
- [ ] No horizontal overflow on mobile
- [ ] "All" button shows correct total
- [ ] Clear button appears only when filter active
- [ ] Selection updates documentStore.state.selectedCategory

**Testing:**
- [ ] Click category → documents filter correctly
- [ ] Click "All" → shows all documents
- [ ] Click clear → resets to "All"
- [ ] Dropdown shows remaining categories
- [ ] Scrollbar hidden but scrolling works

---

#### Task 2.4: Refactor to DocumentCard Component
**Priority**: CRITICAL
**Effort**: 2 hours
**Dependencies**: Task 2.1
**Files Created**: `src/renderer/src/lib/components/documents/DocumentCard.svelte`
**Files Modified**: Types (if needed)

**Requirements:**
- Compact layout: ~60px total height
- Information hierarchy:
  1. Icon + short citation (primary, bold)
  2. Focus/purpose (secondary, 1 line truncated)
  3. Category badges (max 3 visible) + relevance badge
  4. Compact metrics (pages, tokens inline)
  5. Toggle switch (right-aligned)
- Remove full PDF filename from primary display (move to tooltip)
- Prepare for spotlight/glow effects (Phase 4)

**Component Structure:**
```svelte
<div class="group relative flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors">
  <!-- Spotlight/glow overlays (empty in Phase 2) -->
  <FileText class="h-4 w-4 shrink-0 text-muted-foreground" />

  <div class="flex-1 min-w-0">
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm font-medium truncate">{doc.shortCitation}</p>
      <Switch checked={doc.enabled} onCheckedChange={handleToggle} />
    </div>
    <p class="text-xs text-muted-foreground line-clamp-1 mt-0.5">
      {doc.focus || doc.name}
    </p>
    <div class="flex items-center gap-1.5 mt-1">
      {#each doc.categories.slice(0, 3) as cat}
        <Badge variant="secondary" class="text-[10px]">{cat}</Badge>
      {/each}
      <Badge variant="outline" class="text-[10px]">{doc.relevance}</Badge>
      <span class="text-[10px] text-muted-foreground">
        {doc.pages}p • {formatTokens(doc.tokenEstimate)}
      </span>
    </div>
  </div>
</div>
```

**Success Criteria:**
- [ ] Height ≤60px
- [ ] Text truncates cleanly (no overflow)
- [ ] Categories limited to 3 max
- [ ] Toggle switch works
- [ ] Hover state visible
- [ ] All information readable
- [ ] PDF filename moved to title attribute (tooltip)

**Testing:**
- [ ] Toggle switch enables/disables document
- [ ] Long citations truncate with ellipsis
- [ ] Long focus text truncates with ellipsis
- [ ] Hover on card shows tooltip with full PDF name
- [ ] Badges render correctly
- [ ] Metrics format correctly (e.g., "45k tok" not "45,000 tokens")

---

#### Task 2.5: Create DocumentGrid Component
**Priority**: CRITICAL
**Effort**: 1 hour
**Dependencies**: Task 2.4
**Files Created**: `src/renderer/src/lib/components/documents/DocumentGrid.svelte`

**Requirements:**
- Wrapper for document list
- Single-column grid (Phase 2), extensible for multi-column (future)
- ScrollArea container
- Loading state
- Empty state
- Error state

**Component Structure:**
```svelte
<ScrollArea class="flex-1">
  {#if isLoading}
    <LoadingSpinner />
  {:else if error}
    <ErrorMessage {error} />
  {:else if filteredDocs.length === 0}
    <EmptyState />
  {:else}
    <div class="grid grid-cols-1 gap-1 p-4">
      {#each filteredDocs as doc (doc.name)}
        <DocumentCard {doc} />
      {/each}
    </div>
  {/if}
</ScrollArea>
```

**Success Criteria:**
- [ ] Renders filtered documents
- [ ] Loading state shows during fetch
- [ ] Empty state shows when no results
- [ ] Error state shows on failure
- [ ] Smooth scrolling
- [ ] Proper key for each item (doc.name)

**Testing:**
- [ ] All documents render
- [ ] Search filters update grid
- [ ] Category filters update grid
- [ ] Scroll performance is smooth
- [ ] Empty state shows when search has no results
- [ ] Loading spinner shows during initial load

---

#### Task 2.6: Update App.svelte Layout
**Priority**: CRITICAL
**Effort**: 1 hour
**Dependencies**: Tasks 2.2, 2.3, 2.4, 2.5
**Files Modified**: `src/renderer/src/App.svelte`

**Actions:**
1. Remove old component imports
2. Add new component imports
3. Update layout structure
4. Remove now-unused props/state

**New Layout:**
```svelte
<main class="flex flex-col h-screen">
  <CompactHeader />
  <QuickFilters />
  <DocumentGrid />
</main>
```

**Success Criteria:**
- [ ] Layout uses new components
- [ ] Old components removed
- [ ] Chrome ≤120px total
- [ ] Content area = calc(100vh - 120px)
- [ ] No console errors
- [ ] All features work

**Testing:**
- [ ] App loads without errors
- [ ] All CRUD operations work
- [ ] Search works
- [ ] Filters work
- [ ] Enable/disable works
- [ ] Refresh works

---

#### Task 2.7: Update Document Store
**Priority**: HIGH
**Effort**: 30 minutes
**Dependencies**: None (can be done early)
**Files Modified**: `src/renderer/src/lib/stores/document-store.svelte.ts`

**Actions:**
- Add viewport tracking state
- Add view mode state (for future extensibility)
- Add filters collapsed state (for mobile)

**Changes:**
```typescript
interface DocumentState {
  // ... existing fields
  viewMode: 'compact' | 'list' | 'grid'; // Default: 'compact'
  isMobile: boolean;
  isTablet: boolean;
  filtersCollapsed: boolean; // Default: true on mobile
}

class DocumentStore {
  // Add responsive helpers
  setViewportSize(width: number): void {
    this.state.isMobile = width < 640;
    this.state.isTablet = width >= 640 && width < 1024;
    if (this.state.isMobile) {
      this.state.filtersCollapsed = true; // Auto-collapse on mobile
    }
  }

  toggleFilters(): void {
    this.state.filtersCollapsed = !this.state.filtersCollapsed;
  }
}
```

**Success Criteria:**
- [ ] Store compiles without errors
- [ ] Backward compatible (no breaking changes)
- [ ] New state properties have defaults
- [ ] Reactive updates work

---

#### Task 2.8: Remove Old Components
**Priority**: MEDIUM (cleanup, can be deferred)
**Effort**: 15 minutes
**Dependencies**: Task 2.6 (App.svelte using new components)

**Files to Delete:**
- `src/renderer/src/lib/components/layout/Header.svelte`
- `src/renderer/src/lib/components/documents/StatsBar.svelte`
- `src/renderer/src/lib/components/documents/DocumentFilters.svelte`
- `src/renderer/src/lib/components/documents/CategoryChips.svelte`
- `src/renderer/src/lib/components/documents/DocumentList.svelte`
- `src/renderer/src/lib/components/documents/DocumentItem.svelte`

**Success Criteria:**
- [ ] Files deleted
- [ ] No import errors
- [ ] Git shows clean deletion (not just commented out)
- [ ] App still works

**Safety Check:**
- Ensure no other files import these components
- Use search to verify: `grep -r "Header.svelte" src/`

---

#### Task 2.9: Visual Regression Testing
**Priority**: HIGH
**Effort**: 1.5 hours
**Dependencies**: Tasks 2.2-2.8 complete

**Test Matrix:**

| Test Case | Desktop (1920px) | Tablet (768px) | Mobile (375px) |
|-----------|------------------|----------------|----------------|
| Chrome height | ≤120px | ≤140px | ≤150px |
| Card height | ~60px | ~60px | ~60px |
| Search works | ✓ | ✓ | ✓ |
| Filters work | ✓ | ✓ | ✓ |
| Toggle works | ✓ | ✓ | ✓ |
| Enable All works | ✓ | ✓ | ✓ |
| Disable All works | ✓ | ✓ | ✓ |
| Refresh works | ✓ | ✓ | ✓ |

**Success Criteria:**
- [ ] All test cases pass
- [ ] No layout breaks
- [ ] No functionality regressions
- [ ] Performance is acceptable

**Tools:**
- Chrome DevTools Device Mode
- Manual testing on real devices (if available)
- Screenshots for before/after comparison

---

## Phase 3: Responsive System - Detailed Tasks

### Milestone Goal
Add full mobile support with touch optimizations, collapsible filters, and mobile-specific components. Support down to 320px width with 100% feature parity.

---

#### Task 3.1: Create Breakpoint Hook
**Priority**: CRITICAL
**Effort**: 30 minutes
**Dependencies**: None
**Files Created**: `src/renderer/src/lib/hooks/useBreakpoint.svelte.ts`

**Implementation:**
```typescript
export function useBreakpoint() {
  let width = $state(window.innerWidth);

  $effect(() => {
    const handleResize = () => {
      width = window.innerWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const isMobile = $derived(width < 640);
  const isTablet = $derived(width >= 640 && width < 1024);
  const isDesktop = $derived(width >= 1024);

  return { isMobile, isTablet, isDesktop, width };
}
```

**Success Criteria:**
- [ ] Hook exports correctly
- [ ] Reactive updates on window resize
- [ ] Cleanup on unmount
- [ ] TypeScript types correct
- [ ] No memory leaks

**Testing:**
- [ ] Import in test component
- [ ] Resize window → values update
- [ ] Breakpoints trigger at correct widths (640px, 1024px)

---

#### Task 3.2: Create MobileActionBar Component
**Priority**: HIGH
**Effort**: 1 hour
**Dependencies**: Task 3.1
**Files Created**: `src/renderer/src/lib/components/mobile/MobileActionBar.svelte`

**Requirements:**
- Sticky bottom bar (fixed position)
- Enable All / Disable All buttons
- Only shown on mobile (< 640px)
- Respects safe area insets (iOS)
- Height: ~52px

**Component Structure:**
```svelte
<script lang="ts">
  import { useBreakpoint } from '$lib/hooks/useBreakpoint.svelte';
  const { isMobile } = useBreakpoint();
</script>

{#if isMobile}
  <div class="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur p-3 flex items-center gap-2 z-20">
    <Button size="sm" variant="default" class="flex-1">Enable All</Button>
    <Button size="sm" variant="outline" class="flex-1">Disable All</Button>
  </div>
{/if}
```

**Success Criteria:**
- [ ] Shows only on mobile
- [ ] Sticky to bottom
- [ ] Doesn't overlap content
- [ ] Buttons work
- [ ] Touch targets ≥44px height

**Testing:**
- [ ] Visible at <640px width
- [ ] Hidden at ≥640px width
- [ ] Buttons trigger bulk actions
- [ ] No z-index conflicts
- [ ] Works with iOS safe area

---

#### Task 3.3: Create MobileFilterSheet Component
**Priority**: HIGH
**Effort**: 1 hour
**Dependencies**: Task 3.1
**Files Created**: `src/renderer/src/lib/components/mobile/MobileFilterSheet.svelte`

**Requirements:**
- Collapsible filter section
- "Filters ▼" trigger button
- Wraps QuickFilters component
- Collapsed by default on mobile
- Expanded by default on desktop
- Height: ~44px (collapsed), dynamic (expanded)

**Component Structure:**
```svelte
<script lang="ts">
  import { useBreakpoint } from '$lib/hooks/useBreakpoint.svelte';
  import Collapsible from '$lib/components/ui/collapsible';
  import QuickFilters from '../documents/QuickFilters.svelte';

  const { isMobile } = useBreakpoint();
  let open = $state(!isMobile);
</script>

{#if isMobile}
  <Collapsible.Root bind:open>
    <Collapsible.Trigger class="w-full border-b p-3 flex items-center justify-between">
      <span class="text-sm font-medium">Filters</span>
      <ChevronDown class="h-4 w-4 transition-transform {open ? 'rotate-180' : ''}" />
    </Collapsible.Trigger>
    <Collapsible.Content>
      <QuickFilters />
    </Collapsible.Content>
  </Collapsible.Root>
{:else}
  <QuickFilters />
{/if}
```

**Success Criteria:**
- [ ] Collapsed by default on mobile
- [ ] Always visible on desktop
- [ ] Smooth expand/collapse animation
- [ ] QuickFilters works when expanded
- [ ] Icon rotates on open/close

**Testing:**
- [ ] Click trigger → filters expand
- [ ] Click again → filters collapse
- [ ] Filters inside work correctly
- [ ] Desktop always shows filters (no collapse)

---

#### Task 3.4: Add Responsive Styles to Components
**Priority**: HIGH
**Effort**: 2 hours
**Dependencies**: Tasks 3.1, 3.2, 3.3
**Files Modified**: All components from Phase 2

**Changes by Component:**

**CompactHeader.svelte:**
- Mobile: Stack stats below search
- Mobile: Icon-only action buttons
- Mobile: Larger touch targets (44px height)

**QuickFilters.svelte:**
- Mobile: Slightly larger button text (improve readability)
- Mobile: Better horizontal scroll affordance

**DocumentCard.svelte:**
- Mobile: Larger toggle switch (20px → 28px)
- Mobile: Show max 2 badges (not 3)
- Mobile: Slightly more padding for touch targets

**DocumentGrid.svelte:**
- Mobile: Add bottom padding for MobileActionBar clearance (60px)
- Mobile: Adjust scroll container height

**Success Criteria:**
- [ ] All components adapt at breakpoints
- [ ] Touch targets ≥44px on mobile
- [ ] No horizontal overflow
- [ ] Text remains readable
- [ ] Layout doesn't break

**Testing:**
- [ ] Test each component at 320px, 375px, 640px, 768px, 1024px, 1920px
- [ ] Verify touch targets with finger (not mouse)
- [ ] Check text truncation

---

#### Task 3.5: Mobile Touch Optimizations
**Priority**: HIGH
**Effort**: 1 hour
**Dependencies**: Task 3.4
**Files Modified**: Multiple components

**Optimizations:**
- Increase toggle switch size on mobile (28px)
- Add padding around clickable elements
- Disable hover states on touch devices
- Prevent double-tap zoom on buttons
- Add active states for visual feedback

**CSS Changes:**
```css
/* Add to globals.css */
@media (max-width: 640px) {
  /* Larger touch targets */
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }

  /* Disable hover on touch */
  .document-card:hover {
    background: inherit;
  }

  /* Better active states */
  button:active {
    transform: scale(0.98);
  }

  /* Prevent double-tap zoom */
  button, a {
    touch-action: manipulation;
  }
}
```

**Success Criteria:**
- [ ] Touch targets ≥44px (WCAG 2.5.5)
- [ ] No hover states on touch devices
- [ ] Active states provide feedback
- [ ] No accidental double-tap zooms
- [ ] Smooth tap interactions

**Testing:**
- [ ] Test on real iOS device (iPhone)
- [ ] Test on real Android device
- [ ] Verify no hover states trigger on tap
- [ ] Check active state feedback

---

#### Task 3.6: Cross-Device Testing
**Priority**: HIGH
**Effort**: 2 hours
**Dependencies**: Tasks 3.1-3.5 complete

**Test Devices:**
- **iPhone SE** (320px width) - Smallest supported
- **iPhone 13** (375px width) - Common
- **iPad Mini** (768px width) - Tablet
- **Desktop** (1920px width) - Desktop

**Test Checklist:**

| Feature | iPhone SE | iPhone 13 | iPad | Desktop |
|---------|-----------|-----------|------|---------|
| Layout renders | ☐ | ☐ | ☐ | ☐ |
| Search works | ☐ | ☐ | ☐ | ☐ |
| Filters toggle | ☐ | ☐ | ☐ | ☐ |
| Category select | ☐ | ☐ | ☐ | ☐ |
| Document toggle | ☐ | ☐ | ☐ | ☐ |
| Enable All | ☐ | ☐ | ☐ | ☐ |
| Disable All | ☐ | ☐ | ☐ | ☐ |
| Refresh | ☐ | ☐ | ☐ | ☐ |
| Smooth scroll | ☐ | ☐ | ☐ | ☐ |
| No overflow | ☐ | ☐ | ☐ | ☐ |

**Success Criteria:**
- [ ] All features work on all devices
- [ ] No layout breaks
- [ ] Smooth performance
- [ ] Touch targets accessible

**Tools:**
- Chrome DevTools Device Mode (initial)
- BrowserStack or real devices (final)
- Screenshots at each breakpoint

---

## Phase 4: Interactive Polish - Detailed Tasks

### Milestone Goal
Add professional animations and visual effects: spotlight on hover, border glow, ripple click feedback. Maintain 60fps performance. Respect accessibility preferences.

---

#### Task 4.1: Create Spotlight Effect
**Priority**: MEDIUM
**Effort**: 1 hour
**Dependencies**: None (Phase 2 must be complete)
**Files Created**: `src/renderer/src/lib/effects/spotlight.ts`

**Implementation:**
```typescript
export function spotlight(node: HTMLElement) {
  const overlay = node.querySelector('.spotlight-overlay');
  if (!overlay) return;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    node.style.setProperty('--mouse-x', `${x}px`);
    node.style.setProperty('--mouse-y', `${y}px`);
  };

  node.addEventListener('mousemove', handleMouseMove);

  return {
    destroy() {
      node.removeEventListener('mousemove', handleMouseMove);
    }
  };
}
```

**CSS:**
```css
.spotlight-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    var(--spotlight-radius, 300px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(132, 0, 255, 0.15),
    transparent 80%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.document-card:hover .spotlight-overlay {
  opacity: 1;
}

@media (max-width: 640px) {
  .spotlight-overlay {
    display: none; /* Disable on mobile */
  }
}
```

**Success Criteria:**
- [ ] Spotlight follows mouse
- [ ] Smooth gradient transition
- [ ] 300px radius
- [ ] Disabled on mobile
- [ ] No performance impact

**Testing:**
- [ ] Hover over card → spotlight appears
- [ ] Move mouse → spotlight follows
- [ ] Leave card → spotlight fades out
- [ ] Check FPS (should be 60fps)
- [ ] Verify disabled on mobile

---

#### Task 4.2: Create Border Glow Effect
**Priority**: MEDIUM
**Effort**: 1 hour
**Dependencies**: Task 4.1
**Files Modified**: `src/renderer/src/lib/effects/spotlight.ts`, animations.css

**CSS:**
```css
.border-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  padding: 1px;
  background: radial-gradient(
    var(--spotlight-radius, 300px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(132, 0, 255, 0.8),
    transparent 40%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.document-card:hover .border-glow {
  opacity: 1;
}

@media (max-width: 640px) {
  .border-glow {
    display: none;
  }
}
```

**Success Criteria:**
- [ ] Border glows on hover
- [ ] Follows mouse position (same as spotlight)
- [ ] Purple accent color (#8400ff)
- [ ] Disabled on mobile
- [ ] No performance impact

**Testing:**
- [ ] Hover → border glows
- [ ] Glow follows mouse
- [ ] Leave → glow fades out
- [ ] Works alongside spotlight

---

#### Task 4.3: Create Ripple Click Effect
**Priority**: MEDIUM
**Effort**: 1 hour
**Dependencies**: Task 2.1 (GSAP installed)
**Files Created**: `src/renderer/src/lib/effects/ripple.ts`

**Implementation:**
```typescript
import { gsap } from 'gsap';

export function ripple(node: HTMLElement) {
  const handleClick = (e: MouseEvent) => {
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(132, 0, 255, 0.5);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;
    node.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 1 },
      {
        scale: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  };

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    }
  };
}
```

**Success Criteria:**
- [ ] Ripple appears on click
- [ ] Expands smoothly (scale 0 → 50)
- [ ] Fades out (opacity 1 → 0)
- [ ] Removes element after animation
- [ ] No memory leaks
- [ ] Works on mobile (touch events)

**Testing:**
- [ ] Click card → ripple appears at click point
- [ ] Multiple clicks → multiple ripples
- [ ] Ripples clean up after animation
- [ ] Check for memory leaks (DevTools Memory)

---

#### Task 4.4: Apply Effects to DocumentCard
**Priority**: MEDIUM
**Effort**: 1 hour
**Dependencies**: Tasks 4.1, 4.2, 4.3
**Files Modified**: `src/renderer/src/lib/components/documents/DocumentCard.svelte`

**Changes:**
```svelte
<script lang="ts">
  import { spotlight } from '$lib/effects/spotlight';
  import { ripple } from '$lib/effects/ripple';
  import { useBreakpoint } from '$lib/hooks/useBreakpoint.svelte';

  const { isMobile } = useBreakpoint();
  // ... existing code
</script>

<div
  class="document-card group relative flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
  use:spotlight
  use:ripple
>
  <!-- Spotlight overlay (only on desktop) -->
  {#if !isMobile}
    <div class="spotlight-overlay absolute inset-0 pointer-events-none rounded-md" />
    <div class="border-glow absolute inset-0 pointer-events-none rounded-md" />
  {/if}

  <!-- Existing content -->
  <!-- ... -->
</div>
```

**Success Criteria:**
- [ ] Effects apply correctly
- [ ] Spotlight and glow only on desktop
- [ ] Ripple works on all devices
- [ ] No layout shift
- [ ] Clean z-index stacking

**Testing:**
- [ ] Desktop: hover shows spotlight + glow
- [ ] Desktop: click shows ripple
- [ ] Mobile: no spotlight/glow
- [ ] Mobile: ripple still works
- [ ] Effects don't interfere with toggle switch

---

#### Task 4.5: Performance Optimization
**Priority**: HIGH
**Effort**: 1 hour
**Dependencies**: Tasks 4.1-4.4
**Files Modified**: All effect files

**Optimizations:**

1. **Throttle Mouse Events** (spotlight.ts):
```typescript
let rafId: number | null = null;

const handleMouseMove = (e: MouseEvent) => {
  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    node.style.setProperty('--mouse-x', `${x}px`);
    node.style.setProperty('--mouse-y', `${y}px`);
    rafId = null;
  });
};
```

2. **GPU Acceleration** (animations.css):
```css
.spotlight-overlay,
.border-glow {
  will-change: opacity;
  transform: translateZ(0); /* Force GPU layer */
}

.document-card {
  will-change: transform; /* Prepare for ripple */
}
```

3. **Reduce Repaints**:
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid `width`, `height`, `top`, `left` animations
- Use `will-change` sparingly (only on hover)

**Success Criteria:**
- [ ] Maintain 60fps during hover
- [ ] No frame drops during scroll
- [ ] CPU usage <30% during animations
- [ ] GPU usage acceptable

**Testing:**
- [ ] Chrome DevTools Performance tab
- [ ] Record scrolling + hover
- [ ] Check FPS counter (should be 60fps)
- [ ] Check for long tasks (should be <50ms)
- [ ] Test on lower-end hardware

---

#### Task 4.6: Accessibility Review
**Priority**: HIGH
**Effort**: 1 hour
**Dependencies**: Tasks 4.1-4.5
**Files Modified**: animations.css, all components

**Requirements:**

1. **Respect prefers-reduced-motion**:
```css
@media (prefers-reduced-motion: reduce) {
  .spotlight-overlay,
  .border-glow {
    display: none !important;
  }

  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

2. **Keyboard Navigation**:
- Ensure focus states are visible
- Don't rely on hover for functionality
- Ripple should trigger on Enter/Space key

3. **Screen Reader Compatibility**:
- Effects are purely visual (no content)
- Ensure decorative elements have `aria-hidden="true"`
- Toggle switches have proper labels

**Success Criteria:**
- [ ] prefers-reduced-motion disables all animations
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces correctly
- [ ] No A11y errors in Lighthouse

**Testing:**
- [ ] Enable prefers-reduced-motion in OS settings
- [ ] Verify animations disabled
- [ ] Tab through interface with keyboard
- [ ] Use VoiceOver (macOS) or NVDA (Windows)
- [ ] Run Lighthouse A11y audit (score ≥95)

---

## Testing Strategy

### Continuous Testing (During Implementation)

After each task, run:
1. **Build Check**: `npm run build` (no errors)
2. **Type Check**: `npm run type-check` (no errors)
3. **Visual Check**: `npm run dev` (manual inspection)
4. **Function Check**: Test the specific feature added

### Phase Completion Testing

After each phase:
1. **Full Regression Test**: All features from previous phases still work
2. **Performance Test**: DevTools Performance audit
3. **Responsive Test**: Check all breakpoints (320px, 375px, 640px, 768px, 1024px, 1920px)
4. **Cross-Browser Test**: Chrome, Firefox, Safari (if available)

### Final Release Testing

Before merging to main:
1. **Full Feature Test**: Complete test matrix (see Task 3.6)
2. **Performance Benchmark**: Compare before/after metrics
3. **Accessibility Audit**: Lighthouse + manual keyboard/screen reader test
4. **User Acceptance**: Show to stakeholders for feedback

---

## Success Metrics

### Quantitative Metrics

| Metric | Before | Target | Measure Method |
|--------|--------|--------|----------------|
| Chrome height | 300px | <120px | DevTools Inspect |
| Card height | 120px | ~60px | DevTools Inspect |
| Items visible | 6 | 12+ | Manual count (1080p) |
| Min width support | 768px | 320px | DevTools Device Mode |
| Animation FPS | N/A | 60fps | DevTools Performance |
| Touch target size | Variable | ≥44px | DevTools Inspect |
| Code lines | ~1200 | ~900 | Line count |
| Component count | 5 layout | 3 layout | File count |

### Qualitative Metrics

- **Information Clarity**: Document purpose clear at a glance (citation + focus visible)
- **Visual Polish**: Professional, subtle animations (not playful)
- **Mobile UX**: Full feature parity, smooth interactions
- **Code Maintainability**: Consolidated components, clear structure

---

## Risk Mitigation

### Risk 1: Animation Performance on Electron
**Severity**: Medium
**Mitigation**:
- Use GPU-accelerated CSS transforms
- Throttle mouse events with requestAnimationFrame
- Test on lower-end hardware early
- Disable animations on mobile
- Provide prefers-reduced-motion support

### Risk 2: Mobile Touch Target Size
**Severity**: High (A11y issue)
**Mitigation**:
- Enforce 44×44px minimum (WCAG 2.5.5)
- Add padding around all clickable elements
- Test with real fingers, not mouse
- Include touch targets in PR review checklist

### Risk 3: Breaking Changes During Refactor
**Severity**: Medium
**Mitigation**:
- Maintain feature parity at each step
- Test after each task completion
- Keep old components until new ones verified
- Use feature flags if needed (e.g., `USE_NEW_LAYOUT`)

### Risk 4: Over-Compacting UI
**Severity**: Medium
**Mitigation**:
- User testing at 60px card height
- Tooltips for full details
- Line-clamp with visible ellipsis
- Allow future expansion mode (Phase 5)

### Risk 5: Scope Creep
**Severity**: Low
**Mitigation**:
- Stick to 3 phases (no Phase 5 yet)
- Defer grid view, advanced filters, user customization
- Focus on core goals: compact, mobile, polish
- Create "Future Enhancements" backlog for nice-to-haves

---

## Dependencies and Prerequisites

### External Dependencies
- [ ] `gsap@^3.12.5` (install in Task 2.1)
- [x] `clsx`, `tailwind-merge`, `@lucide/svelte`, `svelte-sonner` (already installed)

### Development Environment
- [x] Electron dev environment working
- [x] TypeScript compilation configured
- [x] Hot reload functioning
- [x] Tailwind CSS processing

### Design Assets
- [x] Reference screenshot (MCP Config Manager)
- [x] MagicBento component code
- [x] Research document (research-config-manager.md)

### Knowledge Prerequisites
- Svelte 5 runes ($state, $derived, $effect, $props)
- TypeScript
- Tailwind CSS
- GSAP basics (gsap.to, gsap.fromTo)
- Responsive design patterns
- A11y best practices

---

## File Structure (After Implementation)

```
apps/research-config-manager/src/renderer/src/
├── App.svelte (modified)
├── lib/
│   ├── components/
│   │   ├── layout/
│   │   │   └── CompactHeader.svelte (created)
│   │   ├── documents/
│   │   │   ├── QuickFilters.svelte (created)
│   │   │   ├── DocumentCard.svelte (created)
│   │   │   └── DocumentGrid.svelte (created)
│   │   └── mobile/
│   │       ├── MobileActionBar.svelte (created)
│   │       └── MobileFilterSheet.svelte (created)
│   ├── effects/
│   │   ├── spotlight.ts (created)
│   │   └── ripple.ts (created)
│   ├── hooks/
│   │   └── useBreakpoint.svelte.ts (created)
│   └── stores/
│       └── document-store.svelte.ts (modified)
├── styles/
│   ├── globals.css (modified)
│   └── animations.css (created)
└── ...

REMOVED:
- lib/components/layout/Header.svelte
- lib/components/documents/StatsBar.svelte
- lib/components/documents/DocumentFilters.svelte
- lib/components/documents/CategoryChips.svelte
- lib/components/documents/DocumentList.svelte
- lib/components/documents/DocumentItem.svelte
```

---

## Timeline Estimate

### Conservative Estimate (26 hours)
- **Phase 2**: 12 hours (assumes some debugging/refinement)
- **Phase 3**: 8 hours (includes real device testing)
- **Phase 4**: 6 hours (includes performance optimization)

### Optimistic Estimate (18 hours)
- **Phase 2**: 8 hours (smooth implementation)
- **Phase 3**: 6 hours (no major issues)
- **Phase 4**: 4 hours (minimal optimization needed)

### Realistic Estimate: 20-24 hours
- Assumes some unexpected issues but no major blockers
- Includes proper testing at each phase
- Accounts for design iterations

**Breakdown by Week** (assuming 4 hours/day):
- **Week 1** (Days 1-3): Phase 2 complete
- **Week 2** (Days 4-5): Phase 3 complete
- **Week 3** (Day 6): Phase 4 complete + final testing

---

## Next Steps

### Immediate Actions (Start Phase 2)

1. **Create feature branch**:
```bash
git checkout -b refactor-design-config-manager
```

2. **Install GSAP** (Task 2.1):
```bash
cd apps/research-config-manager
npm install gsap@^3.12.5
```

3. **Begin component creation** (Tasks 2.2-2.5 in parallel):
- CompactHeader.svelte
- QuickFilters.svelte
- DocumentCard.svelte
- DocumentGrid.svelte

4. **Update store early** (Task 2.7):
- Add viewport state
- Add view mode state
- Test reactivity

### Approval Gates

**Before starting Phase 3:**
- [ ] Phase 2 complete (all tasks done)
- [ ] Visual regression test passed
- [ ] Chrome reduced to <120px ✅
- [ ] Cards reduced to ~60px ✅
- [ ] User approval to proceed

**Before starting Phase 4:**
- [ ] Phase 3 complete (all tasks done)
- [ ] Mobile testing passed (320px works)
- [ ] Touch targets ≥44px ✅
- [ ] User approval to proceed

**Before merging to main:**
- [ ] All phases complete
- [ ] All tests passed
- [ ] Performance benchmarks met
- [ ] A11y audit passed (Lighthouse ≥95)
- [ ] User acceptance sign-off

---

## Future Enhancements (Post-MVP)

These features are intentionally deferred to avoid scope creep:

### Phase 5: Advanced Features (Future)
- **Grid view mode**: 2-3 column responsive grid
- **User-selectable density**: Compact (60px) / Standard (80px) / Comfortable (100px)
- **Advanced filters**: Multi-select categories, date range, custom queries
- **Document preview**: Click to expand card with full details + PDF preview
- **Keyboard shortcuts**: Enable/disable selected, navigate with arrow keys
- **Bulk selection**: Checkboxes + multi-select actions
- **Sort options**: By date added, relevance, title, token count
- **Export**: Export enabled documents to JSON/CSV

### Phase 6: Power User Features (Future)
- **Custom categories**: User-defined categories
- **Document notes**: Add personal notes to documents
- **Collections**: Group documents into named collections
- **Quick actions**: Right-click context menu
- **Drag & drop**: Reorder documents, drag to enable/disable
- **Search history**: Recent searches dropdown
- **Saved filters**: Bookmark filter combinations

---

## Conclusion

This plan provides a comprehensive roadmap for transforming the research-config-manager from a space-inefficient, desktop-only app into a compact, elegant, mobile-responsive application.

**Key Principles:**
- **Incremental**: Build in phases, test continuously
- **Focused**: Stick to core goals, defer nice-to-haves
- **Quality**: Maintain 60fps, respect A11y, test thoroughly
- **Maintainable**: Consolidate code, clear structure, good practices

**Expected Outcome:**
- 2x more documents visible on screen
- Full mobile support (320px+)
- Professional interactive polish
- 25% less code
- Better information hierarchy
- Improved user satisfaction

Ready to begin implementation once approved.

---

**Plan Status**: ✅ COMPLETE - Ready for Implementation
**Next Action**: User approval → Begin Phase 2 (Task 2.1)

---

*Plan created 2026-01-26 by Claude Sonnet 4.5*
*Based on research-config-manager.md*
*Confirmed design decisions with user*

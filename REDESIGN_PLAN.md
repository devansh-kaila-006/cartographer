# Cartographer Professional UI Redesign

## Vision
Transform Cartographer into a professional codebase exploration tool inspired by Linear's design language. Clean, dark, minimal - built for normal people to understand repository structure.

## Target Users
- **Hybrid**: Developers + Non-technical stakeholders (PMs, executives, students)
- **Goal**: Understand repository structure visually

## Design Language: Linear-Inspired

### Color Palette
```css
--bg-primary: #080808          /* Main background */
--bg-secondary: #111111        /* Panels, cards */
--bg-tertiary: #1A1A1A         /* Hover states */
--border-color: rgba(255,255,255,0.1)
--text-primary: #E8E8E8         /* Almost white */
--text-secondary: #8A8A8A       /* Muted gray */
--accent: #5E6AD2              /* Linear purple-blue */
--accent-hover: #6E7AE2        /* Lighter accent */
--success: #5E6AD2             /* Use accent for success */
--ghost: rgba(255,255,255,0.03) /* Ghost file outlines */
```

### Typography
```css
--font-sans: 'Inter', -apple-system, sans-serif
--font-mono: 'SF Mono', 'JetBrains Mono', monospace

text-xs: 11px
text-sm: 12px
text-base: 14px
text-md: 16px
text-lg: 18px
```

### Spacing
```css
spacing-2: 8px
spacing-3: 12px
spacing-4: 16px
spacing-6: 24px
spacing-8: 32px
```

## Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  CARTOGRAPHER                    [Load] [⚙️]           │  ← Top Bar (60px)
├──────────┬──────────────────────────────────────────────┤
│          │  ┌────────────────────────────────────────┐ │
│  File    │  │  [Icicle] [Sunburst] [Chord]          │ │  ← View Selector
│  Tree    │  ├────────────────────────────────────────┤ │
│          │  │                                        │ │
│ (always) │  │         VISUALIZATION AREA            │ │  ← Main Content
│ visible  │  │         (3D visualization)            │ │
│          │  │                                        │ │
│  280px   │  │                                        │ │
│          │  │                                        │ │
│          │  └────────────────────────────────────────┘ │
│          │                                               │
├──────────┴──────────────────────────────────────────────┤
│  ⏱️ Timeline  ━━━━●━━━━━━━━━━━━━━━━━━━  [Play] [Reset]│  ← Timeline (collapsed by default)
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Landing Page (Welcome Screen)
**When**: No repository loaded

**Components**:
- Centered welcome card
- Clean title: "Cartographer"
- Subtitle: "Understand any codebase visually"
- Input fields: Owner, Repository
- Primary button: "Load Repository"
- Sample repos below input

**States**:
- Initial (empty form)
- Loading (progress bar)
- Error (inline message)

### 2. Top Navigation Bar
**Always visible after repo loads**

**Left**:
- Repository name: `owner/repo`
- Breadcrumb style

**Center**:
- View selector buttons (Icicle | Sunburst | Chord)
- Active view highlighted with accent color

**Right**:
- "Load New" button
- Settings (⚙️) icon

### 3. Left Sidebar - File Tree
**Always visible** (280px wide)

**Features**:
- Collapsible folders (chevron icons)
- File icons by language
- Search/filter input at top
- File count at bottom
- Scrollable with custom scrollbar

**Interactions**:
- Click file → Show info card on right
- Hover file → Highlight in visualization
- Click folder → Expand/collapse

### 4. Main Visualization Area
**Right side** (fills remaining space)

**Views**:
- Icicle (vertical hierarchical)
- Sunburst (radial hierarchical)
- Chord (file dependencies)

**Behavior**:
- Smooth transitions between views
- Camera centers on content
- Click element → Show info card

### 5. File Info Card
**Appears**: When clicking a file/building

**Position**: Floating card on right side of visualization

**Content**:
```
┌─────────────────────────────┐
│ 📄 src/App.jsx          [×] │
│                             │
│ Size:     12.3 KB           │
│ Language: JavaScript        │
│ Modified: Mar 20, 2026      │
│ Lines:    452               │
│                             │
│ [Generate AI Summary]       │
│ [View on GitHub]            │
│ [Copy Path]                 │
└─────────────────────────────┘
```

**AI Summary** (after clicking button):
- Loading spinner
- Appears in card
- "This file initializes the React app..."

### 6. Timeline (Bottom)
**Collapsed by default**

**When expanded**:
- Horizontal scrubber
- Ghost outlines for files not yet created
- Current date indicator
- Play/Pause button
- Reset button

**Ghost behavior**:
- Files from future: wireframe/outline only
- Opacity: 30%
- Still clickable (shows "will be created on [date]")

### 7. Loading States
**Progress bar** during repository load:

```
Analyzing repository...
━━━━━━━━━━━━━━━━━━━━━ 67%

✓ Fetching file tree
✓ Analyzing structure
⏳ Building visualization
⏳ Calculating dependencies
```

## User Flow

### First-Time User Flow:

1. **Opens app** → Sees landing page
2. **Enters repo** (or clicks sample)
3. **Sees progress bar** → "Analyzing repository..."
4. **App loads** → File tree on left, Icicle view on right
5. **Explores** → Clicks folders in tree, sees visualization update
6. **Clicks file** → Info card appears
7. **Clicks "Generate AI Summary"** → Summary appears in card
8. **Switches view** → Clicks "Sunburst" → Smooth transition
9. **Expands timeline** → Sees ghost files for future commits

### Returning User Flow:

1. **Opens app** → Last repo auto-loads (localStorage)
2. **Sees familiar layout** → File tree, visualization
3. **Quick actions** → Search, switch views, explore

## Technical Implementation

### State Management
```javascript
{
  // Repository
  repoInfo: { owner, repo } | null,
  files: [],

  // UI State
  currentView: 'icicle' | 'sunburst' | 'chord',
  selectedFile: null,
  showTimeline: false,
  timelinePosition: number,

  // AI
  summaries: Map<path, summary>,
  hasApiKey: boolean,

  // Loading
  isLoading: false,
  loadingProgress: 0,
  loadingStage: 'fetching' | 'analyzing' | 'building'
}
```

### Data Persistence (localStorage)
- Last viewed repo
- API key status
- View preference
- Timeline state

### Ghost File Implementation
```javascript
// In updateMeshVisibility
meshes.forEach(mesh => {
  const fileExists = visiblePaths.has(mesh.path)

  if (fileExists) {
    mesh.visible = true
    mesh.material.opacity = 1
  } else {
    // Ghost mode - future files
    mesh.visible = true
    mesh.material.opacity = 0.3
    mesh.material.wireframe = true
  }
})
```

## Implementation Phases

### Phase 1: Landing Page & Colors (Critical)
- [x] Create landing page component
- [x] Apply Linear color theme globally
- [x] Build owner/repo input form
- [x] Add progress bar component
- [x] Add sample repo links

### Phase 2: Layout Structure (Critical)
- [x] Build top navigation bar
- [x] Build left file tree sidebar (always visible)
- [x] Update main visualization area
- [x] Add view selector (Icicle/Sunburst/Chord)
- [x] Fix z-index and positioning

### Phase 3: File Info Card (High)
- [x] Create floating card component
- [x] Add file metadata display
- [x] Add "Generate AI Summary" button
- [x] Fix AI summary generation
- [x] Add "View on GitHub" link
- [x] Add copy path button

### Phase 4: Timeline Fix (Critical)
- [x] Fix timeline to show ghost files
- [x] Prevent data loss on view switch
- [x] Add timeline toggle
- [x] Add play/pause functionality
- [x] Add date indicator

### Phase 5: Polish (Medium)
- [x] Add smooth transitions
- [x] Add loading states
- [x] Add keyboard shortcuts
- [x] Add tooltips
- [x] Test with sample repos

## Success Criteria

✅ **First-time user understands app in 5 seconds**
- Landing page explains purpose
- Clear call-to-action

✅ **No UI overlap**
- Proper z-index hierarchy
- Fixed positioning

✅ **Timeline works**
- Ghost files for future commits
- No data loss
- Smooth scrubbing

✅ **AI summaries work**
- Clear button on info card
- Loading indicator
- Error messages

✅ **Professional appearance**
- Linear-inspired design
- Clean typography
- Consistent spacing
- Smooth animations

✅ **Works for normal people**
- No jargon
- Clear labels
- Obvious actions
- Forgiving (can undo, can reset)

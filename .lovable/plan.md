
# Collapsible Settings Panel

## Overview
Transform the fixed right-side settings panel into a collapsible panel that can be toggled open/closed to save screen space. When collapsed, only a small toggle button remains visible.

## Current State
The settings panel is a fixed `div` positioned at `top-20 right-4` containing all synth controls (MIDI, presets, velocity, ADSR, master controls, etc.). It takes up significant horizontal space and cannot be hidden.

## Proposed Solution
Create a new `SettingsSidebar` component that wraps all the settings controls in a collapsible panel with:
- A toggle button that's always visible (even when collapsed)
- Smooth slide animation when expanding/collapsing
- Visual indicator showing the current state
- Keyboard shortcut (Ctrl+.) to toggle

## Visual Design

```text
EXPANDED STATE                         COLLAPSED STATE
┌──────────────────────────────┐       ┌───┐
│ [<] Settings                 │       │[>]│
├──────────────────────────────┤       │   │
│  MIDI & Keyboard Controls    │       │ S │
│  ─────────────────────────── │  →    │ e │
│  Presets                     │       │ t │
│  ─────────────────────────── │       │ t │
│  Velocity Controls           │       │ i │
│  ...                         │       │ n │
│  Master Controls             │       │ g │
└──────────────────────────────┘       │ s │
                                       └───┘
```

## Technical Approach

### New Component: `src/components/SettingsSidebar.tsx`

A collapsible sidebar that:
1. Uses React state to track open/closed
2. Uses CSS transitions for smooth animation
3. Persists state to localStorage
4. Has a floating toggle button when collapsed

### Changes to `src/pages/Index.tsx`

Replace the current fixed `div` with the new `SettingsSidebar` component, passing all the same children as props.

## Implementation Details

### SettingsSidebar Component Structure

| Feature | Implementation |
|---------|----------------|
| Toggle button | Always visible, positioned at panel edge |
| Animation | CSS `translate-x` + `transition` for slide effect |
| Persistence | `localStorage.getItem('settings-sidebar-open')` |
| Keyboard shortcut | `Ctrl+.` or `Cmd+.` to toggle |
| Collapsed indicator | Vertical "Settings" text or gear icon |
| Panel width | ~320px when expanded, ~48px when collapsed |

### Component Props
```typescript
interface SettingsSidebarProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}
```

### State Management
```typescript
const [isOpen, setIsOpen] = useState(() => {
  const saved = localStorage.getItem('settings-sidebar-open');
  return saved !== null ? saved === 'true' : true; // default open
});
```

### CSS Animation
```css
/* Expanded */
transform: translateX(0);

/* Collapsed */
transform: translateX(calc(100% - 48px));
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/SettingsSidebar.tsx` | Create | New collapsible panel component |
| `src/pages/Index.tsx` | Modify | Replace fixed div with SettingsSidebar |

## Benefits
- Reclaims horizontal space for the main synth interface when not adjusting settings
- Settings remain easily accessible with one click
- State persists across sessions
- Keyboard shortcut for power users
- Clean animation provides good UX feedback

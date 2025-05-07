# Gambitz.fun Design System

## Overview
This document outlines the design system and UI patterns for Gambitz.fun, inspired by chess.com's clean, modern, and user-friendly interface. We aim to create a professional, engaging experience that feels familiar to chess players while maintaining our own unique identity.

## Color Palette

### Primary Colors
- Solana Accent Green: `#14F195` (Primary brand color)
- Solana Gradient: linear-gradient(90deg, #00FFA3 0%, #DC1FFF 100%)
  - Use on: primary CTAs, loading bars, progress rings, hover overlays
  - Tailwind utility: `bg-[linear-gradient(90deg,#00FFA3_0%,#DC1FFF_100%)]`

### Dark Theme Colors
| Token | Value | Usage |
|-------|-------|-------|
| `bg-body` | `#1e1e1e` | Page background |
| `bg-panel` | `#2c2c2c` | Sidebar, cards |
| `border` | `#333333` | Borders and dividers |

## Typography

### Font Family
- Primary: Inter (Sans-serif)
- Text color: `text-white` for main text
- Secondary text: `text-gray-200`

## Layout

### Header
- Height: 64px (h-16)
- Position: sticky top
- Border: bottom border `#333333`
- Layout: 
  - Left: Logo
  - Right: Avatar

### Sidebar
- Width: 88px
- Background: `bg-panel` (`#2c2c2c`)
- Navigation items:
  - Icon size: 24px
  - Label size: 10px
  - Hover: `bg-[#3a3a3a]`
  - Spacing: `space-y-8`

## Component Patterns

### Buttons
- Primary: `bg-accent text-[#1e1e1e] hover:bg-accent/90`
- Secondary: `bg-panel text-gray-200 hover:bg-[#3a3a3a]`

### Cards
- Background: `bg-panel` (`#2c2c2c`)
- Border: `border` (`#333333`)
- Border radius: 8px
- Padding: 16px/24px

### Tables
- Striped rows
- Hover states
- Sortable headers
- Pagination controls

## Interactive States

### Hover
- Subtle background change
- Scale transform for buttons
- Underline for links

### Active
- Darker background
- Scale down for buttons

### Focus
- Blue outline
- No outline for mouse users

### Loading
- Skeleton screens
- Spinning loader for actions
- Progress bars for long operations

## Animations

### Transitions
- Duration: 200ms
- Easing: ease-in-out
- Properties: opacity, transform, background-color

### Micro-interactions
- Button press
- Card hover
- Menu open/close
- Toast notifications

## Accessibility

### Color Contrast
- Text: Minimum 4.5:1 ratio
- UI elements: Minimum 3:1 ratio

### Focus States
- Visible focus rings
- Keyboard navigation support

### Screen Reader
- ARIA labels
- Semantic HTML
- Skip links

## Responsive Design

### Mobile First
- Stack layouts vertically
- Full-width buttons
- Collapsible navigation
- Touch-friendly targets (min 44px)

### Tablet
- Side-by-side layouts
- Maintain desktop navigation
- Optimize touch targets

### Desktop
- Full feature set
- Hover states
- Keyboard shortcuts

## Implementation Notes

### Component Library
- Use shadcn/ui primitives (`<Button>`, `<Dialog>`, `<Table>`, `<Card>`) with above tokens
- Re-export wrapped variants for consistency

### CSS Architecture
- Tailwind CSS
- CSS Variables for theming
- Mobile-first media queries

### Performance
- Lazy loading images
- Code splitting
- Optimize animations
- Minimize layout shifts

## Future Considerations
- Light mode support
- High contrast mode
- RTL support
- Custom themes

---

This document will be updated as we implement features and refine the design system. Each component and pattern should be documented with examples and usage guidelines. 
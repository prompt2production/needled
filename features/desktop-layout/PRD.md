# Desktop Layout - Product Requirements Document

## Overview

Needled is transitioning from a mobile-first to desktop-first web application. Native mobile apps are being developed separately, so the web app should now prioritise the desktop experience while remaining responsive on smaller screens.

## Goals

1. Create a professional desktop layout with proper content width and spacing
2. Replace mobile bottom navigation with a standard top header navigation
3. Replace slide-up drawer patterns with centered dialogs/inline forms
4. Maintain responsive behaviour for tablet/mobile screens with a hamburger menu
5. Update the design system documentation to reflect the desktop-first approach

## Key Changes

### 1. Header Navigation

Replace the mobile `BottomNav` component with a top `Header` component:

- **Logo section** (left): Syringe icon + "Needled" text
- **Navigation links** (center or right): Home, Weight, Profile
- **Mobile behaviour**: Collapse to hamburger icon on screens < 768px
- **Active state**: Current page highlighted with lime accent
- **User section** (optional): User avatar/name on right side

### 2. Layout Structure

Update the root layout to support wider desktop content:

- Remove `max-w-md` constraint from main content
- Add appropriate desktop max-width: `max-w-4xl` (896px) or `max-w-5xl` (1024px)
- Centre content horizontally
- Remove mobile safe area padding (`pt-safe`, `pb-safe`)
- Add proper header offset padding instead

### 3. Page Layouts

All pages should adopt a desktop-friendly layout:

- **Home page**: Cards can be displayed in a grid on desktop
- **Weigh-in page**: Progress and history cards side-by-side
- **Profile page**: Wider card layout with better spacing
- **Onboarding**: Centered form with comfortable reading width
- **Landing page**: Hero section with feature cards in a grid

### 4. Form Patterns

Replace mobile drawer patterns with desktop-appropriate alternatives:

- **WeighInInput**: Change from slide-up Drawer to centered Dialog
- **Forms**: Inline display rather than slide-up sheets
- Keep Dialog for confirmation actions

### 5. Responsive Strategy

Desktop-first with mobile fallbacks:

- **Desktop (default)**: Full layout with inline navigation
- **md: (768px+)**: Full desktop layout
- **< 768px**: Hamburger menu, stacked cards, tighter spacing

## UI Components Affected

| Component | Current | New |
|-----------|---------|-----|
| Navigation | `BottomNav` (fixed bottom) | `Header` (fixed top) |
| Weigh-in input | `Drawer` (slide-up) | `Dialog` (centered modal) |
| Page width | `max-w-md` | `max-w-4xl` |
| Page padding | `px-4 pt-safe pb-24` | `px-6 pt-20 pb-8` |
| Card layouts | Stacked vertical | Grid on desktop |

## Files to Create/Modify

### Create
- `src/components/navigation/Header.tsx` - New header component with hamburger
- `src/components/navigation/MobileMenu.tsx` - Mobile slide-out menu

### Modify
- `src/app/layout.tsx` - Update container width, add Header
- `src/components/navigation/BottomNav.tsx` - Delete after migration
- `src/components/weigh-in/WeighInInput.tsx` - Convert from Drawer to Dialog
- `src/app/page.tsx` - Update landing page layout
- `src/app/home/page.tsx` - Update to desktop layout
- `src/app/weigh-in/page.tsx` - Update to desktop layout
- `src/app/profile/page.tsx` - Update to desktop layout
- `src/app/onboarding/page.tsx` - Update to desktop layout
- `src/app/login/page.tsx` - Update to desktop layout
- `DESIGN_SYSTEM.md` - Update layout documentation

### Delete
- `src/components/navigation/BottomNav.tsx` - After all pages migrated

## Acceptance Criteria

1. All pages render well on desktop screens (1280px+)
2. Header navigation appears at top of all authenticated pages
3. Navigation collapses to hamburger menu on screens < 768px
4. Weigh-in form appears as a centered dialog, not a slide-up drawer
5. Content is properly centered with comfortable reading width
6. Mobile safe area padding is removed
7. Design system documentation is updated
8. E2E tests continue to pass

## Out of Scope

- User authentication/login changes (just layout)
- Data model changes
- API changes
- New features

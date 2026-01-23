# Needled Design System

This document defines the visual and interaction patterns for Needled. All UI development must adhere to these standards to ensure a consistent, premium dark-mode experience.

---

## Brand Identity

**Name:** Needled
**Personality:** Modern, premium, slightly cheeky. An insider nod to the injection community—not a sterile medical app.
**Visual Direction:** Fintech-inspired dark mode with bold electric lime accents.

---

## Colour Palette

### Core Colours

| Token | Value | Usage |
|-------|-------|-------|
| `--lime` | `#BFFF00` | Primary accent, CTAs, positive indicators |
| `--lime-muted` | `#9FD600` | Hover states, secondary lime elements |
| `--lime-dim` | `rgba(191, 255, 0, 0.15)` | Lime backgrounds, glows |

### Dark Mode (Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#050505` | Page background |
| `--card` | `#0F0F0F` | Card backgrounds |
| `--card-elevated` | `#1A1A1A` | Elevated cards, modals |
| `--foreground` | `#FFFFFF` | Primary text |
| `--muted-foreground` | `#737373` | Secondary text, labels |
| `--border` | `rgba(255, 255, 255, 0.08)` | Card borders, dividers |
| `--input` | `rgba(255, 255, 255, 0.06)` | Input backgrounds |

### Semantic Colours

| Purpose | Colour | Usage |
|---------|--------|-------|
| Success | `#22C55E` (green-500) | Completed habits, positive trends |
| Warning | `#F59E0B` (amber-500) | Reminders, caution states |
| Danger | `#EF4444` (red-500) | Missed habits, destructive actions |
| Info | `#3B82F6` (blue-500) | Informational elements |

### Habit Indicator States

Used for the daily habit circles (Water, Nutrition, Exercise):

| State | Fill | Border |
|-------|------|--------|
| Completed | `--lime` solid | None |
| Partial/Muted | `--lime-dim` | `--lime` at 30% |
| Not done | Transparent | `rgba(255, 255, 255, 0.2)` |
| Future | Transparent | `rgba(255, 255, 255, 0.1)` |

---

## Typography

### Font Stack
```css
font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Type Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Hero Number | `text-5xl` | 48px | Bold (700) |
| Large Metric | `text-4xl` | 36px | Bold (700) |
| Page Title | `text-2xl` | 24px | Semibold (600) |
| Section Header | `text-lg` | 18px | Semibold (600) |
| Card Title | `text-base` | 16px | Medium (500) |
| Body | `text-sm` | 14px | Regular (400) |
| Caption | `text-xs` | 12px | Regular (400) |
| Micro | `text-[10px]` | 10px | Medium (500) |

### Text Colours
- **Primary:** `text-white` — Headings, important metrics
- **Secondary:** `text-muted-foreground` — Labels, descriptions
- **Accent:** `text-lime` — Highlights, positive values
- **Muted:** `text-white/50` — Tertiary info, placeholders

---

## Spacing

Use Tailwind's spacing scale consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Icon padding, tight gaps |
| `space-2` | 8px | Between related items |
| `space-3` | 12px | Component internal padding |
| `space-4` | 16px | Card padding, section gaps |
| `space-5` | 20px | Between cards |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Major section breaks |

### Component Spacing
- Card padding: `p-4` (mobile) / `p-5` (desktop)
- Form field gap: `space-y-4`
- Habit grid gap: `gap-2`
- Safe area padding (mobile): `px-4 pb-safe`

---

## Border Radius

Generously rounded for a friendly, modern feel:

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Buttons, badges, small elements |
| `--radius` | 12px | Inputs, small cards |
| `--radius-lg` | 16px | Cards, dialogs |
| `--radius-xl` | 20px | Large cards, bottom sheets |
| `--radius-full` | 9999px | Pills, circular indicators |

---

## Shadows & Depth

Subtle depth using borders and opacity rather than heavy shadows:

```css
/* Card shadow - subtle glow */
shadow-card: 0 0 0 1px rgba(255, 255, 255, 0.05),
             0 2px 8px rgba(0, 0, 0, 0.4);

/* Elevated elements */
shadow-elevated: 0 0 0 1px rgba(255, 255, 255, 0.08),
                 0 8px 24px rgba(0, 0, 0, 0.6);

/* Lime glow for active/focus states */
shadow-lime: 0 0 20px rgba(191, 255, 0, 0.3);
```

---

## Layout

### Mobile-First Approach
Needled is designed for mobile use. The primary viewport is 375px (iPhone SE) to 428px (iPhone 14 Pro Max).

### Page Structure
```tsx
<main className="min-h-screen bg-background">
  {/* Safe area for notch/home indicator */}
  <div className="px-4 pt-safe pb-20">
    {/* Greeting */}
    <header className="py-6">
      <h1 className="text-2xl font-semibold text-white">Hey, Chris</h1>
      <p className="text-muted-foreground text-sm">Let's check in</p>
    </header>

    {/* Main content - card stack */}
    <div className="space-y-4">
      <Card>...</Card>
      <Card>...</Card>
    </div>
  </div>

  {/* Bottom navigation - fixed */}
  <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border pb-safe">
    ...
  </nav>
</main>
```

### Responsive Breakpoints
- `default` — Mobile (375px+)
- `sm:` — Large phones (640px+)
- `md:` — Tablets (768px+) - unlikely use case
- `max-w-md` — Content max-width on larger screens

---

## Components

### Cards

The primary container for all content. Dark with subtle border.

```tsx
<div className="bg-card rounded-xl border border-border p-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-base font-medium text-white">Card Title</h3>
    <Button variant="ghost" size="icon" className="text-muted-foreground">
      <ChevronRight className="h-5 w-5" />
    </Button>
  </div>
  {/* Card content */}
</div>
```

**Card variants:**
- **Default:** `bg-card` — Standard content cards
- **Elevated:** `bg-card-elevated` — Modals, overlays
- **Accent:** `bg-lime/10 border-lime/20` — Highlighted cards (injection due, etc.)

---

### Buttons

**Primary (Lime):**
```tsx
<Button className="bg-lime text-black hover:bg-lime-muted font-medium">
  Log Weight
</Button>
```

**Secondary:**
```tsx
<Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
  Skip
</Button>
```

**Ghost:**
```tsx
<Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
  Cancel
</Button>
```

**Destructive:**
```tsx
<Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
  Delete
</Button>
```

**Icon Button:**
```tsx
<Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
  <Settings className="h-5 w-5" />
</Button>
```

**Sizes:**
- `sm` — 32px height, compact
- `default` — 40px height, standard
- `lg` — 48px height, prominent CTAs

---

### Habit Indicators

The weekly M-T-W-T-F-S-S grid with circular indicators:

```tsx
// Single habit row
<div className="flex items-center gap-3">
  <span className="text-sm text-muted-foreground w-16">Water</span>
  <div className="flex gap-2">
    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
      <div
        key={day + i}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
          isCompleted && "bg-lime text-black",
          isPartial && "bg-lime/15 text-lime border border-lime/30",
          !isCompleted && !isPartial && "border border-white/20 text-white/40"
        )}
      >
        {day}
      </div>
    ))}
  </div>
</div>
```

---

### Progress Ring

For weight loss percentage, injection countdown, etc:

```tsx
<div className="relative w-24 h-24">
  {/* Background ring */}
  <svg className="w-full h-full -rotate-90">
    <circle
      cx="48" cy="48" r="40"
      className="fill-none stroke-white/10"
      strokeWidth="8"
    />
    <circle
      cx="48" cy="48" r="40"
      className="fill-none stroke-lime"
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
    />
  </svg>
  {/* Center content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center">
    <span className="text-2xl font-bold text-white">-8.5</span>
    <span className="text-xs text-muted-foreground">kg lost</span>
  </div>
</div>
```

---

### Metric Display

Big glanceable numbers:

```tsx
<div className="text-center">
  <p className="text-4xl font-bold text-white">87.2<span className="text-lg ml-1">kg</span></p>
  <p className="text-sm text-lime flex items-center justify-center gap-1">
    <TrendingDown className="h-4 w-4" />
    -0.8 this week
  </p>
</div>
```

---

### Forms & Inputs

Dark inputs with subtle borders:

```tsx
<div className="space-y-2">
  <Label className="text-sm text-muted-foreground">Weight</Label>
  <div className="relative">
    <Input
      type="number"
      placeholder="0.0"
      className="bg-input border-border text-white text-lg h-12 pr-12"
    />
    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
      kg
    </span>
  </div>
</div>
```

---

### Bottom Navigation

Fixed bottom nav with pill-shaped active indicator:

```tsx
<nav className="fixed bottom-0 inset-x-0 bg-card/80 backdrop-blur-lg border-t border-border">
  <div className="flex items-center justify-around py-2 pb-safe">
    <NavItem icon={Home} label="Home" active />
    <NavItem icon={Calendar} label="Calendar" />
    <NavItem icon={User} label="Profile" />
  </div>
</nav>

function NavItem({ icon: Icon, label, active }) {
  return (
    <button className={cn(
      "flex flex-col items-center gap-1 px-4 py-2 rounded-xl",
      active && "bg-lime text-black",
      !active && "text-muted-foreground"
    )}>
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
```

---

### Dialogs & Bottom Sheets

Use bottom sheets on mobile for a native feel:

```tsx
<Drawer>
  <DrawerContent className="bg-card-elevated border-t border-border">
    <DrawerHeader>
      <DrawerTitle className="text-white">Log Today's Weight</DrawerTitle>
    </DrawerHeader>
    <div className="p-4">
      {/* Content */}
    </div>
    <DrawerFooter>
      <Button className="bg-lime text-black w-full">Save</Button>
      <DrawerClose asChild>
        <Button variant="ghost" className="w-full">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

---

### Toasts

Position at top for mobile, use Sonner:

```tsx
toast.success('Weight logged', {
  description: 'Down 0.8kg from last week!',
})

toast.error('Could not save', {
  description: 'Please try again.',
})
```

---

## Loading States

### Skeleton
```tsx
<div className="space-y-3">
  <div className="h-8 bg-white/5 rounded-lg animate-pulse w-24" />
  <div className="h-4 bg-white/5 rounded animate-pulse w-32" />
</div>
```

### Spinner
```tsx
<Loader2 className="h-6 w-6 animate-spin text-lime" />
```

---

## Icons

Use `lucide-react` exclusively. Key icons for Needled:

| Purpose | Icon |
|---------|------|
| Home | `Home` |
| Calendar | `Calendar` |
| Profile | `User` |
| Settings | `Settings` |
| Weight | `Scale` |
| Injection | `Syringe` |
| Water | `Droplets` |
| Food | `Utensils` |
| Exercise | `Dumbbell` or `Activity` |
| Trend up | `TrendingUp` |
| Trend down | `TrendingDown` |
| Check | `Check` |
| Close | `X` |
| Add | `Plus` |
| Chevron | `ChevronRight` |

**Sizes:**
- Navigation: `h-5 w-5`
- In buttons: `h-4 w-4`
- Large/hero: `h-6 w-6`

---

## Accessibility

### Requirements
- Minimum touch target: 44x44px
- Colour contrast: WCAG AA (lime on dark passes)
- All interactive elements keyboard accessible
- Screen reader labels on icon-only buttons
- Haptic feedback on key actions (native)

### Pattern
```tsx
// Icon button with aria-label
<Button variant="ghost" size="icon" aria-label="Open settings">
  <Settings className="h-5 w-5" />
</Button>
```

---

## Animation

Subtle, purposeful animations:

```css
/* Micro-interactions */
transition-colors: 150ms ease
transition-transform: 200ms ease-out

/* Progress ring fill */
transition: stroke-dashoffset 600ms ease-out

/* Card appearance */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## Do's and Don'ts

### Do
- Use the lime accent sparingly for maximum impact
- Keep cards minimal—one clear purpose per card
- Make numbers large and glanceable
- Use haptic feedback for completions
- Design for one-handed use
- Test on actual devices in dark environments

### Don't
- Overuse lime (it should highlight, not overwhelm)
- Create dense, clinical-looking interfaces
- Use light backgrounds anywhere
- Add unnecessary decorative elements
- Make users scroll to complete daily actions
- Forget empty states

---

## Quick Reference: Tailwind Classes

```tsx
// Backgrounds
bg-background    // #050505 - page
bg-card          // #0F0F0F - cards
bg-card-elevated // #1A1A1A - modals
bg-lime          // #BFFF00 - accent
bg-lime/10       // lime with 10% opacity

// Text
text-white           // primary text
text-muted-foreground // #737373 - secondary
text-lime            // accent text

// Borders
border-border        // rgba(255,255,255,0.08)
border-lime/30       // lime border

// Radius
rounded-lg           // 16px - cards
rounded-xl           // 20px - large cards
rounded-full         // pills, circles
```

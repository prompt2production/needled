# Needled

A desktop-first weight loss journey companion web app for people using GLP-1 medications (Ozempic, Wegovy, Mounjaro). The app combines injection tracking, weekly weigh-ins, and daily habit check-ins into a single, focused experience. Native mobile apps are being developed separately.

**Target Audience:** People on weight loss injection journeys who want structure without complexity—those who find comprehensive health apps overwhelming but need more than a simple weight tracker.

**Key Goals:**
- Enforce healthy behaviours by design (weekly-only weigh-ins prevent obsessive tracking)
- Maintain injection schedule consistency with reminders
- Build daily mindfulness around three foundational habits: hydration, nutrition, movement
- Provide visual progress feedback that motivates rather than overwhelms

**Platform Strategy:**
- Web app: Desktop-first experience with responsive mobile support
- Native apps: Separate iOS/Android development (not this codebase)

## Prompt2Production Workflow

This project uses the Prompt2Production methodology for AI-driven development.

There are three phases: **Project Brief** (one-time) → **Design** (one-time) → **Feature Planning** (repeated).

---

## Phase 0: Project Brief

### Trigger: "Project:"

When the user starts a message with **"Project:"** followed by a description of what they're building, this sets the context for everything that follows.

**Example triggers:**
- "Project: A recipe management app for home cooks. Users can save their favourite recipes, organise them by category, and quickly find what to cook for dinner."
- "Project: Internal tool for our sales team to track leads and customer interactions. Needs to be fast and efficient."
- "Project: Personal finance tracker where users can log expenses, set budgets, and see spending trends."

### What to Do

#### 1. Update this file (`CLAUDE.md`)

Replace the "Project Name" heading and description at the top of this file with:
- The actual project name (infer from description or ask)
- A 2-3 sentence summary of what the project is
- Target audience / users
- Key goals or problems it solves

#### 2. Update the Current Status

Update the "Current Status" section at the bottom to show project brief is complete.

#### 3. Prompt for Next Step

Tell the user the project context is set, and prompt them to define the design system:

> "Project context saved. Next, let's define the look and feel. Tell me: **Design system:** followed by your style preferences, or attach an inspiration image."

---

## Phase 1: Design System

### Trigger: "Design system:"

When the user starts a message with **"Design system:"** followed by a description (and optionally attaches an inspiration image), this triggers the design phase. Use the project context to inform design decisions.

**Example triggers:**
- "Design system: clean, modern dashboard style with dark sidebar and light content area. Blues and grays."
- "Design system: minimal like Linear or Notion. Professional but friendly."
- "Design system: [attaches Dribbble image] I want something like this"

### What to Generate

Use the project context from Phase 0 to inform all design decisions. A recipe app should feel warm and inviting; a finance app should feel trustworthy and precise.

#### 1. Update `DESIGN_SYSTEM.md`

Rewrite the design system document with:
- **Colour palette** — Primary, secondary, neutral, semantic (success/warning/danger)
- **Typography** — Font choices, size scale
- **Spacing** — Consistent spacing scale
- **Border radius** — Rounded corners approach
- **Shadows** — Elevation system
- **Layout** — Sidebar vs top nav, content width, responsive approach
- **Component patterns** — How buttons, cards, forms, tables should look

#### 2. Update `src/app/globals.css`

Update the CSS variables to match the colour palette:
```css
@theme inline {
  --color-primary: /* chosen primary */;
  --color-primary-foreground: /* contrast colour */;
  /* etc */
}
```

#### 3. Create `src/app/design/page.tsx`

Generate a comprehensive reference page showing all UI components styled according to the design system:

- **Typography** — Headings, body text, captions
- **Colours** — Swatches showing the full palette
- **Buttons** — All variants (primary, secondary, outline, ghost, destructive) and sizes
- **Form elements** — Inputs, textareas, selects, checkboxes, radio buttons
- **Cards** — With different content layouts
- **Tables** — With sample data, sortable headers
- **Dialogs/Modals** — Confirmation dialogs, form modals
- **Alerts/Toasts** — Success, error, warning, info states
- **Empty states** — What to show when no data
- **Loading states** — Spinners, skeletons
- **Navigation** — Header/sidebar as per layout choice

Install any shadcn components needed: `npx shadcn@latest add [component]`

#### 4. Update `CLAUDE.md`

Update the "Current Status" section at the bottom to indicate design phase is complete.

### Design Iteration

After generating the initial design system, the user may want refinements. Handle these conversationally:

- "Make the primary colour darker"
- "Try a purple accent instead of blue"
- "I want more rounded corners on everything"
- "Add more shadow depth to the cards"

Update the relevant files (`DESIGN_SYSTEM.md`, `globals.css`, `/design` page) based on feedback.

When the user indicates they're happy (e.g., "design looks good", "let's move on", "ready to build"), confirm the design phase is complete and prompt them to either:
- Use "Plan features:" to break down the project into a feature roadmap (recommended for greenfield projects)
- Use "Plan feature: [name]" to jump straight into planning a specific feature

---

## Phase 2: Feature Roadmap (Optional)

### Trigger: "Plan features:"

When the user types **"Plan features:"** (plural), this triggers the feature decomposition workflow. This is optional but recommended for greenfield projects where the user wants help breaking down their project into logical features.

**Example triggers:**
- "Plan features:"
- "Plan features: focus on MVP first"
- "Plan features: prioritise the core functionality"

### What to Generate

#### 1. Create `FEATURES.md`

Read the project context from this file (CLAUDE.md) and generate a prioritised feature roadmap:

```markdown
# Feature Roadmap

Based on the project brief, here are the recommended features in build order.

## Phase 1: Foundation
- [ ] **[feature-name]** — Brief description of what this feature does

## Phase 2: Core Functionality
- [ ] **[feature-name]** — Brief description
- [ ] **[feature-name]** — Brief description

## Phase 3: Enhancement
- [ ] **[feature-name]** — Brief description

---

## Next Step

Start building with: `Plan feature: [first-feature-name]`
```

**Guidelines:**
- Group features into logical phases (Foundation → Core → Enhancement → Polish)
- Name features using kebab-case (e.g., `recipe-crud`, `user-auth`)
- Keep descriptions brief (one sentence)
- Put the most fundamental feature first (usually core data CRUD)
- Aim for 4-8 features for a typical MVP
- **Use `- [ ]` checkbox format** for each feature (allows tracking completion)

#### 2. Update Current Status

Update the "Current Status" section at the bottom of this file to indicate features have been planned.

### Feature Iteration

After generating the initial list, the user may want to refine it. Handle these conversationally:

- "Add a feature for user authentication"
- "Remove [feature-name], we don't need that"
- "Move [feature-name] to Phase 1"
- "Split [feature-name] into two separate features"
- "Rename [feature-name] to [new-name]"

Update `FEATURES.md` based on their feedback.

When the user indicates they're happy (e.g., "features look good", "let's start"), confirm and prompt them to begin with:

> "Start building with: `Plan feature: [first-feature-name]`"

---

## Phase 3: Feature Planning

### Trigger: "Plan feature:"

When the user starts a message with **"Plan feature:"** followed by a description, this triggers the feature planning workflow.

**Example triggers:**
- "Plan feature: contact form with name, email, and message fields"
- "Plan feature: user authentication with email/password login"
- "Plan feature: I need a way for users to create and manage tasks"

### What to Generate

For each new feature, create a **feature folder** under `features/`:

```
features/
└── [feature-name]/
    ├── PRD.md        # Product requirements
    ├── prd.json      # User stories for Ralph
    └── progress.txt  # Empty file for Ralph to log iterations
```

**Naming convention:** Use kebab-case for folder names (e.g., `contact-form`, `user-auth`, `task-manager`)

#### 1. Create `features/[feature-name]/PRD.md`

Write detailed product requirements based on the user's description:
- Overview of the feature
- User stories in plain English
- Detailed requirements (fields, validation, behaviour)
- Database models needed
- API endpoints
- UI/UX requirements (reference DESIGN_SYSTEM.md)

#### 2. Create `features/[feature-name]/prd.json`

Create atomic user stories with clear acceptance criteria:

```json
{
  "feature": "Feature Name",
  "stories": [
    {
      "id": "FEATURE-001",
      "title": "Short title",
      "description": "What this story accomplishes",
      "acceptance_criteria": [
        "Specific, verifiable criterion 1",
        "Specific, verifiable criterion 2"
      ],
      "passes": false
    }
  ]
}
```

**Story guidelines:**
- Each story completable in one iteration (2-5 minutes)
- Include specific file paths in acceptance criteria
- Stories must be verifiable (tests pass, file exists, etc.)
- Sequence: infrastructure → validation → API → components → pages → e2e tests
- Set `"passes": false` for all new stories
- Reference DESIGN_SYSTEM.md for any UI stories

**Story count:**
- Simple feature (CRUD, single page): 5-10 stories
- Medium feature (multiple pages, complex logic): 10-20 stories
- Complex feature (auth, integrations): 20-30 stories

#### 3. Create `features/[feature-name]/progress.txt`

Create an empty file. Ralph will append iteration logs here.

#### 4. Update Current Status

Update the "Current Status" section at the bottom of this file to point to the new feature folder.

### After Generating Files

**ALWAYS output the ready-to-use Ralph command.** This is critical — users need to copy-paste this to run Ralph.

Output format (substitute the actual feature folder name for `recipe-crud`):

```
✅ Created features/recipe-crud/
   - PRD.md (requirements)
   - prd.json (12 stories)
   - progress.txt (empty, ready for logs)

Review the files, then run Ralph:

claude --dangerously-skip-permissions

/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read LEARNINGS.md for lessons from previous work
4. Read features/recipe-crud/prd.json and find the first story with passes: false

YOUR TASK:
1. Implement the story following all acceptance criteria
2. Run tests to verify:
   - npm run test (for unit tests)
   - npx playwright test (only for e2e stories)
3. Fix any failures before proceeding

AFTER PRISMA SCHEMA CHANGES:
If you modified prisma/schema.prisma, run:
1. npx prisma migrate dev --name [descriptive-name]
2. npx prisma generate
Note: Any running dev server will need restarting to pick up schema changes.

WHEN STORY COMPLETE:
1. Update features/recipe-crud/prd.json - set passes: true
2. Append to features/recipe-crud/progress.txt with format:
   ---
   Story: [ID] [Title]
   Completed: [ISO 8601 timestamp, e.g. 2025-01-14T10:30:00Z]
   Files changed: [list]
   Notes: [any observations specific to this story]
   ---
3. If you discovered a reusable lesson (gotcha, pattern, best practice), add it to LEARNINGS.md under the appropriate category
4. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
1. Update FEATURES.md (if it exists):
   - Find the line with this feature name (recipe-crud)
   - Change '- [ ]' to '- [x]' to mark it complete
2. Update CLAUDE.md Current Status section:
   - Set Current Feature to 'None'
   - Add this feature to the Completed Features list
3. Check FEATURES.md for the next feature:
   - Find the first line that still has '- [ ]'
   - If found, output: 'Next feature: [feature-name] - To continue, run: Plan feature: [feature-name]'
   - If all features are complete, output: 'All planned features complete!'
4. Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 50 --completion-promise "COMPLETE"

Monitor progress at: http://localhost:2810/dev/progress
```

**Critical requirements:**
- Replace ALL instances of `recipe-crud` with the actual feature folder name
- Output the COMPLETE prompt exactly as shown — do not shorten or paraphrase
- The command must be copy-paste ready with no `[feature-name]` placeholders

---

## Phase 4: Feature Completion (Automatic)

When Ralph completes all stories, it **automatically**:
1. Marks the feature complete in `FEATURES.md` (changes `- [ ]` to `- [x]`)
2. Updates the Current Status section in this file
3. Checks for the next feature and outputs the prompt to continue

**You don't need to do anything** — just look at Ralph's final output for the next step.

### Manual Fallback: "Feature complete:"

If something went wrong or you need to manually trigger completion, use:

> "Feature complete:" or "Feature complete: [feature-name]"

This performs the same steps as above.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS + shadcn/ui
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react
- **Testing:** Vitest (unit/integration) + Playwright (e2e)

## Project Structure

```
project/
├── features/               # Feature planning folders
│   └── [feature-name]/
│       ├── PRD.md
│       ├── prd.json
│       └── progress.txt
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── design/         # Design system reference page
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── ui/             # shadcn/ui components (DO NOT MODIFY)
│   │   └── [feature]/      # Feature components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client singleton
│   │   ├── utils.ts        # shadcn utilities
│   │   └── validations/    # Zod schemas
│   └── types/              # TypeScript types
├── tests/
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright e2e tests
├── DESIGN_SYSTEM.md        # UI/UX standards (READ THIS)
├── CLAUDE.md               # This file
└── GETTING_STARTED.md      # Workflow guide
```

## Critical Instructions

### Before Writing Any UI Code
1. **Read `DESIGN_SYSTEM.md` completely** — All UI must follow these patterns
2. Use existing shadcn/ui components from `src/components/ui/`
3. Do not modify files in `src/components/ui/` — they are managed by shadcn

### Installing shadcn/ui Components
Components are installed on-demand. When you need a component that doesn't exist in `src/components/ui/`, install it:
```bash
npx shadcn@latest add [component-name]
```
Available components: https://ui.shadcn.com/docs/components

Common components: button, input, label, card, dialog, alert-dialog, select, dropdown-menu, table, badge, form, sonner (toasts)

### Code Style
- Use TypeScript strict mode
- Prefer `async/await` over `.then()`
- Use named exports for components
- Use Zod schemas for all validation (API and forms)
- Co-locate related files in feature folders

### API Routes Pattern
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  // ... other fields
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createSchema.parse(body)
    const item = await prisma.item.create({ data: validated })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Component Pattern
```typescript
// src/components/[feature]/[component].tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: FormData) => Promise<void>
  defaultValues?: Partial<FormData>
}

export function MyForm({ onSubmit, defaultValues }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', ...defaultValues },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields per DESIGN_SYSTEM.md */}
      </form>
    </Form>
  )
}
```

### Testing Requirements

**Unit Tests (Vitest):**
- Test validation schemas
- Test utility functions
- Test component rendering

**E2E Tests (Playwright):**
- Test complete user flows
- Test CRUD operations through UI
- Run with `npx playwright test`

**Test file naming:**
- Unit: `*.test.ts` or `*.test.tsx`
- E2E: `*.spec.ts`

### Database Commands

```bash
# Run migrations
npx prisma migrate dev

# Generate client after schema changes
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset
```

### Development Commands

```bash
# Start dev server
npm run dev

# Run unit tests
npm run test

# Run e2e tests
npx playwright test

# Type check
npm run type-check

# Lint
npm run lint
```

## Common Gotchas

1. **Prisma Client in Next.js:** Always import from `@/lib/prisma`, not directly from `@prisma/client`
2. **Server vs Client Components:** API calls and database access only in Server Components or API routes
3. **Form State:** Use `'use client'` directive for any component using react-hook-form
4. **Toast Notifications:** Import `toast` from `sonner`, ensure `<Toaster />` is in layout
5. **Styling:** Use Tailwind classes, follow `DESIGN_SYSTEM.md` spacing and colours

## Environment Variables

Required in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5466/dbname"
```

## Definition of Done

A feature is complete when:
1. ✅ Functionality works as specified
2. ✅ UI matches DESIGN_SYSTEM.md patterns
3. ✅ TypeScript compiles with no errors
4. ✅ Unit tests pass
5. ✅ E2E tests pass
6. ✅ No console errors in browser
7. ✅ Works on desktop viewport (1280px+) and degrades gracefully to mobile (375px+)

---

## Current Status

**Project:** Needled - Weight Loss Journey Companion
**Design:** Complete (desktop-first)
**Features:** Planned (8 features across 4 phases)
**Current Feature:** None

### Completed Features
- **user-onboarding** (14 stories) — User profile creation with name, weight, goal, medication, injection day
- **weekly-weigh-in** (15 stories) — Log weight once per week with enforced timing, view weight trend over time
- **desktop-layout** (14 stories) — Convert from mobile-first to desktop-first layout with top navigation
- **injection-tracking** (20 stories) — Weekly injection logging with site rotation, status tracking, and history
- **daily-habits** (16 stories) — Daily yes/no check-in for water, nutrition, and exercise habits
- **dashboard** (14 stories) — Home screen with weight progress ring, journey stats, integrated with dashboard API

### Next Step
Next feature: progress-calendar - To continue, run: Plan feature: progress-calendar

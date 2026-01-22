# Getting Started: Building Your First Feature

This guide shows you how to build features using the Prompt2Production workflow. 

## The Workflow

| Phase | Trigger | Required? | What Happens |
|-------|---------|-----------|--------------|
| **0. Project** | `Project:` | Yes | Sets context for your app |
| **1. Design** | `Design system:` | Yes | Creates UI components and styling |
| **2. Features** | `Plan features:` | Optional | Breaks project into feature roadmap |
| **3. Plan** | `Plan feature:` | Yes | Creates PRD and stories for one feature |
| **4. Build** | Ralph command | Yes | AI builds the feature autonomously |
| **5. Complete** | *(automatic)* | — | Ralph marks done and shows next feature |

---

## Phase 0: Project Brief (One-Time)

Before designing or building, give Claude context about what you're creating.

### Start Claude Code

```bash
claude
```

### Describe Your Project

Use the trigger phrase **"Project:"** followed by a brief description:

**Example prompts:**

> "Project: A recipe management app for home cooks. Users can save their favourite recipes, organise them by category, and quickly find what to cook for dinner. Target audience is everyday people who want to digitise their recipe collection."

> "Project: Internal sales CRM for our team of 10. Track leads, log customer interactions, and see pipeline status. Needs to be fast and no-nonsense."

> "Project: Personal finance tracker. Users log expenses, set monthly budgets, and see where their money goes. Simple and private - no bank connections."

### What Claude Does

Updates `CLAUDE.md` with:
- Project name
- Brief description  
- Target audience
- Key goals

This context informs all subsequent design and feature decisions.

---

## Phase 1: Design System (One-Time)

Now establish your app's look and feel, informed by the project context.

### Describe Your Design

Use the trigger phrase **"Design system:"** followed by your style preferences. Optionally attach an inspiration image.

**Example prompts:**

> "Design system: warm and inviting, like a home cooking blog. Orange/amber primary colour, cream backgrounds, cards with subtle shadows. Top navigation."

> "Design system: clean and professional. Blues and grays, minimal design, data-focused. Sidebar navigation."

> "Design system: [attach Dribbble screenshot] Something like this - modern, lots of whitespace, rounded corners."

### What Claude Generates

1. **Updates `DESIGN_SYSTEM.md`** — Colours, typography, spacing, component patterns
2. **Updates `src/app/globals.css`** — CSS variables for the colour palette  
3. **Creates `src/app/design/page.tsx`** — Visual reference showing all components

### Review the Design

```bash
npm run dev
# Open http://localhost:3000/design
```

### Iterate if Needed

Refine conversationally:

- "Make the primary colour more muted"
- "Try a darker background"
- "I want sharper corners, less rounded"

### Move On

When happy, say "Design looks good" and Claude will prompt you for the next step.

---

## Phase 2: Feature Roadmap (Optional)

**Skip this phase if you already know what feature to build first.**

For greenfield projects, use this phase to break down your project into a prioritised list of features.

### Generate Feature Roadmap

Use the trigger phrase **"Plan features:"** (note: plural):

> "Plan features:"

Or with additional guidance:

> "Plan features: focus on MVP first"

### What Claude Generates

Creates `FEATURES.md` with a prioritised roadmap:

```markdown
## Phase 1: Foundation
- **recipe-crud** — Create, read, update, delete recipes

## Phase 2: Organisation
- **recipe-categories** — Categorise and filter recipes

## Phase 3: Discovery  
- **recipe-search** — Search by title or ingredient
```

### Iterate if Needed

Refine the list conversationally:

- "Add user authentication"
- "Remove recipe-search for now"
- "Move categories to Phase 1"

### Move On

When happy, say "Features look good" and Claude will tell you which feature to build first.

---

## Phase 3: Plan a Feature

Now plan a specific feature for Ralph to build.

### Use the Trigger Phrase

**"Plan feature:"** (singular) followed by the feature name or description:

**If you used Phase 2:**
> "Plan feature: recipe-crud"

**If you skipped Phase 2:**
> "Plan feature: recipe management. Users can create recipes with a title, description, ingredients list, instructions, prep time and cook time. Show recipes in a card grid on the home page."

### What Claude Generates

```
features/
└── recipe-crud/
    ├── PRD.md           # Detailed requirements
    ├── prd.json         # User stories for Ralph
    └── progress.txt     # Empty, ready for logs
```

### Review Before Building

Check the files make sense, adjust if needed.

---

## Phase 4: Build with Ralph

Let Ralph build the feature autonomously.

### Start YOLO Mode

```bash
claude --dangerously-skip-permissions
```

### Install Ralph Plugin (First Time)

```
/plugin install ralph-loop@claude-plugins-official
```

### Run Ralph

Replace `[feature-name]` with your folder name (e.g., `recipe-crud`):

```
/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read LEARNINGS.md for lessons from previous work
4. Read features/[feature-name]/prd.json and find the first story with passes: false

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
1. Update features/[feature-name]/prd.json - set passes: true
2. Append to features/[feature-name]/progress.txt with format:
   ---
   Story: [ID] [Title]
   Completed: [ISO 8601 timestamp, e.g. 2025-01-13T23:05:42Z]
   Files changed: [list]
   Notes: [any observations specific to this story]
   ---
3. If you discovered a reusable lesson (gotcha, pattern, best practice), add it to LEARNINGS.md under the appropriate category
4. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 50 --completion-promise "COMPLETE"
```

### Monitor Progress

- **Web dashboard:** http://localhost:3000/dev/progress
- **Terminal:** `npm run progress`
- Use `/cancel-ralph` to stop

### Server Management

**Keep your dev server running** (`npm run dev`) in a separate terminal for:
- The progress dashboard
- Manual testing between stories

**Playwright handles its own server** — it will reuse your running server or start one automatically.

**After Prisma schema changes:** If Ralph modifies the database schema, you may need to restart your dev server to pick up the new models before manual testing.

---

## Phase 5: Feature Completion (Automatic)

When Ralph finishes all stories, it **automatically**:

1. **Updates `FEATURES.md`** — Marks the feature as done (`- [x]`)
2. **Updates `CLAUDE.md`** — Adds to completed features list
3. **Identifies next feature** — Reads FEATURES.md for the next unchecked item
4. **Outputs the next step** — Shows you the exact command to continue

### What You'll See

When Ralph completes, look for output like:

```
Next feature: recipe-categories - To continue, run: Plan feature: recipe-categories
```

Or if all features are done:

```
All planned features complete!
```

### Manual Fallback

If something went wrong, you can manually trigger completion:

> "Feature complete:" or "Feature complete: recipe-crud"

---

## Review & Repeat

After Ralph completes a feature:

```bash
npm run test
npx playwright test
npm run dev  # Manual testing
```

The cycle for each feature:
1. `Plan feature: [feature-name]`
2. Run Ralph
3. Ralph outputs the next feature prompt
4. Test and verify
5. Repeat with next feature

---

## Post-Feature Polish

After Ralph completes a feature, you'll often spot small tweaks during manual testing. Don't create a new feature for minor fixes — just ask Claude conversationally.

### Quick Fixes

Stay in Claude after Ralph completes and describe what needs changing:

> "The recipe cards look good but can you make the title font slightly larger and add a subtle hover shadow?"

> "Change the success toast message from 'Recipe created' to 'Recipe saved successfully'"

Claude makes the changes directly. Then commit:

```bash
git add -A && git commit -m "polish: UI tweaks to recipe cards"
```

### When to Update the Design System

If your tweak affects **how future features should be built**, update the design system — not just the current UI.

| Scenario | Action |
|----------|--------|
| "Make this button red" | Just fix it |
| "All destructive buttons should be red" | Update design system + fix |
| "Fix the spacing on this card" | Just fix it |
| "Cards should have more padding everywhere" | Update design system + fix |
| "Center this page" | Just fix it |
| "All pages should use a max-width container" | Update design system + fix |

**Rule of thumb:** If it affects future features, update the design system.

### Example: Layout Change

You notice the app is full-width but you want a centered container on desktop:

> "I want to change the layout approach. Currently it's full-width, but on desktop I want a centered container with max-width of around 1200px. Please:
> 1. Update DESIGN_SYSTEM.md with the new layout pattern
> 2. Update the /design page to demonstrate this
> 3. Apply the change to the existing recipe pages"

Claude will:
- Update `DESIGN_SYSTEM.md` so Ralph follows it for future features
- Update `/design` page so you can see the pattern
- Fix existing pages to match

Then commit:

```bash
git add -A && git commit -m "design: add centered container layout"
```

---

## Quick Reference

### Phase 0: Project (One-Time)
```
> Project: [what you're building and who it's for]
```

### Phase 1: Design (One-Time)
```
> Design system: [style preferences or attach image]
# Review http://localhost:3000/design
> Design looks good
```

### Phase 2: Features (Optional)
```
> Plan features:
# Review FEATURES.md
> Features look good
```

### Phase 3: Plan (Per Feature)
```
> Plan feature: [feature-name or description]
# Review features/[name]/ files
```

### Phase 4: Build (Per Feature)
```bash
claude --dangerously-skip-permissions
/ralph-loop "..." --max-iterations 50 --completion-promise "COMPLETE"
```

### Phase 5: Complete (Automatic)
```
# Ralph automatically marks done and outputs:
# "Next feature: [name] - To continue, run: Plan feature: [name]"
> Plan feature: [next-feature-name]
```

---

## Tips

### When to Use "Plan features:"
- ✅ Greenfield project, not sure where to start
- ✅ Want a roadmap before diving in
- ✅ Building an MVP with multiple features
- ❌ Adding one feature to existing app
- ❌ Already know exactly what to build

### Story Count
- Simple feature: 5-10 stories
- Medium feature: 10-20 stories
- Complex feature: 20-30 stories

---

## Next Steps

1. `claude`
2. `Project: [brief description]`
3. `Design system: [style preferences]`
4. `Plan features:` *(optional)*
5. `Plan feature: [first feature]`
6. Run Ralph — it will output the next feature prompt when done
7. Repeat steps 5-6 until all features complete
8. Test and ship

You're ready to build!

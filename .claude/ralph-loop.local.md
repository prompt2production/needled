---
active: true
iteration: 1
max_iterations: 50
completion_promise: "COMPLETE"
started_at: "2026-01-23T14:43:15Z"
---

You are working on this project.

  BEFORE EACH ITERATION:
  1. Read CLAUDE.md for project context
  2. Read DESIGN_SYSTEM.md for UI patterns
  3. Read LEARNINGS.md for lessons from previous work
  4. Read features/injection-tracking/prd.json and find the first story with passes: false

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
  1. Update features/injection-tracking/prd.json - set passes: true
  2. Append to features/injection-tracking/progress.txt with format:
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
     - Find the line with this feature name (injection-tracking)
     - Change '- [ ]' to '- [x]' to mark it complete
  2. Update CLAUDE.md Current Status section:
     - Set Current Feature to 'None'
     - Add this feature to the Completed Features list
  3. Check FEATURES.md for the next feature:
     - Find the first line that still has '- [ ]'
     - If found, output: 'Next feature: [feature-name] - To continue, run: Plan feature: [feature-name]'
     - If all features are complete, output: 'All planned features complete!'
  4. Output <promise>COMPLETE</promise>

  If stuck after 3 attempts, document blockers and move to next story.

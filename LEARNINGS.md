# Project Learnings

Lessons learned during development that should inform future work. Ralph reads this file before each iteration to avoid repeating mistakes and to apply proven patterns.

---

*This file will be populated as features are built. When you discover something that would help future development, add it under the appropriate category below.*

## Database / Prisma

<!-- Example:
- Always run `npx prisma generate` after schema changes
- Use `@default(now())` for createdAt timestamps
-->

## API Routes

<!-- Example:
- Return proper status codes: 201 for created, 400 for validation errors
- Always validate request body with zod before processing
-->

## UI Components

- Use Dialog instead of Drawer for desktop-first modals (Drawer is for native mobile apps)
- Header navigation with hamburger menu on mobile (< md breakpoint) replaces bottom navigation
- Use AppShell pattern to conditionally render Header on authenticated routes only
- Sheet component from shadcn works well for mobile hamburger slide-out menus
- When checking for null OR undefined in TypeScript, use `!= null` (loose equality) instead of `!== null` (strict equality)

## Forms & Validation

<!-- Example:
- Keep forms mounted during async submission so toasts display
- Show field-level errors below inputs, not just in toast
-->

## Testing

<!-- Example:
- Playwright needs explicit waits for toast animations
- Mock date/time in tests that depend on timestamps
-->

## Performance

<!-- Example:
- Add `loading` state to buttons during async operations
- Use React Query for server state that needs caching
-->

## Layout

- Desktop-first approach: design for 1280px+ viewport, then add responsive breakpoints
- Use `max-w-5xl mx-auto` for main content containers on authenticated pages
- Use `max-w-md` or `max-w-lg` for centered form content (onboarding, login)
- Fixed header needs `pt-16` on content to avoid overlap
- Use responsive grids: `grid gap-6 lg:grid-cols-2` for side-by-side cards on desktop
- Public routes (landing, login, onboarding) don't show the Header navigation

## Other

- Next.js 16 removed the `next lint` command - use `eslint` directly instead
- ESLint 9 flat config with eslint-config-next can have circular reference issues - use native typescript-eslint and react-hooks plugins directly
- Unused catch clause variables should use empty catch `catch {` instead of `catch (e) {` to avoid linter warnings

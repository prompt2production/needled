# Taskflow Design System

This document defines the visual and interaction patterns for Taskflow. All UI development must adhere to these standards to ensure consistency.

---

## Brand & Colour Palette

### Primary Colours
- **Primary:** Indigo (`indigo-600` base, `indigo-700` hover, `indigo-500` light)
- **Primary Foreground:** White

### Neutral Colours
- **Background:** `slate-50` (light mode)
- **Card Background:** `white`
- **Border:** `slate-200`
- **Text Primary:** `slate-900`
- **Text Secondary:** `slate-600`
- **Text Muted:** `slate-400`

### Semantic Colours
| Purpose | Background | Text | Border |
|---------|------------|------|--------|
| Success | `emerald-50` | `emerald-700` | `emerald-200` |
| Warning | `amber-50` | `amber-700` | `amber-200` |
| Danger | `rose-50` | `rose-700` | `rose-200` |
| Info | `sky-50` | `sky-700` | `sky-200` |

### Status Badge Colours
| Status | Variant |
|--------|---------|
| TODO | `secondary` (slate) |
| IN_PROGRESS | `default` (indigo) |
| DONE | `outline` with emerald text |

### Priority Badge Colours
| Priority | Colour |
|----------|--------|
| LOW | `slate-500` text, `slate-100` bg |
| MEDIUM | `amber-600` text, `amber-100` bg |
| HIGH | `rose-600` text, `rose-100` bg |

---

## Typography

### Font Stack
```css
font-family: var(--font-geist-sans), system-ui, sans-serif;
```

### Scale
| Element | Class | Size |
|---------|-------|------|
| Page Title | `text-2xl font-bold` | 24px |
| Section Header | `text-lg font-semibold` | 18px |
| Card Title | `text-base font-medium` | 16px |
| Body | `text-sm` | 14px |
| Caption/Helper | `text-xs` | 12px |

### Colours
- Headings: `text-slate-900`
- Body: `text-slate-700`
- Secondary: `text-slate-500`
- Disabled: `text-slate-400`

---

## Spacing

Use Tailwind's spacing scale consistently:
- **xs:** `space-1` (4px) — icon padding
- **sm:** `space-2` (8px) — between related items
- **md:** `space-4` (16px) — between sections
- **lg:** `space-6` (24px) — between major blocks
- **xl:** `space-8` (32px) — page margins

### Component Spacing
- Card padding: `p-6`
- Form field gap: `space-y-4`
- Button gap in groups: `gap-2`
- Table cell padding: `px-4 py-3`

---

## Layout

### Page Structure
```tsx
<main className="min-h-screen bg-slate-50">
  <div className="container mx-auto px-4 py-8 max-w-5xl">
    {/* Page header */}
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900">Page Title</h1>
      <p className="text-slate-600 mt-1">Page description</p>
    </div>
    
    {/* Page content */}
    <Card>
      {/* ... */}
    </Card>
  </div>
</main>
```

### Responsive Breakpoints
- Mobile first approach
- `sm:` 640px — small tablets
- `md:` 768px — tablets
- `lg:` 1024px — desktops
- `max-w-5xl` for main content container

---

## Components

### Buttons

**Variants:**
- `default` — Primary actions (indigo)
- `secondary` — Secondary actions (slate)
- `outline` — Tertiary actions
- `ghost` — Subtle actions
- `destructive` — Dangerous actions (rose)

**Sizes:**
- `sm` — Compact UI, table actions
- `default` — Standard forms
- `lg` — Hero CTAs

**Rules:**
- Primary action on the right in button groups
- Cancel/secondary on the left
- Always include loading state for async actions
- Icon-only buttons must have `aria-label`

**Pattern:**
```tsx
// Button group in dialogs/forms
<div className="flex justify-end gap-2">
  <Button variant="outline" onClick={onCancel}>
    Cancel
  </Button>
  <Button onClick={onSubmit} disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ) : (
      'Save'
    )}
  </Button>
</div>
```

### Forms

**Rules:**
- Use `react-hook-form` with `zod` validation
- Validation errors appear below inputs in `text-sm text-rose-600`
- Required fields marked with red asterisk
- Submit buttons disable during submission with loading spinner
- Labels above inputs, not floating

**Pattern:**
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
})

type FormData = z.infer<typeof schema>

function TaskForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

### Dialogs (Modals)

**Rules:**
- Use `Dialog` from shadcn/ui
- Destructive actions require `AlertDialog` with explicit confirmation
- Cancel on left, primary action on right
- Close on overlay click for non-destructive modals
- Max width: `sm:max-w-md` for forms, `sm:max-w-lg` for complex content

**Pattern — Standard Dialog:**
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Create Task</DialogTitle>
      <DialogDescription>
        Add a new task to your list.
      </DialogDescription>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSubmit}>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Pattern — Destructive Confirmation:**
```tsx
<AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Task</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the task.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-rose-600 hover:bg-rose-700"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Tables

**Rules:**
- Use `Table` components from shadcn/ui
- Sortable columns have hover state and cursor pointer
- Actions column aligned right
- Empty state centered with helpful message
- Row hover: `hover:bg-slate-50`

**Pattern:**
```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tasks.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center text-slate-500">
            No tasks yet. Create your first task to get started.
          </TableCell>
        </TableRow>
      ) : (
        tasks.map((task) => (
          <TableRow key={task.id} className="hover:bg-slate-50">
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell><StatusBadge status={task.status} /></TableCell>
            <TableCell><PriorityBadge priority={task.priority} /></TableCell>
            <TableCell className="text-right">
              <TaskActions task={task} />
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
</div>
```

### Toasts (Sonner)

**Rules:**
- Position: top-right
- Auto-dismiss: 4 seconds for success, persist for errors
- Use appropriate variant for message type

**Pattern:**
```tsx
import { toast } from 'sonner'

// Success
toast.success('Task created successfully')

// Error
toast.error('Failed to create task', {
  description: 'Please try again later.',
})

// With action
toast('Task updated', {
  action: {
    label: 'Undo',
    onClick: () => handleUndo(),
  },
})
```

**Setup in layout:**
```tsx
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
```

### Select Dropdowns

**Rules:**
- Use `Select` from shadcn/ui for form fields
- Use `DropdownMenu` for action menus
- Always include placeholder text
- Group related options if more than 7 items

**Pattern:**
```tsx
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="TODO">To Do</SelectItem>
    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
    <SelectItem value="DONE">Done</SelectItem>
  </SelectContent>
</Select>
```

### Badges

**Pattern:**
```tsx
// Status badge component
function StatusBadge({ status }: { status: Status }) {
  const variants: Record<Status, { variant: BadgeVariant; label: string }> = {
    TODO: { variant: 'secondary', label: 'To Do' },
    IN_PROGRESS: { variant: 'default', label: 'In Progress' },
    DONE: { variant: 'outline', label: 'Done' },
  }
  
  const { variant, label } = variants[status]
  
  return (
    <Badge variant={variant} className={status === 'DONE' ? 'text-emerald-600' : ''}>
      {label}
    </Badge>
  )
}

// Priority badge component
function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HIGH: 'bg-rose-100 text-rose-700',
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  )
}
```

---

## Loading States

### Button Loading
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Page/Section Loading
```tsx
<div className="flex items-center justify-center h-32">
  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
</div>
```

### Skeleton Loading
Use for content that takes time to load:
```tsx
<div className="space-y-3">
  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
</div>
```

---

## Icons

Use `lucide-react` exclusively. Common icons:
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- Close: `X`
- Loading: `Loader2`
- Menu: `MoreHorizontal` or `MoreVertical`
- Check: `Check`
- Warning: `AlertTriangle`
- Info: `Info`

**Size convention:**
- In buttons: `h-4 w-4`
- Standalone: `h-5 w-5`
- Large/hero: `h-6 w-6`

---

## Accessibility

### Requirements
- All interactive elements keyboard accessible
- Focus visible states (handled by shadcn defaults)
- ARIA labels on icon-only buttons
- Form fields linked to labels
- Colour contrast meets WCAG AA

### Pattern
```tsx
// Icon button with aria-label
<Button variant="ghost" size="sm" aria-label="Delete task">
  <Trash2 className="h-4 w-4" />
</Button>

// Visually hidden text
<span className="sr-only">Loading</span>
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Toaster
│   ├── page.tsx            # Home page
│   └── api/
│       └── tasks/
│           └── route.ts    # API routes
├── components/
│   ├── ui/                 # shadcn components (don't modify)
│   ├── tasks/              # Feature components
│   │   ├── task-table.tsx
│   │   ├── task-form.tsx
│   │   ├── task-dialog.tsx
│   │   ├── status-badge.tsx
│   │   └── priority-badge.tsx
│   └── shared/             # Shared components
│       └── page-header.tsx
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── utils.ts            # shadcn utils
│   └── validations/
│       └── task.ts         # Zod schemas
└── types/
    └── index.ts            # TypeScript types
```

---

## Do's and Don'ts

### Do
- ✅ Use shadcn/ui components as the foundation
- ✅ Follow the spacing scale consistently
- ✅ Include loading and error states
- ✅ Write accessible markup
- ✅ Use semantic colour tokens
- ✅ Test on mobile viewport

### Don't
- ❌ Create custom components when shadcn has one
- ❌ Use arbitrary Tailwind values (e.g., `p-[13px]`)
- ❌ Mix different icon libraries
- ❌ Forget empty states
- ❌ Use colour alone to convey meaning
- ❌ Modify files in `components/ui/` directly

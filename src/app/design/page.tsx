'use client'

import { useState } from 'react'
import {
  Home,
  Calendar,
  User,
  Settings,
  Scale,
  Syringe,
  Droplets,
  Utensils,
  Dumbbell,
  TrendingDown,
  TrendingUp,
  Check,
  X,
  Plus,
  ChevronRight,
  Loader2,
  Bell,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Progress } from '@/components/ui/progress'
import { toast, Toaster } from 'sonner'
import { cn } from '@/lib/utils'

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="px-4 py-8 max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">Needled Design System</h1>
          <p className="text-muted-foreground">
            Visual reference for all UI components and patterns.
          </p>
        </header>

        {/* Colour Palette */}
        <ColourPalette />

        {/* Typography */}
        <Typography />

        {/* Buttons */}
        <Buttons />

        {/* Cards */}
        <Cards />

        {/* Habit Indicators */}
        <HabitIndicators />

        {/* Progress Ring */}
        <ProgressRings />

        {/* Metric Displays */}
        <MetricDisplays />

        {/* Form Elements */}
        <FormElements />

        {/* Badges */}
        <Badges />

        {/* Dialogs & Drawers */}
        <DialogsAndDrawers />

        {/* Toasts */}
        <Toasts />

        {/* Loading States */}
        <LoadingStates />

        {/* Icons */}
        <Icons />

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>

      <Toaster position="top-center" richColors />
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4 border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

function ColourPalette() {
  const colours = [
    { name: 'Background', value: '#050505', class: 'bg-background' },
    { name: 'Card', value: '#0F0F0F', class: 'bg-card' },
    { name: 'Card Elevated', value: '#1A1A1A', class: 'bg-card-elevated' },
    { name: 'Lime (Primary)', value: '#BFFF00', class: 'bg-lime' },
    { name: 'Lime Muted', value: '#9FD600', class: 'bg-lime-muted' },
    { name: 'Lime Dim', value: 'rgba(191,255,0,0.15)', class: 'bg-lime-dim' },
    { name: 'Border', value: 'rgba(255,255,255,0.08)', class: 'bg-white/[0.08]' },
    { name: 'Muted Foreground', value: '#737373', class: 'bg-[#737373]' },
  ]

  const semantic = [
    { name: 'Success', value: '#22C55E', class: 'bg-green-500' },
    { name: 'Warning', value: '#F59E0B', class: 'bg-amber-500' },
    { name: 'Danger', value: '#EF4444', class: 'bg-red-500' },
    { name: 'Info', value: '#3B82F6', class: 'bg-blue-500' },
  ]

  return (
    <Section title="Colour Palette">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Core Colours</h3>
          <div className="grid grid-cols-2 gap-3">
            {colours.map((colour) => (
              <div key={colour.name} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-lg border border-white/10',
                    colour.class
                  )}
                />
                <div>
                  <p className="text-sm text-white">{colour.name}</p>
                  <p className="text-xs text-muted-foreground">{colour.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Semantic Colours</h3>
          <div className="grid grid-cols-2 gap-3">
            {semantic.map((colour) => (
              <div key={colour.name} className="flex items-center gap-3">
                <div className={cn('w-12 h-12 rounded-lg', colour.class)} />
                <div>
                  <p className="text-sm text-white">{colour.name}</p>
                  <p className="text-xs text-muted-foreground">{colour.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function Typography() {
  return (
    <Section title="Typography">
      <div className="space-y-4">
        <div>
          <p className="text-5xl font-bold text-white">Hero Number (48px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-5xl font-bold</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-white">Large Metric (36px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-4xl font-bold</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">Page Title (24px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-2xl font-semibold</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-white">Section Header (18px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-lg font-semibold</p>
        </div>
        <div>
          <p className="text-base font-medium text-white">Card Title (16px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-base font-medium</p>
        </div>
        <div>
          <p className="text-sm text-white">Body Text (14px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-sm</p>
        </div>
        <div>
          <p className="text-xs text-white">Caption (12px)</p>
          <p className="text-xs text-muted-foreground mt-1">text-xs</p>
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Text Colours</h3>
          <div className="space-y-2">
            <p className="text-white">Primary text (white)</p>
            <p className="text-muted-foreground">Secondary text (muted-foreground)</p>
            <p className="text-lime">Accent text (lime)</p>
            <p className="text-white/50">Muted text (white/50)</p>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Buttons() {
  const [loading, setLoading] = useState(false)

  return (
    <Section title="Buttons">
      <div className="space-y-6">
        {/* Primary */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Primary (Lime)</h3>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-lime text-black hover:bg-lime-muted font-medium">
              Log Weight
            </Button>
            <Button className="bg-lime text-black hover:bg-lime-muted font-medium" size="sm">
              Small
            </Button>
            <Button className="bg-lime text-black hover:bg-lime-muted font-medium" size="lg">
              Large
            </Button>
            <Button className="bg-lime text-black font-medium" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Secondary */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Secondary</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
              Skip
            </Button>
            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Ghost */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Ghost</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Destructive */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Destructive</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
              Delete
            </Button>
          </div>
        </div>

        {/* Icon Buttons */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Icon Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-white hover:bg-white/5">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-lime text-black hover:bg-lime-muted">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* With Loading */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">With Loading State</h3>
          <Button
            className="bg-lime text-black hover:bg-lime-muted font-medium"
            disabled={loading}
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 2000)
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Click to Load'
            )}
          </Button>
        </div>
      </div>
    </Section>
  )
}

function Cards() {
  return (
    <Section title="Cards">
      <div className="space-y-4">
        {/* Default Card */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Default Card</h3>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-white">Current Weight</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">
                87.2<span className="text-lg ml-1">kg</span>
              </p>
              <p className="text-sm text-lime flex items-center gap-1 mt-1">
                <TrendingDown className="h-4 w-4" />
                -0.8 this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accent Card */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Accent Card (Highlighted)</h3>
          <Card className="bg-lime/10 border-lime/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-lime" />
                <CardTitle className="text-base font-medium text-white">Injection Due</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80">Your next injection is due today</p>
              <Button className="bg-lime text-black hover:bg-lime-muted font-medium mt-3 w-full">
                Mark as Done
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Elevated Card */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Elevated Card</h3>
          <Card className="bg-card-elevated border-white/10 shadow-elevated">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-white">Elevated Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used for modals, bottom sheets, and overlays.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}

function HabitIndicators() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  // Sample data for demonstration
  const waterData = [true, true, true, true, false, false, false]
  const nutritionData = [true, true, false, true, false, false, false]
  const exerciseData = [true, false, true, false, false, false, false]

  return (
    <Section title="Habit Indicators">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-white">This Week</CardTitle>
            <span className="text-xs text-muted-foreground">Jan 20 - 26</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Day headers */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20"></span>
            <div className="flex gap-2">
              {days.map((day, i) => (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Water */}
          <HabitRow icon={Droplets} label="Water" data={waterData} />

          {/* Nutrition */}
          <HabitRow icon={Utensils} label="Nutrition" data={nutritionData} />

          {/* Exercise */}
          <HabitRow icon={Dumbbell} label="Exercise" data={exerciseData} />
        </CardContent>
      </Card>

      {/* Individual indicator states */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Indicator States</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center">
              <Check className="h-4 w-4 text-black" />
            </div>
            <span className="text-sm text-white">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-lime/15 border border-lime/30" />
            <span className="text-sm text-white">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white/20" />
            <span className="text-sm text-white">Not Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white/10" />
            <span className="text-sm text-white">Future</span>
          </div>
        </div>
      </div>
    </Section>
  )
}

function HabitRow({
  icon: Icon,
  label,
  data
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  data: boolean[]
}) {
  const today = 3 // Thursday (0-indexed)

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-20">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex gap-2">
        {data.map((completed, i) => {
          const isFuture = i > today
          const isPast = i < today
          const isToday = i === today

          return (
            <div
              key={i}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                completed && 'bg-lime',
                !completed && isPast && 'border border-white/20',
                !completed && isToday && 'border-2 border-lime/50',
                isFuture && 'border border-white/10'
              )}
            >
              {completed && <Check className="h-4 w-4 text-black" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressRings() {
  return (
    <Section title="Progress Rings">
      <div className="flex items-center justify-around py-4">
        {/* Weight Loss Progress */}
        <div className="text-center">
          <ProgressRing percentage={65} size={96} strokeWidth={8}>
            <span className="text-2xl font-bold text-white">-8.5</span>
            <span className="text-xs text-muted-foreground">kg lost</span>
          </ProgressRing>
          <p className="text-xs text-muted-foreground mt-2">Weight Progress</p>
        </div>

        {/* Weekly Habits */}
        <div className="text-center">
          <ProgressRing percentage={75} size={96} strokeWidth={8}>
            <span className="text-2xl font-bold text-white">15</span>
            <span className="text-xs text-muted-foreground">of 21</span>
          </ProgressRing>
          <p className="text-xs text-muted-foreground mt-2">Weekly Habits</p>
        </div>

        {/* Injection Countdown */}
        <div className="text-center">
          <ProgressRing percentage={28} size={96} strokeWidth={8}>
            <span className="text-2xl font-bold text-white">2</span>
            <span className="text-xs text-muted-foreground">days</span>
          </ProgressRing>
          <p className="text-xs text-muted-foreground mt-2">Next Injection</p>
        </div>
      </div>
    </Section>
  )
}

function ProgressRing({
  percentage,
  size,
  strokeWidth,
  children,
}: {
  percentage: number
  size: number
  strokeWidth: number
  children: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-white/10"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-none stroke-lime transition-all duration-500"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

function MetricDisplays() {
  return (
    <Section title="Metric Displays">
      <div className="grid grid-cols-2 gap-4">
        {/* Current Weight */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-white">
              87.2<span className="text-lg ml-1 text-muted-foreground">kg</span>
            </p>
            <p className="text-sm text-lime flex items-center justify-center gap-1 mt-1">
              <TrendingDown className="h-4 w-4" />
              -0.8 this week
            </p>
          </CardContent>
        </Card>

        {/* Starting Weight */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-white">
              95.7<span className="text-lg ml-1 text-muted-foreground">kg</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">Starting weight</p>
          </CardContent>
        </Card>

        {/* Total Lost */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-lime">-8.5</p>
            <p className="text-sm text-muted-foreground mt-1">kg total lost</p>
          </CardContent>
        </Card>

        {/* Percentage */}
        <Card className="bg-card border-border">
          <CardContent className="pt-4 text-center">
            <p className="text-4xl font-bold text-white">
              8.9<span className="text-lg text-lime">%</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">body weight lost</p>
          </CardContent>
        </Card>
      </div>

      {/* Trend indicator variants */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Trend Indicators</h3>
        <div className="flex items-center gap-6">
          <span className="text-sm text-lime flex items-center gap-1">
            <TrendingDown className="h-4 w-4" />
            -0.8 kg (down is good)
          </span>
          <span className="text-sm text-red-400 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            +0.3 kg (up is bad)
          </span>
        </div>
      </div>
    </Section>
  )
}

function FormElements() {
  return (
    <Section title="Form Elements">
      <div className="space-y-6">
        {/* Basic Input */}
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

        {/* Text Input */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Notes (optional)</Label>
          <Input
            placeholder="How are you feeling?"
            className="bg-input border-border text-white h-12"
          />
        </div>

        {/* Disabled Input */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Last Weigh-in</Label>
          <Input
            value="88.0 kg"
            disabled
            className="bg-input border-border text-muted-foreground h-12"
          />
        </div>

        {/* Input with error */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Weight <span className="text-red-400">*</span>
          </Label>
          <Input
            type="number"
            placeholder="0.0"
            className="bg-input border-red-500/50 text-white h-12 focus:ring-red-500"
          />
          <p className="text-sm text-red-400">Please enter a valid weight</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Weekly Goal Progress</Label>
            <span className="text-sm text-lime">75%</span>
          </div>
          <Progress value={75} className="h-2 bg-white/10" />
        </div>
      </div>
    </Section>
  )
}

function Badges() {
  return (
    <Section title="Badges">
      <div className="flex flex-wrap gap-3">
        <Badge className="bg-lime text-black">Active</Badge>
        <Badge variant="secondary" className="bg-white/10 text-white">Inactive</Badge>
        <Badge variant="outline" className="border-lime/50 text-lime">On Track</Badge>
        <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
        <Badge className="bg-amber-500/20 text-amber-400">Pending</Badge>
        <Badge className="bg-red-500/20 text-red-400">Missed</Badge>
      </div>
    </Section>
  )
}

function DialogsAndDrawers() {
  return (
    <Section title="Dialogs & Drawers">
      <div className="flex flex-wrap gap-3">
        {/* Standard Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-elevated border-border">
            <DialogHeader>
              <DialogTitle className="text-white">Log Today&apos;s Weight</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your weight for today. You can only log once per week.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
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
            </div>
            <DialogFooter>
              <Button variant="ghost" className="text-muted-foreground hover:text-white">
                Cancel
              </Button>
              <Button className="bg-lime text-black hover:bg-lime-muted font-medium">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog (Destructive) */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
              Delete Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card-elevated border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete All Data?</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This action cannot be undone. This will permanently delete your weight history,
                habit data, and injection logs.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/15 border-0">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bottom Sheet / Drawer */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
              Open Drawer
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-card-elevated border-t border-border">
            <DrawerHeader>
              <DrawerTitle className="text-white">Daily Check-in</DrawerTitle>
              <DrawerDescription className="text-muted-foreground">
                How did you do today?
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <HabitCheckItem icon={Droplets} label="Did you drink enough water?" />
              <HabitCheckItem icon={Utensils} label="Did you eat healthily?" />
              <HabitCheckItem icon={Dumbbell} label="Did you exercise?" />
            </div>
            <DrawerFooter>
              <Button className="bg-lime text-black hover:bg-lime-muted font-medium w-full">
                Save Check-in
              </Button>
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Section>
  )
}

function HabitCheckItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  const [checked, setChecked] = useState(false)

  return (
    <button
      onClick={() => setChecked(!checked)}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl transition-all',
        checked ? 'bg-lime/10 border border-lime/30' : 'bg-white/5 border border-white/10'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
          checked ? 'bg-lime' : 'border border-white/30'
        )}
      >
        {checked && <Check className="h-5 w-5 text-black" />}
      </div>
      <Icon className={cn('h-5 w-5', checked ? 'text-lime' : 'text-muted-foreground')} />
      <span className={cn('text-sm', checked ? 'text-white' : 'text-muted-foreground')}>{label}</span>
    </button>
  )
}

function Toasts() {
  return (
    <Section title="Toasts">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/15"
          onClick={() => toast.success('Weight logged', { description: 'Down 0.8kg from last week!' })}
        >
          Success Toast
        </Button>
        <Button
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/15"
          onClick={() => toast.error('Could not save', { description: 'Please try again.' })}
        >
          Error Toast
        </Button>
        <Button
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/15"
          onClick={() => toast.info('Reminder', { description: 'Your injection is due tomorrow.' })}
        >
          Info Toast
        </Button>
        <Button
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/15"
          onClick={() =>
            toast('Habit logged', {
              action: {
                label: 'Undo',
                onClick: () => console.log('Undo'),
              },
            })
          }
        >
          Toast with Action
        </Button>
      </div>
    </Section>
  )
}

function LoadingStates() {
  return (
    <Section title="Loading States">
      <div className="space-y-6">
        {/* Spinner */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Spinner</h3>
          <div className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-lime" />
            <Loader2 className="h-8 w-8 animate-spin text-lime" />
            <Loader2 className="h-10 w-10 animate-spin text-lime" />
          </div>
        </div>

        {/* Skeleton */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Skeleton Loading</h3>
          <Card className="bg-card border-border">
            <CardContent className="pt-4 space-y-3">
              <div className="h-8 bg-white/5 rounded-lg animate-pulse w-24" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-32" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-20" />
            </CardContent>
          </Card>
        </div>

        {/* Button Loading */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Button Loading</h3>
          <Button className="bg-lime text-black font-medium" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </Button>
        </div>
      </div>
    </Section>
  )
}

function Icons() {
  const icons = [
    { icon: Home, name: 'Home' },
    { icon: Calendar, name: 'Calendar' },
    { icon: User, name: 'User' },
    { icon: Settings, name: 'Settings' },
    { icon: Scale, name: 'Scale' },
    { icon: Syringe, name: 'Syringe' },
    { icon: Droplets, name: 'Droplets' },
    { icon: Utensils, name: 'Utensils' },
    { icon: Dumbbell, name: 'Dumbbell' },
    { icon: Activity, name: 'Activity' },
    { icon: TrendingUp, name: 'TrendingUp' },
    { icon: TrendingDown, name: 'TrendingDown' },
    { icon: Check, name: 'Check' },
    { icon: X, name: 'X' },
    { icon: Plus, name: 'Plus' },
    { icon: ChevronRight, name: 'ChevronRight' },
    { icon: Bell, name: 'Bell' },
    { icon: Loader2, name: 'Loader2' },
  ]

  return (
    <Section title="Icons">
      <p className="text-sm text-muted-foreground mb-4">Using lucide-react exclusively.</p>
      <div className="grid grid-cols-6 gap-4">
        {icons.map(({ icon: Icon, name }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-[10px] text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

function BottomNavigation() {
  const [active, setActive] = useState('home')

  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <Section title="Bottom Navigation (Deprecated)">
      <div className="opacity-50">
        <div className="bg-card rounded-2xl border border-border p-2">
          <div className="flex items-center justify-around">
            {items.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all',
                  active === id && 'bg-lime text-black',
                  active !== id && 'text-muted-foreground hover:text-white'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-amber-400 mt-2">
        Deprecated: Use Header navigation instead. This pattern was replaced with a fixed top header for desktop-first layout.
      </p>
    </Section>
  )
}

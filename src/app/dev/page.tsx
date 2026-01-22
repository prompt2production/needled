import Link from 'next/link'
import { Zap, Shield, Repeat, Palette, Activity, BookOpen, Rocket, ArrowRight, Sparkles, Home } from 'lucide-react'

export default function DevHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            You&apos;re ready to build
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Prompt2Production Starter
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A production-ready Next.js boilerplate for AI-driven development.
            Build features while you sleep using the Ralph Wiggum workflow.
          </p>
        </div>
      </div>

      {/* Quick Start Card */}
      <div className="max-w-4xl mx-auto px-6 -mt-4 mb-12">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Rocket className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Quick Start</h2>
              <p className="text-indigo-100 mb-4">
                Open <code className="bg-white/20 px-2 py-0.5 rounded text-sm">GETTING_STARTED.md</code> and follow the workflow:
              </p>
              <div className="grid sm:grid-cols-5 gap-2 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-bold text-white/90">Phase 0</div>
                  <div className="text-indigo-200">Project Brief</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-bold text-white/90">Phase 1</div>
                  <div className="text-indigo-200">Design System</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <div className="font-bold text-white/90">Phase 2</div>
                  <div className="text-indigo-200">Features <span className="text-xs opacity-75">(optional)</span></div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-bold text-white/90">Phase 3</div>
                  <div className="text-indigo-200">Plan Feature</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="font-bold text-white/90">Phase 4</div>
                  <div className="text-indigo-200">Build</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Pages Section */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Pages</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {/* Your App */}
          <Link
            href="/"
            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">/</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Your App</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Your app&apos;s homepage. This will become your main entry point once you build your first feature.
                </p>
                <div className="text-xs text-slate-400">
                  Currently shows a placeholder page
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Design System Page */}
          <Link
            href="/design"
            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">/design</h3>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">After Phase 1</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Visual reference showing all UI components styled according to your design system.
                  Use this to verify components match your chosen look and feel.
                </p>
                <div className="text-xs text-slate-400">
                  Created when you complete &quot;Design system:&quot; trigger
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          {/* Progress Dashboard */}
          <Link
            href="/dev/progress"
            className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900">/dev/progress</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Always available</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  Live dashboard showing Ralph&apos;s build progress. Watch stories complete in real-time
                  with auto-refresh every 3 seconds.
                </p>
                <div className="text-xs text-slate-400">
                  Shows data once you&apos;ve run &quot;Plan feature:&quot; trigger
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>

      {/* What is Prompt2Production */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">What is Prompt2Production?</h2>
          <p className="text-slate-600 mb-8">
            <strong className="text-slate-900">Prompt2Production</strong> bridges the gap between &quot;vibe coding&quot; and professional engineering.
            It&apos;s a methodology for building production-quality software using AI coding assistants with proper discipline:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Structured Workflows</h3>
              <p className="text-sm text-slate-600">
                Repeatable patterns that produce consistent, high-quality output
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Engineering Discipline</h3>
              <p className="text-sm text-slate-600">
                Testing, validation, design systems, and documentation built-in
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Repeat className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Iterative Development</h3>
              <p className="text-sm text-slate-600">
                Let AI agents build features autonomously while you sleep
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What&apos;s Included</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-3">
            {[
              'Next.js 16 with App Router',
              'Vitest + Playwright testing',
              'PostgreSQL + Prisma ORM',
              'CLAUDE.md for AI context',
              'shadcn/ui component library',
              'DESIGN_SYSTEM.md for UI consistency',
              'Tailwind CSS styling',
              'Ralph workflow pre-configured',
              'Progress dashboard included',
              'ESLint 9 + TypeScript 5',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-slate-700">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Getting Started</h2>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div>
                <p className="font-medium text-slate-900">Open Claude Code in your terminal</p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">claude</code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div>
                <p className="font-medium text-slate-900">Set your project context</p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">Project: [describe what you&apos;re building]</code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div>
                <p className="font-medium text-slate-900">Define your design system</p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">Design system: [describe the look and feel]</code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div>
                <p className="font-medium text-slate-900">Break down into features <span className="text-sm font-normal text-slate-500">(optional)</span></p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">Plan features:</code>
                <p className="text-xs text-slate-500 mt-1">Recommended for greenfield projects</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
              <div>
                <p className="font-medium text-slate-900">Plan your first feature</p>
                <code className="text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">Plan feature: [feature name or description]</code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</div>
              <div>
                <p className="font-medium text-slate-900">Run Ralph and watch the magic happen</p>
                <p className="text-sm text-slate-600">See <code className="bg-slate-100 px-1.5 py-0.5 rounded">GETTING_STARTED.md</code> for the full command</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Console Command Tip */}
      <div className="max-w-4xl mx-auto px-6 mb-16">
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-slate-400 text-sm">Terminal</span>
          </div>
          <p className="text-slate-400 mb-2"># Check build progress from the command line</p>
          <code className="text-emerald-400 text-lg">npm run progress</code>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center border-t border-slate-200">
        <p className="text-slate-500">
          Built with the{' '}
          <a
            href="https://prompt2production.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Prompt2Production
          </a>
          {' '}methodology
        </p>
      </footer>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, Loader2, Clock, FolderOpen, Activity, Timer, ArrowLeft, Sparkles } from 'lucide-react'

interface Story {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  passes: boolean
}

interface FeatureTiming {
  firstCompletedAt: string | null
  lastCompletedAt: string | null
  elapsedMinutes: number | null
  isComplete: boolean
}

interface FeatureProgress {
  name: string
  folderName: string
  stories: Story[]
  completed: number
  total: number
  percentage: number
  recentActivity: string[]
  timing: FeatureTiming
}

interface OverallProgress {
  features: FeatureProgress[]
  totalCompleted: number
  totalStories: number
  overallPercentage: number
  currentFeature: FeatureProgress | null
  totalElapsedMinutes: number | null
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return ''
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function ProgressBar({ percentage, size = 'md' }: { percentage: number; size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  
  return (
    <div className={`w-full bg-slate-200 rounded-full ${heights[size]} overflow-hidden`}>
      <div
        className={`${heights[size]} rounded-full transition-all duration-500 ease-out ${
          percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

function TimingBadge({ timing }: { timing: FeatureTiming }) {
  if (timing.elapsedMinutes === null) return null
  
  const duration = formatDuration(timing.elapsedMinutes)
  
  if (timing.isComplete) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
        <Timer className="w-3.5 h-3.5" />
        <span>{duration} total</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1.5 text-sm text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
      <Timer className="w-3.5 h-3.5" />
      <span>{duration} elapsed</span>
    </div>
  )
}

function StoryItem({ story, isNext }: { story: Story; isNext: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        story.passes
          ? 'bg-emerald-50 border border-emerald-200'
          : isNext
          ? 'bg-amber-50 border border-amber-300 ring-2 ring-amber-200'
          : 'bg-slate-50 border border-slate-200'
      }`}
    >
      <div className="mt-0.5">
        {story.passes ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : isNext ? (
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
        ) : (
          <Circle className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
            story.passes 
              ? 'bg-emerald-200 text-emerald-800' 
              : isNext 
              ? 'bg-amber-200 text-amber-800'
              : 'bg-slate-200 text-slate-600'
          }`}>
            {story.id}
          </span>
          {isNext && (
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              IN PROGRESS
            </span>
          )}
        </div>
        <p className={`text-sm font-medium mt-1 ${
          story.passes ? 'text-emerald-900' : 'text-slate-900'
        }`}>
          {story.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
          {story.description}
        </p>
      </div>
    </div>
  )
}

function FeatureCard({ feature, isExpanded, onToggle }: { 
  feature: FeatureProgress
  isExpanded: boolean
  onToggle: () => void
}) {
  const isComplete = feature.percentage === 100
  const isInProgress = feature.completed > 0 && feature.completed < feature.total
  const firstIncompleteIndex = feature.stories.findIndex(s => !s.passes)
  
  return (
    <div className={`rounded-2xl border ${
      isComplete
        ? 'border-emerald-200 bg-emerald-50/50'
        : isInProgress
        ? 'border-indigo-200 bg-white shadow-sm'
        : 'border-slate-200 bg-white'
    }`}>
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors rounded-2xl"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          isComplete 
            ? 'bg-emerald-100 text-emerald-600' 
            : isInProgress 
            ? 'bg-indigo-100 text-indigo-600' 
            : 'bg-slate-100 text-slate-500'
        }`}>
          <FolderOpen className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate">{feature.name}</h3>
            {isComplete && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                COMPLETE
              </span>
            )}
            {isInProgress && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full animate-pulse">
                BUILDING
              </span>
            )}
            <TimingBadge timing={feature.timing} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            features/{feature.folderName}
          </p>
        </div>
        
        <div className="text-right">
          <p className={`text-2xl font-bold ${
            isComplete ? 'text-emerald-600' : 'text-slate-900'
          }`}>
            {feature.percentage}%
          </p>
          <p className="text-sm text-slate-500">
            {feature.completed}/{feature.total} stories
          </p>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <ProgressBar percentage={feature.percentage} size="sm" />
          
          <div className="space-y-2">
            {feature.stories.map((story, index) => (
              <StoryItem
                key={story.id}
                story={story}
                isNext={index === firstIncompleteIndex}
              />
            ))}
          </div>
          
          {feature.recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4" />
                Recent Activity
              </h4>
              <ul className="space-y-1">
                {feature.recentActivity.map((activity, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProgressDashboard() {
  const [progress, setProgress] = useState<OverallProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/dev/progress')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProgress(data)
      setLastUpdated(new Date())
      setError(null)
      
      // Auto-expand features that are in progress
      if (data.currentFeature) {
        setExpandedFeatures(prev => new Set([...prev, data.currentFeature.folderName]))
      }
    } catch (e) {
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    
    // Poll every 3 seconds
    const interval = setInterval(fetchProgress, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleFeature = (folderName: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev)
      if (next.has(folderName)) {
        next.delete(folderName)
      } else {
        next.add(folderName)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-2 text-slate-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProgress}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!progress || progress.features.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <Link
              href="/dev"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dev Guide
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6 ml-4">
              <Activity className="w-4 h-4" />
              Live Dashboard
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Ralph Progress Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Track feature development progress in real-time. Watch as Ralph builds
              your features story by story.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 -mt-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Features Yet</h2>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Start by planning a feature with Claude. Say <code className="bg-slate-100 px-2 py-0.5 rounded text-sm">&quot;Plan feature:&quot;</code> followed by your description.
            </p>
            <Link
              href="/dev"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-slate-500">
            Auto-refreshes every 3 seconds
          </p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dev"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dev Guide
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              {lastUpdated && (
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <Activity className="w-4 h-4" />
              Live Dashboard
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Ralph Progress Dashboard
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Track feature development progress in real-time. Watch as Ralph builds
              your features story by story.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4">

        {/* Overall Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overall Progress</h2>
              <p className="text-sm text-slate-500">
                {progress.features.length} feature{progress.features.length !== 1 ? 's' : ''} tracked
              </p>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${
                progress.overallPercentage === 100 ? 'text-emerald-600' : 'text-indigo-600'
              }`}>
                {progress.overallPercentage}%
              </p>
              <p className="text-sm text-slate-500">
                {progress.totalCompleted}/{progress.totalStories} stories
              </p>
            </div>
          </div>
          <ProgressBar percentage={progress.overallPercentage} size="lg" />
          
          {progress.totalElapsedMinutes !== null && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-600">
              <Timer className="w-4 h-4" />
              <span>Total build time: <strong>{formatDuration(progress.totalElapsedMinutes)}</strong></span>
            </div>
          )}
        </div>

        {/* Current Feature Highlight */}
        {progress.currentFeature && progress.currentFeature.percentage < 100 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-indigo-900">
                  Currently building: <strong>{progress.currentFeature.name}</strong>
                </p>
                <p className="text-sm text-indigo-700">
                  {progress.currentFeature.completed} of {progress.currentFeature.total} stories complete
                </p>
              </div>
              {progress.currentFeature.timing.elapsedMinutes !== null && (
                <div className="text-sm text-indigo-700">
                  {formatDuration(progress.currentFeature.timing.elapsedMinutes)} elapsed
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="space-y-4">
          {progress.features.map(feature => (
            <FeatureCard
              key={feature.folderName}
              feature={feature}
              isExpanded={expandedFeatures.has(feature.folderName)}
              onToggle={() => toggleFeature(feature.folderName)}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-12 py-8 text-center border-t border-slate-200">
          <p className="text-slate-500 mb-2">Auto-refreshes every 3 seconds</p>
          <p className="text-sm text-slate-400">
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
    </div>
  )
}

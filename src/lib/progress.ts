import fs from 'fs'
import path from 'path'

export interface Story {
  id: string
  title: string
  description: string
  acceptance_criteria: string[]
  passes: boolean
}

export interface StoryTiming {
  storyId: string
  storyTitle: string
  completedAt: Date | null
}

export interface FeatureProgress {
  name: string
  folderName: string
  stories: Story[]
  completed: number
  total: number
  percentage: number
  recentActivity: string[]
  timing: {
    firstCompletedAt: Date | null
    lastCompletedAt: Date | null
    elapsedMinutes: number | null
    isComplete: boolean
  }
}

export interface OverallProgress {
  features: FeatureProgress[]
  totalCompleted: number
  totalStories: number
  overallPercentage: number
  currentFeature: FeatureProgress | null
  totalElapsedMinutes: number | null
}

function getFeaturesDir(): string {
  return path.join(process.cwd(), 'features')
}

function parseProgressTxt(filePath: string): { recentActivity: string[], timings: StoryTiming[] } {
  const recentActivity: string[] = []
  const timings: StoryTiming[] = []
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    if (!content.trim()) return { recentActivity, timings }
    
    // Split by story entries (marked by ---)
    const entries = content.split('---').filter(e => e.trim())
    
    for (const entry of entries) {
      const lines = entry.trim().split('\n')
      
      let storyId = ''
      let storyTitle = ''
      let completedAt: Date | null = null
      
      for (const line of lines) {
        if (line.startsWith('Story:')) {
          const storyPart = line.replace('Story:', '').trim()
          const match = storyPart.match(/^([A-Z]+-\d+)\s+(.*)$/)
          if (match) {
            storyId = match[1]
            storyTitle = match[2]
          } else {
            storyTitle = storyPart
          }
        }
        if (line.startsWith('Completed:')) {
          const dateStr = line.replace('Completed:', '').trim()
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            completedAt = parsed
          }
        }
      }
      
      if (storyId || storyTitle) {
        timings.push({ storyId, storyTitle, completedAt })
      }
    }
    
    // Get last 5 entries for recent activity, most recent first
    const activityEntries = entries.slice(-5).reverse()
    for (const entry of activityEntries) {
      const lines = entry.trim().split('\n')
      const storyLine = lines.find(l => l.startsWith('Story:'))
      if (storyLine) {
        recentActivity.push(storyLine.replace('Story:', '').trim())
      }
    }
    
  } catch {
    // File doesn't exist or can't be read
  }
  
  return { recentActivity, timings }
}

function calculateTiming(timings: StoryTiming[], isComplete: boolean): FeatureProgress['timing'] {
  const validTimings = timings.filter(t => t.completedAt !== null)
  
  if (validTimings.length === 0) {
    return {
      firstCompletedAt: null,
      lastCompletedAt: null,
      elapsedMinutes: null,
      isComplete
    }
  }
  
  const sortedTimings = validTimings.sort((a, b) => 
    (a.completedAt?.getTime() || 0) - (b.completedAt?.getTime() || 0)
  )
  
  const firstCompletedAt = sortedTimings[0].completedAt
  const lastCompletedAt = sortedTimings[sortedTimings.length - 1].completedAt
  
  let elapsedMinutes: number | null = null
  
  if (firstCompletedAt && lastCompletedAt) {
    if (isComplete) {
      // Feature complete: show total time from first to last
      elapsedMinutes = Math.round((lastCompletedAt.getTime() - firstCompletedAt.getTime()) / 60000)
    } else {
      // Feature in progress: show time from first story to now
      elapsedMinutes = Math.round((Date.now() - firstCompletedAt.getTime()) / 60000)
    }
  }
  
  return {
    firstCompletedAt,
    lastCompletedAt,
    elapsedMinutes,
    isComplete
  }
}

function parseFeatureFolder(folderPath: string, folderName: string): FeatureProgress | null {
  const prdJsonPath = path.join(folderPath, 'prd.json')
  const progressTxtPath = path.join(folderPath, 'progress.txt')
  
  if (!fs.existsSync(prdJsonPath)) {
    return null
  }
  
  try {
    const prdContent = fs.readFileSync(prdJsonPath, 'utf-8')
    const prd = JSON.parse(prdContent)
    
    const stories: Story[] = prd.stories || []
    const completed = stories.filter(s => s.passes).length
    const total = stories.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const isComplete = completed === total && total > 0
    
    const { recentActivity, timings } = parseProgressTxt(progressTxtPath)
    const timing = calculateTiming(timings, isComplete)
    
    return {
      name: prd.feature || folderName,
      folderName,
      stories,
      completed,
      total,
      percentage,
      recentActivity,
      timing
    }
  } catch {
    return null
  }
}

export function getProgress(): OverallProgress {
  const featuresDir = getFeaturesDir()
  const features: FeatureProgress[] = []
  
  if (!fs.existsSync(featuresDir)) {
    return {
      features: [],
      totalCompleted: 0,
      totalStories: 0,
      overallPercentage: 0,
      currentFeature: null,
      totalElapsedMinutes: null
    }
  }
  
  const folders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
  
  for (const folder of folders) {
    const folderPath = path.join(featuresDir, folder)
    const feature = parseFeatureFolder(folderPath, folder)
    if (feature) {
      features.push(feature)
    }
  }
  
  const totalCompleted = features.reduce((sum, f) => sum + f.completed, 0)
  const totalStories = features.reduce((sum, f) => sum + f.total, 0)
  const overallPercentage = totalStories > 0 ? Math.round((totalCompleted / totalStories) * 100) : 0
  
  // Current feature is one that's in progress (has some but not all complete)
  const currentFeature = features.find(f => f.completed > 0 && f.completed < f.total) 
    || features.find(f => f.completed === 0 && f.total > 0)
    || null
  
  // Calculate total elapsed time across all features
  let totalElapsedMinutes: number | null = null
  const featuresWithTiming = features.filter(f => f.timing.elapsedMinutes !== null)
  if (featuresWithTiming.length > 0) {
    totalElapsedMinutes = featuresWithTiming.reduce((sum, f) => sum + (f.timing.elapsedMinutes || 0), 0)
  }
  
  return {
    features,
    totalCompleted,
    totalStories,
    overallPercentage,
    currentFeature,
    totalElapsedMinutes
  }
}

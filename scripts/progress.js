#!/usr/bin/env node

/**
 * Ralph Progress CLI
 * Run with: npm run progress
 */

const fs = require('fs')
const path = require('path')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return ''
  if (minutes < 1) return '<1m'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function parseProgressTxt(filePath) {
  const timings = []
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    if (!content.trim()) return { timings }
    
    const entries = content.split('---').filter(e => e.trim())
    
    for (const entry of entries) {
      const lines = entry.trim().split('\n')
      let completedAt = null
      
      for (const line of lines) {
        if (line.startsWith('Completed:')) {
          const dateStr = line.replace('Completed:', '').trim()
          const parsed = new Date(dateStr)
          if (!isNaN(parsed.getTime())) {
            completedAt = parsed
          }
        }
      }
      
      if (completedAt) {
        timings.push({ completedAt })
      }
    }
  } catch (e) {
    // File doesn't exist
  }
  
  return { timings }
}

function calculateTiming(timings, isComplete) {
  if (timings.length === 0) {
    return { elapsedMinutes: null }
  }
  
  const sorted = timings.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime())
  const first = sorted[0].completedAt
  const last = sorted[sorted.length - 1].completedAt
  
  let elapsedMinutes
  if (isComplete) {
    elapsedMinutes = Math.round((last.getTime() - first.getTime()) / 60000)
  } else {
    elapsedMinutes = Math.round((Date.now() - first.getTime()) / 60000)
  }
  
  return { elapsedMinutes, isComplete }
}

function getProgress() {
  const featuresDir = path.join(process.cwd(), 'features')
  const features = []

  if (!fs.existsSync(featuresDir)) {
    return { features: [], totalCompleted: 0, totalStories: 0, totalElapsedMinutes: null }
  }

  const folders = fs.readdirSync(featuresDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const folder of folders) {
    const prdPath = path.join(featuresDir, folder, 'prd.json')
    const progressPath = path.join(featuresDir, folder, 'progress.txt')
    if (!fs.existsSync(prdPath)) continue

    try {
      const prd = JSON.parse(fs.readFileSync(prdPath, 'utf-8'))
      const stories = prd.stories || []
      const completed = stories.filter(s => s.passes).length
      const total = stories.length
      const isComplete = completed === total && total > 0
      
      const { timings } = parseProgressTxt(progressPath)
      const timing = calculateTiming(timings, isComplete)

      features.push({
        name: prd.feature || folder,
        folder,
        stories,
        completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        timing
      })
    } catch (e) {
      // Skip invalid files
    }
  }

  const totalCompleted = features.reduce((sum, f) => sum + f.completed, 0)
  const totalStories = features.reduce((sum, f) => sum + f.total, 0)
  
  // Calculate total time
  let totalElapsedMinutes = null
  const featuresWithTiming = features.filter(f => f.timing.elapsedMinutes !== null)
  if (featuresWithTiming.length > 0) {
    totalElapsedMinutes = featuresWithTiming.reduce((sum, f) => sum + f.timing.elapsedMinutes, 0)
  }

  return { features, totalCompleted, totalStories, totalElapsedMinutes }
}

function progressBar(percentage, width = 30) {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return bar
}

function printProgress() {
  const { features, totalCompleted, totalStories, totalElapsedMinutes } = getProgress()

  console.log()
  console.log(`${colors.bold}${colors.blue}📊 Ralph Progress Dashboard${colors.reset}`)
  console.log(`${colors.dim}${'━'.repeat(50)}${colors.reset}`)
  console.log()

  if (features.length === 0) {
    console.log(`${colors.dim}No features found. Start with "Plan feature:" in Claude.${colors.reset}`)
    console.log()
    return
  }

  // Overall progress
  const overallPercentage = totalStories > 0 ? Math.round((totalCompleted / totalStories) * 100) : 0
  const overallColor = overallPercentage === 100 ? colors.green : colors.blue
  
  console.log(`${colors.bold}Overall Progress${colors.reset}`)
  console.log(`${overallColor}${progressBar(overallPercentage)}${colors.reset} ${overallPercentage}%`)
  console.log(`${colors.dim}${totalCompleted}/${totalStories} stories complete${colors.reset}`)
  if (totalElapsedMinutes !== null) {
    console.log(`${colors.dim}⏱  Total build time: ${formatDuration(totalElapsedMinutes)}${colors.reset}`)
  }
  console.log()

  // Each feature
  for (const feature of features) {
    const isComplete = feature.percentage === 100
    const isInProgress = feature.completed > 0 && feature.completed < feature.total
    
    const statusIcon = isComplete ? '✅' : isInProgress ? '🔄' : '⬜'
    const statusText = isComplete ? `${colors.green}COMPLETE${colors.reset}` : 
                       isInProgress ? `${colors.yellow}IN PROGRESS${colors.reset}` : 
                       `${colors.dim}PENDING${colors.reset}`
    
    const timingText = feature.timing.elapsedMinutes !== null 
      ? `${colors.cyan}⏱ ${formatDuration(feature.timing.elapsedMinutes)}${isComplete ? '' : ' elapsed'}${colors.reset}`
      : ''
    
    console.log(`${colors.bold}${statusIcon} ${feature.name}${colors.reset} ${statusText} ${timingText}`)
    console.log(`${colors.dim}   features/${feature.folder}${colors.reset}`)
    
    const featureColor = isComplete ? colors.green : colors.blue
    console.log(`   ${featureColor}${progressBar(feature.percentage, 25)}${colors.reset} ${feature.percentage}% (${feature.completed}/${feature.total})`)
    console.log()

    // Show stories
    const firstIncomplete = feature.stories.findIndex(s => !s.passes)
    
    for (let i = 0; i < feature.stories.length; i++) {
      const story = feature.stories[i]
      const isNext = i === firstIncomplete
      
      let icon, color
      if (story.passes) {
        icon = '✅'
        color = colors.green
      } else if (isNext) {
        icon = '🔄'
        color = colors.yellow
      } else {
        icon = '⬜'
        color = colors.dim
      }
      
      const suffix = isNext ? ` ${colors.yellow}← CURRENT${colors.reset}` : ''
      console.log(`   ${icon} ${color}${story.id}${colors.reset}: ${story.title}${suffix}`)
    }
    
    console.log()
  }

  console.log(`${colors.dim}${'━'.repeat(50)}${colors.reset}`)
  console.log(`${colors.dim}Last updated: ${new Date().toLocaleTimeString()}${colors.reset}`)
  console.log(`${colors.dim}Web dashboard: http://localhost:2810/dev/progress${colors.reset}`)
  console.log()
}

// Run
printProgress()

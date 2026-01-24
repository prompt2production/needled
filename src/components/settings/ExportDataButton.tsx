'use client'

import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ExportDataButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings/export')

      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] ?? 'needled-export.json'

      // Get the JSON data
      const data = await response.json()

      // Create a blob and trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Your data is downloading...')
    } catch (error) {
      console.error('Failed to export data:', error)
      toast.error('Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white font-medium">Export Your Data</p>
        <p className="text-sm text-muted-foreground">
          Download all your data as a JSON file
        </p>
      </div>
      <Button
        onClick={handleExport}
        disabled={isLoading}
        variant="secondary"
        className="bg-white/10 text-white hover:bg-white/15"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export
      </Button>
    </div>
  )
}

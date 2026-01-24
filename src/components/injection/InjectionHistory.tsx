'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getSiteLabel } from '@/lib/injection-site'
import type { InjectionSite } from '@/lib/validations/injection'
import { InjectionEditDialog } from './InjectionEditDialog'

interface Injection {
  id: string
  userId: string
  site: string
  doseNumber: number
  notes: string | null
  date: string
  createdAt: string
}

interface InjectionHistoryProps {
  userId: string
}

export function InjectionHistory({ userId }: InjectionHistoryProps) {
  const [injections, setInjections] = useState<Injection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null)
  const [deletingInjection, setDeletingInjection] = useState<Injection | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/injections?userId=${userId}&limit=20`)

      if (!response.ok) {
        throw new Error('Failed to fetch injection history')
      }

      const data = await response.json()
      setInjections(data)
    } catch (err) {
      setError('Failed to load injection history')
      console.error('Error fetching injection history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleDelete = async () => {
    if (!deletingInjection) return
    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/injections/${deletingInjection.id}?userId=${userId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Injection deleted')
      fetchHistory()
    } catch (error) {
      console.error('Error deleting injection:', error)
      toast.error('Could not delete', {
        description: 'Please try again.',
      })
    } finally {
      setIsDeleting(false)
      setDeletingInjection(null)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-lime animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchHistory}
          className="text-lime text-sm mt-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  // Empty state
  if (injections.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 text-center">
        <p className="text-muted-foreground">No injections logged yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {injections.map((injection) => {
          const date = new Date(injection.date)
          const formattedDate = format(date, 'EEEE, MMM d')
          const siteLabel = getSiteLabel(injection.site as InjectionSite)

          return (
            <div
              key={injection.id}
              className="bg-card rounded-xl border border-border p-4 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground mt-1">{siteLabel}</p>
                  {injection.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {injection.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"
                    onClick={() => setEditingInjection(injection)}
                    aria-label="Edit injection"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeletingInjection(injection)}
                    aria-label="Delete injection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Dialog */}
      {editingInjection && (
        <InjectionEditDialog
          open={!!editingInjection}
          onOpenChange={(open) => !open && setEditingInjection(null)}
          injection={editingInjection}
          userId={userId}
          onSuccess={() => {
            setEditingInjection(null)
            fetchHistory()
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingInjection}
        onOpenChange={(open) => !open && setDeletingInjection(null)}
      >
        <AlertDialogContent className="bg-card-elevated border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete injection?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the injection entry for{' '}
              <span className="text-white font-medium">
                {deletingInjection && format(new Date(deletingInjection.date), 'EEE d MMM yyyy')}
              </span>{' '}
              ({deletingInjection && getSiteLabel(deletingInjection.site as InjectionSite)}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-muted-foreground hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

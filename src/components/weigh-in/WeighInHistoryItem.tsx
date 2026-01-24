'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { TrendingDown, TrendingUp, Pencil, Trash2 } from 'lucide-react'
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
import { WeighInEditDialog } from './WeighInEditDialog'

interface WeighInHistoryItemProps {
  weighIn: {
    id: string
    weight: number
    date: string
  }
  previousWeighIn?: {
    weight: number
  } | null
  weightUnit: 'kg' | 'lbs'
  userId: string
  onUpdate: () => void
}

export function WeighInHistoryItem({
  weighIn,
  previousWeighIn,
  weightUnit,
  userId,
  onUpdate,
}: WeighInHistoryItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const change = previousWeighIn
    ? weighIn.weight - previousWeighIn.weight
    : null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(
        `/api/weigh-ins/${weighIn.id}?userId=${userId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      toast.success('Weigh-in deleted')
      onUpdate()
    } catch (error) {
      console.error('Error deleting weigh-in:', error)
      toast.error('Could not delete', {
        description: 'Please try again.',
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between py-2 border-b border-border last:border-0 group">
        <div>
          <p className="text-sm text-white">
            {format(new Date(weighIn.date), 'EEE d MMM')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {change !== null && change !== 0 && (
            <span
              className={`text-xs flex items-center gap-0.5 ${
                change < 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}
            </span>
          )}
          <span className="text-white font-medium">
            {weighIn.weight.toFixed(1)} {weightUnit}
          </span>

          {/* Edit/Delete buttons - visible on hover or always on mobile */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={() => setEditDialogOpen(true)}
              aria-label="Edit weigh-in"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Delete weigh-in"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <WeighInEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        weighIn={weighIn}
        weightUnit={weightUnit}
        userId={userId}
        onSuccess={onUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card-elevated border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete weigh-in?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the weigh-in entry for{' '}
              <span className="text-white font-medium">
                {format(new Date(weighIn.date), 'EEE d MMM yyyy')}
              </span>{' '}
              ({weighIn.weight.toFixed(1)} {weightUnit}).
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

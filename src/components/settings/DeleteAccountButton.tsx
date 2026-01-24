'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function DeleteAccountButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Incorrect password') {
          setError('Incorrect password')
          return
        }
        throw new Error(data.error || 'Failed to delete account')
      }

      toast.success('Account deleted successfully')
      // Clear any local storage
      localStorage.clear()
      // Redirect to landing page
      router.replace('/')
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setPassword('')
      setError('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="bg-red-500/20 text-red-400 hover:bg-red-500/30 w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card-elevated border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Account</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This action cannot be undone. This will permanently delete your account
            and remove all your data including:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
            <li>Your profile information</li>
            <li>All weight recordings</li>
            <li>All injection logs</li>
            <li>All habit check-ins</li>
            <li>Notification preferences</li>
          </ul>

          <div className="space-y-2">
            <Label htmlFor="delete-password" className="text-muted-foreground">
              Enter your password to confirm
            </Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className="bg-input border-border text-white h-12"
              placeholder="Your password"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || !password}
            variant="destructive"
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete My Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ChevronDown, ChevronUp, Key } from 'lucide-react'
import { passwordUpdateSchema, type PasswordUpdateInput } from '@/lib/validations/settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'

export function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: PasswordUpdateInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error === 'Current password is incorrect') {
          toast.error('Incorrect current password')
          return
        }
        throw new Error(errorData.error?.[0]?.message || errorData.error || 'Failed to change password')
      }

      toast.success('Password changed successfully')
      reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-white font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-muted-foreground">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword')}
              className="bg-input border-border text-white h-12"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-400">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-muted-foreground">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword')}
              className="bg-input border-border text-white h-12"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-400">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-muted-foreground">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="bg-input border-border text-white h-12"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-lime text-black hover:bg-lime-muted font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Changing...
              </>
            ) : (
              'Change Password'
            )}
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  )
}

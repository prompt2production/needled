'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { emailUpdateSchema, type EmailUpdateInput } from '@/lib/validations/settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EmailUpdateFormProps {
  currentEmail: string | null
  onUpdate: (newEmail: string) => void
}

export function EmailUpdateForm({ currentEmail, onUpdate }: EmailUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EmailUpdateInput>({
    resolver: zodResolver(emailUpdateSchema),
    defaultValues: {
      email: currentEmail ?? '',
    },
  })

  const onSubmit = async (data: EmailUpdateInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.status === 409) {
        toast.error('Email already in use')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.[0]?.message || 'Failed to update email')
      }

      onUpdate(data.email)
      reset({ email: data.email })
      toast.success('Email updated')
    } catch (error) {
      console.error('Failed to update email:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update email')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="bg-input border-border text-white h-12"
        />
        {errors.email && (
          <p className="text-sm text-red-400">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="bg-lime text-black hover:bg-lime-muted font-medium"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Email'
        )}
      </Button>
    </form>
  )
}

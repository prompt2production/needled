'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/settings'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { SettingsData } from '@/app/settings/page'

const MEDICATIONS = [
  { value: 'OZEMPIC', label: 'Ozempic' },
  { value: 'WEGOVY', label: 'Wegovy' },
  { value: 'MOUNJARO', label: 'Mounjaro' },
  { value: 'ZEPBOUND', label: 'Zepbound' },
  { value: 'OTHER', label: 'Other' },
] as const

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
] as const

interface ProfileSettingsFormProps {
  settings: SettingsData
  onUpdate: (data: Partial<SettingsData>) => void
}

export function ProfileSettingsForm({ settings, onUpdate }: ProfileSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: settings.name,
      goalWeight: settings.goalWeight ?? undefined,
      medication: settings.medication,
      injectionDay: settings.injectionDay,
    },
  })

  const medication = watch('medication')
  const injectionDay = watch('injectionDay')

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.[0]?.message || 'Failed to update profile')
      }

      const updatedData = await response.json()
      onUpdate(updatedData)
      toast.success('Profile updated')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-muted-foreground">
          Name
        </Label>
        <Input
          id="name"
          {...register('name')}
          className="bg-input border-border text-white h-12"
        />
        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* Goal Weight */}
      <div className="space-y-2">
        <Label htmlFor="goalWeight" className="text-muted-foreground">
          Goal Weight
        </Label>
        <div className="relative">
          <Input
            id="goalWeight"
            type="number"
            step="0.1"
            {...register('goalWeight', {
              setValueAs: (v) => (v === '' ? null : parseFloat(v)),
            })}
            className="bg-input border-border text-white h-12 pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {settings.weightUnit}
          </span>
        </div>
        {errors.goalWeight && (
          <p className="text-sm text-red-400">{errors.goalWeight.message}</p>
        )}
      </div>

      {/* Medication */}
      <div className="space-y-2">
        <Label htmlFor="medication" className="text-muted-foreground">
          Medication
        </Label>
        <Select
          value={medication}
          onValueChange={(value) => setValue('medication', value as ProfileUpdateInput['medication'], { shouldDirty: true })}
        >
          <SelectTrigger className="bg-input border-border text-white h-12">
            <SelectValue placeholder="Select medication" />
          </SelectTrigger>
          <SelectContent>
            {MEDICATIONS.map((med) => (
              <SelectItem key={med.value} value={med.value}>
                {med.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.medication && (
          <p className="text-sm text-red-400">{errors.medication.message}</p>
        )}
      </div>

      {/* Injection Day */}
      <div className="space-y-2">
        <Label htmlFor="injectionDay" className="text-muted-foreground">
          Injection Day
        </Label>
        <Select
          value={injectionDay.toString()}
          onValueChange={(value) => setValue('injectionDay', parseInt(value), { shouldDirty: true })}
        >
          <SelectTrigger className="bg-input border-border text-white h-12">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.injectionDay && (
          <p className="text-sm text-red-400">{errors.injectionDay.message}</p>
        )}
      </div>

      {/* Save Button */}
      <Button
        type="submit"
        disabled={!isDirty || isSubmitting}
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  )
}

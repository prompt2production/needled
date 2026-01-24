'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Loader2, Syringe, Scale, Activity } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface NotificationPreferences {
  id: string
  userId: string
  injectionReminder: boolean
  weighInReminder: boolean
  habitReminder: boolean
  reminderTime: string
  habitReminderTime: string
  timezone: string
}

const COMMON_TIMEZONES = [
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
]

interface NotificationSettingsProps {
  hasEmail: boolean
}

export function NotificationSettings({ hasEmail }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences')
        if (!response.ok) throw new Error('Failed to fetch preferences')
        const data = await response.json()
        setPreferences(data)
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
        toast.error('Failed to load notification preferences')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  // Save preferences with debounce
  const savePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          injectionReminder: newPreferences.injectionReminder,
          weighInReminder: newPreferences.weighInReminder,
          habitReminder: newPreferences.habitReminder,
          reminderTime: newPreferences.reminderTime,
          habitReminderTime: newPreferences.habitReminderTime,
          timezone: newPreferences.timezone,
        }),
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      toast.success('Preferences saved')
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Update preference with debounce
  const updatePreference = useCallback((updates: Partial<NotificationPreferences>) => {
    if (!preferences) return

    const newPreferences = { ...preferences, ...updates }
    setPreferences(newPreferences)

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce save by 500ms
    debounceTimer.current = setTimeout(() => {
      savePreferences(newPreferences)
    }, 500)
  }, [preferences, savePreferences])

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-lime" />
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card className="border-border">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Failed to load notification preferences</p>
        </CardContent>
      </Card>
    )
  }

  const notificationsDisabled = !hasEmail

  return (
    <div className="space-y-6">
      {/* Email required notice */}
      {!hasEmail && (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="py-4">
            <p className="text-amber-400 text-sm">
              Email notifications require an email address. Add your email in your{' '}
              <a href="/profile" className="underline hover:text-amber-300">profile</a> to enable notifications.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification toggles */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Email Notifications</CardTitle>
          <CardDescription>Choose which reminders you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Injection Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-lime/10 flex items-center justify-center">
                <Syringe className="h-5 w-5 text-lime" />
              </div>
              <div>
                <Label className="text-white">Injection reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded on your injection day</p>
              </div>
            </div>
            <Switch
              checked={preferences.injectionReminder}
              onCheckedChange={(checked) => updatePreference({ injectionReminder: checked })}
              disabled={notificationsDisabled}
            />
          </div>

          {/* Weigh-in Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-lime/10 flex items-center justify-center">
                <Scale className="h-5 w-5 text-lime" />
              </div>
              <div>
                <Label className="text-white">Weigh-in reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to log your weekly weight</p>
              </div>
            </div>
            <Switch
              checked={preferences.weighInReminder}
              onCheckedChange={(checked) => updatePreference({ weighInReminder: checked })}
              disabled={notificationsDisabled}
            />
          </div>

          {/* Habit Reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-lime/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-lime" />
              </div>
              <div>
                <Label className="text-white">Daily habit reminders</Label>
                <p className="text-sm text-muted-foreground">Get reminded to log your daily habits</p>
              </div>
            </div>
            <Switch
              checked={preferences.habitReminder}
              onCheckedChange={(checked) => updatePreference({ habitReminder: checked })}
              disabled={notificationsDisabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Reminder times */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Reminder Times</CardTitle>
          <CardDescription>When should we send you reminders?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Morning reminder time */}
          <div className="grid gap-2">
            <Label htmlFor="reminderTime" className="text-muted-foreground">
              Injection & weigh-in reminder time
            </Label>
            <Input
              id="reminderTime"
              type="time"
              value={preferences.reminderTime}
              onChange={(e) => updatePreference({ reminderTime: e.target.value })}
              className="bg-input border-border text-white h-12 w-full max-w-[200px]"
              disabled={notificationsDisabled}
            />
          </div>

          {/* Evening habit reminder time */}
          <div className="grid gap-2">
            <Label htmlFor="habitReminderTime" className="text-muted-foreground">
              Daily habit reminder time
            </Label>
            <Input
              id="habitReminderTime"
              type="time"
              value={preferences.habitReminderTime}
              onChange={(e) => updatePreference({ habitReminderTime: e.target.value })}
              className="bg-input border-border text-white h-12 w-full max-w-[200px]"
              disabled={notificationsDisabled}
            />
          </div>

          {/* Timezone */}
          <div className="grid gap-2">
            <Label htmlFor="timezone" className="text-muted-foreground">
              Timezone
            </Label>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => updatePreference({ timezone: value })}
              disabled={notificationsDisabled}
            >
              <SelectTrigger className="bg-input border-border text-white h-12 w-full max-w-[300px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      )}
    </div>
  )
}

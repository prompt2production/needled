'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileSettingsForm } from '@/components/settings/ProfileSettingsForm'
import { EmailUpdateForm } from '@/components/settings/EmailUpdateForm'
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm'
import { ExportDataButton } from '@/components/settings/ExportDataButton'
import { DeleteAccountButton } from '@/components/settings/DeleteAccountButton'
import { NotificationSettings } from '@/components/notifications/NotificationSettings'

export interface SettingsData {
  id: string
  name: string
  email: string | null
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
  medication: 'OZEMPIC' | 'WEGOVY' | 'MOUNJARO' | 'ZEPBOUND' | 'OTHER'
  injectionDay: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.status === 401) {
        router.replace('/login')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [router])

  const handleProfileUpdate = (updatedData: Partial<SettingsData>) => {
    if (settings) {
      setSettings({ ...settings, ...updatedData })
    }
  }

  const handleEmailUpdate = (newEmail: string) => {
    if (settings) {
      setSettings({ ...settings, email: newEmail })
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="pt-16 px-6">
          <div className="max-w-5xl mx-auto py-6">
            <header className="mb-6">
              <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Profile skeleton */}
                <Card className="border-border">
                  <CardHeader>
                    <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                  </CardContent>
                </Card>
                {/* Account skeleton */}
                <Card className="border-border">
                  <CardHeader>
                    <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                  </CardContent>
                </Card>
              </div>
              {/* Right Column */}
              <div className="space-y-6">
                {/* Notifications skeleton */}
                <Card className="border-border">
                  <CardHeader>
                    <div className="h-5 w-28 bg-white/5 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                  </CardContent>
                </Card>
                {/* Data skeleton */}
                <Card className="border-border">
                  <CardHeader>
                    <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 bg-white/5 rounded animate-pulse" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!settings) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load settings</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-16 px-6">
        <div className="max-w-5xl mx-auto py-6">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-white">Settings</h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Settings */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfileSettingsForm
                    settings={settings}
                    onUpdate={handleProfileUpdate}
                  />
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <EmailUpdateForm
                    currentEmail={settings.email}
                    onUpdate={handleEmailUpdate}
                  />
                  <div className="border-t border-border pt-6">
                    <PasswordChangeForm />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Notifications */}
              <NotificationSettings hasEmail={!!settings.email} />

              {/* Data Settings */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ExportDataButton />
                  <div className="border-t border-border pt-4">
                    <DeleteAccountButton />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

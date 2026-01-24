'use client'

import type { SettingsData } from '@/app/settings/page'

interface ProfileSettingsFormProps {
  settings: SettingsData
  onUpdate: (data: Partial<SettingsData>) => void
}

export function ProfileSettingsForm({ settings, onUpdate }: ProfileSettingsFormProps) {
  // Placeholder - will be implemented in SETTINGS-009
  return (
    <div className="text-muted-foreground text-sm">
      Profile form will be implemented in next story
    </div>
  )
}

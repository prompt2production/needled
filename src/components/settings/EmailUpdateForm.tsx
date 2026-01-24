'use client'

interface EmailUpdateFormProps {
  currentEmail: string | null
  onUpdate: (newEmail: string) => void
}

export function EmailUpdateForm({ currentEmail, onUpdate }: EmailUpdateFormProps) {
  // Placeholder - will be implemented in SETTINGS-010
  return (
    <div className="text-muted-foreground text-sm">
      Email form will be implemented in next story
    </div>
  )
}

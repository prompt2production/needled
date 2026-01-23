'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NameStepProps {
  onNext: (data: { name: string }) => void
  defaultValue?: string
}

export function NameStep({ onNext, defaultValue = '' }: NameStepProps) {
  const [name, setName] = useState(defaultValue)

  const isValid = name.trim().length >= 2

  const handleSubmit = () => {
    if (isValid) {
      onNext({ name: name.trim() })
    }
  }

  return (
    <div className="flex flex-col px-4 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          What should we call you?
        </h1>
        <p className="text-muted-foreground text-sm">
          We'll use this to personalize your experience
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="sr-only">
          Your name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-input border-border text-white text-lg h-12"
          autoComplete="given-name"
          autoFocus
        />
      </div>

      {/* CTA */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </Button>
    </div>
  )
}

'use client'

import { Syringe } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center text-center px-4 space-y-8">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center">
        <Syringe className="h-10 w-10 text-lime" />
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-white">Needled</h1>
        <p className="text-lg text-lime font-medium">Your journey companion</p>
      </div>

      {/* Subtext */}
      <p className="text-muted-foreground text-sm max-w-xs">
        Track your injections, celebrate your progress, and build healthy habits—all in one place.
      </p>

      {/* CTA */}
      <Button
        type="submit"
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full max-w-xs h-12 text-base"
      >
        Get Started
      </Button>
    </form>
  )
}

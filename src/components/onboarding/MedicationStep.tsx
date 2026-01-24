'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const MEDICATIONS = [
  { value: 'OZEMPIC', label: 'Ozempic' },
  { value: 'WEGOVY', label: 'Wegovy' },
  { value: 'MOUNJARO', label: 'Mounjaro' },
  { value: 'ZEPBOUND', label: 'Zepbound' },
  { value: 'OTHER', label: 'Other' },
] as const

const DAYS = [
  { value: 0, label: 'M' },
  { value: 1, label: 'T' },
  { value: 2, label: 'W' },
  { value: 3, label: 'T' },
  { value: 4, label: 'F' },
  { value: 5, label: 'S' },
  { value: 6, label: 'S' },
] as const

interface MedicationStepProps {
  onNext: (data: { medication: string; injectionDay: number }) => void
  defaultMedication?: string | null
  defaultDay?: number | null
}

export function MedicationStep({
  onNext,
  defaultMedication = null,
  defaultDay = null,
}: MedicationStepProps) {
  const [medication, setMedication] = useState<string | null>(defaultMedication)
  const [injectionDay, setInjectionDay] = useState<number | null>(defaultDay)

  const isValid = medication !== null && injectionDay !== null

  const handleSubmit = () => {
    if (isValid) {
      onNext({ medication, injectionDay })
    }
  }

  return (
    <div className="flex flex-col px-4 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Final step
        </h1>
        <p className="text-muted-foreground text-sm">
          Tell us about your medication
        </p>
      </div>

      {/* Medication selection */}
      <div className="space-y-4">
        <label className="text-sm text-muted-foreground mb-2 block">
          Which medication are you taking?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MEDICATIONS.map((med) => (
            <button
              key={med.value}
              type="button"
              onClick={() => setMedication(med.value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                medication === med.value
                  ? 'bg-lime text-black'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              {med.label}
            </button>
          ))}
        </div>
      </div>

      {/* Injection day selection */}
      <div className="space-y-4">
        <label className="text-sm text-muted-foreground">
          What day do you take your injection?
        </label>
        <div className="flex justify-center gap-2">
          {DAYS.map((day, index) => (
            <button
              key={`${day.label}-${index}`}
              type="button"
              onClick={() => setInjectionDay(day.value)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                injectionDay === day.value
                  ? 'bg-lime text-black'
                  : 'border border-white/20 text-white/70 hover:bg-white/5'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Complete Setup
      </Button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WelcomeStep } from '@/components/onboarding/WelcomeStep'
import { NameStep } from '@/components/onboarding/NameStep'
import { StartWeightStep } from '@/components/onboarding/StartWeightStep'

const TOTAL_STEPS = 5

interface OnboardingData {
  name: string
  startWeight: number | null
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
  medication: string | null
  injectionDay: number | null
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    startWeight: null,
    goalWeight: null,
    weightUnit: 'kg',
    medication: null,
    injectionDay: null,
  })

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="px-4 pt-safe flex-1 flex flex-col">
        {/* Header with back button and progress */}
        <header className="py-4 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-muted-foreground hover:text-white hover:bg-white/5"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : (
            <div className="w-10" /> // Spacer for alignment
          )}

          {/* Progress indicator - dots */}
          <div className="flex gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 === currentStep
                    ? 'bg-lime'
                    : i + 1 < currentStep
                    ? 'bg-lime/50'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Step content area */}
        <div className="flex-1 flex flex-col justify-center pb-20">
          {currentStep === 1 && (
            <WelcomeStep onNext={handleNext} />
          )}
          {currentStep === 2 && (
            <NameStep
              onNext={(data) => {
                updateFormData(data)
                handleNext()
              }}
              defaultValue={formData.name}
            />
          )}
          {currentStep === 3 && (
            <StartWeightStep
              onNext={(data) => {
                updateFormData(data)
                handleNext()
              }}
              defaultWeight={formData.startWeight}
              defaultUnit={formData.weightUnit}
            />
          )}
          {currentStep === 4 && (
            <StepContent
              title="Goal Weight"
              description="This is Step 4"
              onNext={handleNext}
            />
          )}
          {currentStep === 5 && (
            <StepContent
              title="Medication"
              description="This is Step 5"
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </main>
  )
}

// Temporary placeholder component - will be replaced with actual step components
function StepContent({
  title,
  description,
  onNext,
}: {
  title: string
  description: string
  onNext: () => void
}) {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Button
        onClick={onNext}
        className="bg-lime text-black hover:bg-lime-muted font-medium"
      >
        Continue
      </Button>
    </div>
  )
}

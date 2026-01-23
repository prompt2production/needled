'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WelcomeStep } from '@/components/onboarding/WelcomeStep'
import { NameStep } from '@/components/onboarding/NameStep'
import { StartWeightStep } from '@/components/onboarding/StartWeightStep'
import { GoalWeightStep } from '@/components/onboarding/GoalWeightStep'
import { MedicationStep } from '@/components/onboarding/MedicationStep'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const TOTAL_STEPS = 5
const STORAGE_KEY = 'needled_onboarding_progress'

interface OnboardingData {
  name: string
  startWeight: number | null
  goalWeight: number | null
  weightUnit: 'kg' | 'lbs'
  medication: string | null
  injectionDay: number | null
}

interface StoredProgress {
  step: number
  data: OnboardingData
}

const defaultFormData: OnboardingData = {
  name: '',
  startWeight: null,
  goalWeight: null,
  weightUnit: 'kg',
  medication: null,
  injectionDay: null,
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<OnboardingData>(defaultFormData)

  // Load saved progress on mount and check for existing user
  useEffect(() => {
    // Check if user already has a profile
    const userId = localStorage.getItem('userId')
    if (userId) {
      router.replace('/home')
      return
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: StoredProgress = JSON.parse(saved)
        setCurrentStep(parsed.step)
        setFormData(parsed.data)
      }
    } catch {
      // Ignore parsing errors, start fresh
    }
    setIsLoading(false)
  }, [router])

  // Auto-redirect after success
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        router.replace('/home')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isComplete, router])

  // Save progress when step or data changes
  const saveProgress = (step: number, data: OnboardingData) => {
    try {
      const progress: StoredProgress = { step, data }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Ignore storage errors
    }
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      saveProgress(nextStep, formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      saveProgress(prevStep, formData)
    }
  }

  const updateFormData = (data: Partial<OnboardingData>) => {
    const newData = { ...formData, ...data }
    setFormData(newData)
    saveProgress(currentStep, newData)
  }

  const clearProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  }

  const handleSubmit = async (medicationData: { medication: string; injectionDay: number }) => {
    const finalData = { ...formData, ...medicationData }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalData.name,
          startWeight: finalData.startWeight,
          goalWeight: finalData.goalWeight,
          weightUnit: finalData.weightUnit,
          medication: finalData.medication,
          injectionDay: finalData.injectionDay,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create profile')
      }

      const user = await response.json()

      // Store user ID in localStorage
      localStorage.setItem('userId', user.id)

      // Clear onboarding progress
      clearProgress()

      // Update local state with final data for success screen
      setFormData(finalData)

      // Show success screen
      setIsComplete(true)
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Could not save your profile. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state while checking localStorage
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-lime animate-spin mx-auto" />
        </div>
      </main>
    )
  }

  // Success screen
  if (isComplete) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-lime/10 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-lime" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">
              You're all set, {formData.name}!
            </h1>
            <p className="text-muted-foreground text-sm">
              Your profile is ready. Let's start your journey.
            </p>
          </div>
        </div>
      </main>
    )
  }

  // Loading screen during submission
  if (isSubmitting) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 text-lime animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Setting up your profile...</p>
        </div>
      </main>
    )
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
          {currentStep === 4 && formData.startWeight && (
            <GoalWeightStep
              onNext={(data) => {
                updateFormData(data)
                handleNext()
              }}
              startWeight={formData.startWeight}
              weightUnit={formData.weightUnit}
              defaultValue={formData.goalWeight}
            />
          )}
          {currentStep === 5 && (
            <MedicationStep
              onNext={handleSubmit}
              defaultMedication={formData.medication}
              defaultDay={formData.injectionDay}
            />
          )}
        </div>
      </div>
    </main>
  )
}

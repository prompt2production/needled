'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { testerConfig } from '@/config/tester'
import {
  Download,
  Smartphone,
  Shield,
  FolderOpen,
  CheckCircle,
  Sparkles,
  Loader2,
  Mail,
  ArrowLeft,
} from 'lucide-react'
import { Footer } from '@/components/Footer'

type Step = 'intro' | 'ios-signup' | 'ios-complete' | 'android-signup' | 'android-download'

export default function LandingPage() {
  const [step, setStep] = useState<Step>('intro')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handlePlatformSelect = (platform: 'ios' | 'android') => {
    setEmail('')
    setError('')
    setStep(platform === 'ios' ? 'ios-signup' : 'android-signup')
  }

  const handleEmailSubmit = async (platform: 'IOS' | 'ANDROID') => {
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/beta-testers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), platform }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error && Array.isArray(data.error)) {
          setError(data.error[0]?.message || 'Invalid email address')
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      setStep(platform === 'IOS' ? 'ios-complete' : 'android-download')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep('intro')
    setEmail('')
    setError('')
  }

  return (
    <main className="min-h-screen bg-[#14B8A6] flex flex-col">
      <div className="flex-1 flex flex-col px-6">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center py-12 max-w-4xl mx-auto w-full">
          {/* Pip Mascot with floating animation */}
          <div className="animate-float mb-6">
            <Image
              src="/pip/pip-cheerful.png"
              alt="Pip, your friendly GLP-1 journey companion"
              width={160}
              height={160}
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-lg"
              priority
            />
          </div>

          {/* Brand */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-center">
            Welcome to the Needled Beta
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 text-center">
            You&apos;re among the first to try our GLP-1 journey companion
          </p>

          {/* Step Content */}
          {step === 'intro' && (
            <IntroStep onSelectPlatform={handlePlatformSelect} />
          )}

          {step === 'ios-signup' && (
            <EmailSignupStep
              platform="ios"
              email={email}
              setEmail={setEmail}
              error={error}
              isSubmitting={isSubmitting}
              onSubmit={() => handleEmailSubmit('IOS')}
              onBack={handleBack}
            />
          )}

          {step === 'ios-complete' && (
            <IOSCompleteStep email={email} onBack={handleBack} />
          )}

          {step === 'android-signup' && (
            <EmailSignupStep
              platform="android"
              email={email}
              setEmail={setEmail}
              error={error}
              isSubmitting={isSubmitting}
              onSubmit={() => handleEmailSubmit('ANDROID')}
              onBack={handleBack}
            />
          )}

          {step === 'android-download' && (
            <AndroidDownloadStep email={email} onBack={handleBack} />
          )}

          {/* Feature highlights */}
          <div className="grid gap-4 md:grid-cols-3 w-full max-w-3xl mt-12">
            <FeatureCard
              iconSrc="/icons/injection.png"
              iconAlt="Injection tracking icon"
              title="Track Injections"
              description="Never miss a dose"
            />
            <FeatureCard
              iconSrc="/icons/weigh-in.png"
              iconAlt="Weigh-in tracking icon"
              title="Weekly Weigh-ins"
              description="See your progress"
            />
            <FeatureCard
              habitIcons={[
                { src: '/icons/water.png', alt: 'Hydration habit' },
                { src: '/icons/nutrition.png', alt: 'Nutrition habit' },
                { src: '/icons/exercise.png', alt: 'Exercise habit' },
              ]}
              title="Build Habits"
              description="Hydration, nutrition & movement"
            />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}

function IntroStep({ onSelectPlatform }: { onSelectPlatform: (platform: 'ios' | 'android') => void }) {
  return (
    <div className="w-full max-w-md space-y-6">
      {/* Beta Status Card */}
      <div className="bg-white/95 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[#14B8A6]" />
          <h2 className="text-xl font-semibold text-gray-800">Join the Beta Program</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Thank you for your interest in testing Needled! As a beta tester, you&apos;ll get early access to:
        </p>
        <ul className="space-y-2 text-gray-700 mb-6">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#14B8A6] flex-shrink-0" />
            <span>Injection tracking with reminders</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#14B8A6] flex-shrink-0" />
            <span>Weekly weigh-in tracking</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#14B8A6] flex-shrink-0" />
            <span>Daily habit check-ins</span>
          </li>
        </ul>

        <p className="text-sm font-medium text-gray-800 mb-3">What phone do you have?</p>
        <div className="space-y-3">
          <Button
            onClick={() => onSelectPlatform('android')}
            className="w-full h-12 rounded-full bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
            I have an Android phone
          </Button>

          <Button
            onClick={() => onSelectPlatform('ios')}
            variant="outline"
            className="w-full h-12 rounded-full border-2 border-[#14B8A6] bg-white text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white font-semibold transition-colors"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            I have an iPhone
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmailSignupStep({
  platform,
  email,
  setEmail,
  error,
  isSubmitting,
  onSubmit,
  onBack,
}: {
  platform: 'ios' | 'android'
  email: string
  setEmail: (email: string) => void
  error: string
  isSubmitting: boolean
  onSubmit: () => void
  onBack: () => void
}) {
  const isIOS = platform === 'ios'

  return (
    <div className="w-full max-w-md space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="bg-white/95 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-[#14B8A6]" />
          <h2 className="text-xl font-semibold text-gray-800">
            {isIOS ? 'Join the iOS Waitlist' : 'Join the Android Beta'}
          </h2>
        </div>

        {isIOS ? (
          <p className="text-gray-600 mb-6">
            The iOS version is coming soon! Enter your email and we&apos;ll notify you as soon as it&apos;s ready for testing.
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            Enter your email to join the beta program. Once registered, you&apos;ll get access to download the app.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              className="h-12 rounded-xl border-gray-200 focus:border-[#14B8A6] focus:ring-[#14B8A6]"
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing up...
              </>
            ) : isIOS ? (
              'Join Waitlist'
            ) : (
              'Get Access'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function IOSCompleteStep({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="w-full max-w-md space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <div className="bg-white/95 rounded-2xl p-6 shadow-lg text-center">
        <div className="w-16 h-16 rounded-full bg-[#14B8A6]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-[#14B8A6]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">You&apos;re on the list!</h2>
        <p className="text-gray-600 mb-4">
          We&apos;ll send an email to <strong className="text-gray-800">{email}</strong> as soon as the iOS version is ready for testing.
        </p>
        <p className="text-sm text-gray-500">
          In the meantime, feel free to share Needled with friends who have Android phones!
        </p>
      </div>
    </div>
  )
}

function AndroidDownloadStep({ email, onBack }: { email: string; onBack: () => void }) {
  return (
    <div className="w-full max-w-2xl space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Success + Download Card */}
      <div className="bg-white/95 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-5 w-5 text-[#14B8A6]" />
          <h2 className="text-xl font-semibold text-gray-800">Welcome to the Beta!</h2>
        </div>
        <p className="text-gray-600 mb-6">
          You&apos;re registered as <strong className="text-gray-800">{email}</strong>. Download the app below to get started.
        </p>

        <Button
          asChild
          className="w-full h-14 rounded-full bg-[#14B8A6] hover:bg-[#0d9488] text-white font-semibold text-lg shadow-lg mb-3"
        >
          <a href={testerConfig.apkDownloadUrl} className="flex items-center justify-center gap-3">
            <Download className="h-5 w-5" />
            Download APK
          </a>
        </Button>

        <div className="flex justify-center">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            v{testerConfig.version} · Android {testerConfig.minAndroidVersion}+
          </span>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-white/95 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-[#14B8A6]" />
          <h2 className="text-xl font-semibold text-gray-800">How to Install</h2>
        </div>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-500" />
                Download the APK file
              </p>
              <p className="text-sm text-gray-600">Tap the &quot;Download APK&quot; button above</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-semibold">
              2
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                Enable &quot;Unknown Sources&quot;
              </p>
              <p className="text-sm text-gray-600">Go to Settings → Security → Enable &quot;Install unknown apps&quot; for your browser</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-semibold">
              3
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gray-500" />
                Open the downloaded file
              </p>
              <p className="text-sm text-gray-600">Find it in your Downloads folder or notification bar</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-semibold">
              4
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-gray-500" />
                Tap &quot;Install&quot; when prompted
              </p>
              <p className="text-sm text-gray-600">Your phone may ask you to confirm the installation</p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-sm font-semibold">
              5
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gray-500" />
                Open Needled and create your account
              </p>
              <p className="text-sm text-gray-600">You&apos;re ready to start your journey!</p>
            </div>
          </li>
        </ol>
        <p className="text-xs text-gray-500 mt-4 bg-gray-100 p-3 rounded-lg">
          <strong>Note:</strong> If you use Chrome, the APK will be in your Downloads folder. You can also tap the download notification to open it directly.
        </p>
      </div>
    </div>
  )
}

function FeatureCard({
  iconSrc,
  iconAlt,
  habitIcons,
  title,
  description,
}: {
  iconSrc?: string
  iconAlt?: string
  habitIcons?: { src: string; alt: string }[]
  title: string
  description: string
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/95 shadow-lg">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center">
        {iconSrc && (
          <Image
            src={iconSrc}
            alt={iconAlt || title}
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
        )}
        {habitIcons && (
          <div className="flex -space-x-1">
            {habitIcons.map((icon, index) => (
              <Image
                key={icon.src}
                src={icon.src}
                alt={icon.alt}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                style={{ zIndex: habitIcons.length - index }}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

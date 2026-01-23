'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Syringe, Scale, Droplets, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      setIsLoggedIn(true)
      router.replace('/home')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading && !isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-lime animate-spin" />
      </main>
    )
  }

  if (isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 text-lime animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Redirecting to your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center py-12 max-w-4xl mx-auto w-full">
          {/* Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime/10 mb-6">
              <Syringe className="h-8 w-8 text-lime" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Needled
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
              Your GLP-1 journey companion
            </p>
          </div>

          {/* Value Props - horizontal grid on desktop */}
          <div className="grid gap-4 md:grid-cols-3 mb-12">
            <FeatureItem
              icon={<Syringe className="h-5 w-5" />}
              title="Track your injections"
              description="Never miss a dose with smart reminders"
            />
            <FeatureItem
              icon={<Scale className="h-5 w-5" />}
              title="Weekly weigh-ins"
              description="See your progress without obsessing"
            />
            <FeatureItem
              icon={<Droplets className="h-5 w-5" />}
              title="Build healthy habits"
              description="Daily check-ins for hydration, nutrition & movement"
            />
          </div>

          {/* CTAs - constrained width on desktop */}
          <div className="max-w-sm mx-auto w-full space-y-3">
            <Button
              asChild
              className="w-full h-12 bg-lime text-black hover:bg-lime-muted font-medium text-base"
            >
              <Link href="/onboarding">
                Get Started
                <ChevronRight className="h-5 w-5 ml-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-white hover:bg-white/5"
            >
              <Link href="/login">
                I already have an account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex md:flex-col items-start md:items-center md:text-center gap-4 p-4 rounded-xl bg-card border border-border">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center text-lime">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-white mb-0.5">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

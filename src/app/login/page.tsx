'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccount, setHasAccount] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      setHasAccount(true)
      router.replace('/home')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading && !hasAccount) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-lime animate-spin" />
      </main>
    )
  }

  if (hasAccount) {
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
      <div className="flex-1 flex flex-col px-6 max-w-md mx-auto w-full">
        {/* Header */}
        <header className="py-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white hover:bg-white/5"
          >
            <Link href="/" aria-label="Go back">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">
                No account found
              </h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                We couldn't find an existing account on this device. Create a new account to get started.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                asChild
                className="w-full h-12 bg-lime text-black hover:bg-lime-muted font-medium"
              >
                <Link href="/onboarding">
                  Create Account
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground">
                Previously onboarded on a different device?<br />
                Cloud sync coming soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

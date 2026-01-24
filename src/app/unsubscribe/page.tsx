'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Syringe, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type UnsubscribeStatus = 'loading' | 'success' | 'error'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<UnsubscribeStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('No unsubscribe token provided')
      return
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(`/api/notifications/unsubscribe?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setErrorMessage(data.error || 'Failed to unsubscribe')
          return
        }

        setStatus('success')
      } catch {
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <main className="min-h-screen bg-background">
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Syringe className="h-8 w-8 text-lime" />
            <span className="text-2xl font-semibold text-white">Needled</span>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin text-lime mx-auto mb-4" />
                  <CardTitle className="text-xl text-white">Unsubscribing...</CardTitle>
                  <CardDescription>Please wait while we process your request</CardDescription>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-12 w-12 text-lime mx-auto mb-4" />
                  <CardTitle className="text-xl text-white">You&apos;ve been unsubscribed</CardTitle>
                  <CardDescription>
                    You will no longer receive email notifications from Needled.
                  </CardDescription>
                </>
              )}

              {status === 'error' && (
                <>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <CardTitle className="text-xl text-white">Unsubscribe failed</CardTitle>
                  <CardDescription className="text-red-400">
                    {errorMessage}
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="text-center">
              {status === 'success' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Changed your mind? You can re-enable notifications anytime in your settings.
                  </p>
                  <Button asChild className="bg-lime text-black hover:bg-lime-muted font-medium">
                    <Link href="/settings">Go to Settings</Link>
                  </Button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    The unsubscribe link may have expired or is invalid. You can manage your notification preferences directly in the app.
                  </p>
                  <Button asChild className="bg-lime text-black hover:bg-lime-muted font-medium">
                    <Link href="/settings">Go to Settings</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

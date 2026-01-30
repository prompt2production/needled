'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

type UnsubscribeStatus = 'loading' | 'success' | 'error'

function UnsubscribeContent() {
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
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="text-center pt-8">
        {status === 'loading' && (
          <>
            <div className="animate-float mx-auto mb-4">
              <Image
                src="/pip/pip-curious.png"
                alt="Pip is thinking"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-[#14B8A6] mx-auto mb-2" />
            <CardTitle className="text-xl text-gray-800">Unsubscribing...</CardTitle>
            <CardDescription className="text-gray-600">Please wait while we process your request</CardDescription>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="animate-float mx-auto mb-4">
              <Image
                src="/pip/pip-missing.png"
                alt="Pip will miss you"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-xl text-gray-800">We&apos;ll miss you!</CardTitle>
            <CardDescription className="text-gray-600">
              You&apos;ve been unsubscribed from email notifications.
            </CardDescription>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="animate-float mx-auto mb-4">
              <Image
                src="/pip/pip-curious.png"
                alt="Pip is confused"
                width={100}
                height={100}
                className="w-24 h-24 object-contain"
              />
            </div>
            <CardTitle className="text-xl text-gray-800">Oops! Something went wrong</CardTitle>
            <CardDescription className="text-red-500">
              {errorMessage}
            </CardDescription>
          </>
        )}
      </CardHeader>

      <CardContent className="text-center pb-8">
        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Changed your mind? You can re-enable notifications anytime in the Needled app.
            </p>
            <Button asChild className="bg-[#14B8A6] text-white hover:bg-[#0D9488] font-semibold rounded-full px-6">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              The unsubscribe link may have expired or is invalid. You can manage your notification preferences in the Needled app.
            </p>
            <Button asChild className="bg-[#14B8A6] text-white hover:bg-[#0D9488] font-semibold rounded-full px-6">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingCard() {
  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="text-center pt-8">
        <div className="animate-float mx-auto mb-4">
          <Image
            src="/pip/pip-curious.png"
            alt="Pip is thinking"
            width={100}
            height={100}
            className="w-24 h-24 object-contain"
          />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#14B8A6] mx-auto mb-2" />
        <CardTitle className="text-xl text-gray-800">Loading...</CardTitle>
        <CardDescription className="text-gray-600">Please wait</CardDescription>
      </CardHeader>
    </Card>
  )
}

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[#14B8A6]">
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Brand header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Needled</h1>
          </div>

          <Suspense fallback={<LoadingCard />}>
            <UnsubscribeContent />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

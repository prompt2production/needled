'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Syringe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid email or password')
        } else if (data.error) {
          setError(typeof data.error === 'string' ? data.error : 'Invalid credentials')
        } else {
          setError('Something went wrong. Please try again.')
        }
        return
      }

      // Save user ID to localStorage for dashboard
      localStorage.setItem('userId', data.id)

      // Success - show toast and redirect to dashboard
      toast.success('Welcome back!', {
        description: 'You have been logged in successfully.',
      })
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = email.trim() !== '' && password.trim() !== ''

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
              <CardTitle className="text-xl text-white">Welcome back</CardTitle>
              <CardDescription>Sign in to continue your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-input border-border text-white h-12"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-muted-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-input border-border text-white h-12"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-lime text-black hover:bg-lime-muted font-medium h-12"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign up link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            New here?{' '}
            <Link href="/onboarding" className="text-lime hover:text-lime-muted transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

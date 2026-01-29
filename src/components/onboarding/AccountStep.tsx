'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AccountStepProps {
  onNext: (data: { email: string; password: string }) => void
  defaultEmail?: string
  defaultPassword?: string
}

export function AccountStep({
  onNext,
  defaultEmail = '',
  defaultPassword = '',
}: AccountStepProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [password, setPassword] = useState(defaultPassword)
  const [passwordConfirm, setPasswordConfirm] = useState(defaultPassword)
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    passwordConfirm: false,
  })

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isEmailValid = emailRegex.test(email)
  const isPasswordValid = password.length >= 8
  const doPasswordsMatch = password === passwordConfirm

  const isValid = isEmailValid && isPasswordValid && doPasswordsMatch

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext({ email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 space-y-8">
      {/* Heading */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-white">
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">
          Set up your email and password to secure your data
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {/* Email */}
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
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            className="bg-input border-border text-white h-12"
            autoComplete="email"
            autoFocus
          />
          {touched.email && !isEmailValid && email.length > 0 && (
            <p className="text-sm text-red-400">Please enter a valid email address</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-muted-foreground">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            className="bg-input border-border text-white h-12"
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters
          </p>
          {touched.password && !isPasswordValid && password.length > 0 && (
            <p className="text-sm text-red-400">Password must be at least 8 characters</p>
          )}
        </div>

        {/* Password confirmation */}
        <div className="space-y-2">
          <Label htmlFor="passwordConfirm" className="text-muted-foreground">
            Confirm password
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="Confirm your password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, passwordConfirm: true }))}
            className="bg-input border-border text-white h-12"
            autoComplete="new-password"
          />
          {touched.passwordConfirm && !doPasswordsMatch && passwordConfirm.length > 0 && (
            <p className="text-sm text-red-400">Passwords do not match</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        disabled={!isValid}
        className="bg-lime text-black hover:bg-lime-muted font-medium w-full h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </Button>
    </form>
  )
}

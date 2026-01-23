'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string | null
  startWeight: number
  goalWeight: number | null
  weightUnit: string
  medication: string
  injectionDay: number
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Fetch session status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const user = await response.json()
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    checkSession()
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear local user ID
        localStorage.removeItem('userId')

        toast.success('Logged out', {
          description: 'You have been logged out successfully.',
        })

        // Update state
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })

        // Redirect to home page
        router.push('/')
      } else {
        toast.error('Logout failed', {
          description: 'Please try again.',
        })
      }
    } catch {
      toast.error('Logout failed', {
        description: 'Please try again.',
      })
    }
  }, [router])

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    logout,
  }
}

'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

// Routes that should NOT show the header (public/onboarding routes)
const PUBLIC_ROUTES = ['/', '/login', '/onboarding']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <div className="pt-16">{children}</div>
    </>
  )
}
